import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.role !== "SUPERUSER" && session.role !== "ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, price, description, image, categoryId, variants } = body;

    console.log("Received variants:", JSON.stringify(variants, null, 2));

    // Sebelum proses, log semua variant yang masuk
    for (const v of variants) {
      console.log(
        `Variant: id=${v.id}, isActive=${v.isActive}, isDeleted=${v.isDeleted}`,
      );
    }

    // 🔥 VALIDASI DUPLIKAT SIZE + COLOR
    const combinationSet = new Set();

    for (const v of variants) {
      if (v.isDeleted) continue; // skip yang dihapus

      const key = `${v.size}-${v.color || ""}`;

      if (combinationSet.has(key)) {
        return NextResponse.json(
          { error: "Duplicate variant (size + color)" },
          { status: 400 },
        );
      }

      combinationSet.add(key);
    }

    const product = await prisma.$transaction(async (tx) => {
      // 🔥 ambil semua variant lama
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
      });

      const existingMap = new Map(existingVariants.map((v) => [v.id, v]));

      const incomingIds = variants
        .filter((v: any) => v.id)
        .map((v: any) => v.id);

      console.log("incomingIds:", incomingIds);

      for (const v of variants) {
        // 🔥 HANDLE DELETE
        if (v.isDeleted && v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { isActive: false },
          });
          continue;
        }

        // 🔥 HANDLE UPDATE
        if (v.id) {
          // 🔥 cek apakah sudah dipakai order
          const used = await tx.orderItem.findFirst({
            where: { productVariantId: v.id },
          });

          if (used) {
            // ❗ hanya boleh update stock
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                stock: parseInt(v.stock),
                isActive: true,
              },
            });
            continue;
          }

          // ✔️ update normal
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              size: v.size,
              stock: parseInt(v.stock),
              color: v.color || null,
              isActive: true,
            },
          });
        } else {
          // 🔥 HANDLE CREATE
          await tx.productVariant.create({
            data: {
              productId: id,
              size: v.size,
              stock: parseInt(v.stock),
              color: v.color || null,
              isActive: true,
            },
          });
        }
      }

      // 🔥 3. update product
      return await tx.product.update({
        where: { id },
        data: {
          title,
          price: parseInt(price), // ✅ FIX INT
          description,
          image,
          categoryId,
        },
        include: {
          category: true,
          variants: {
            where: { isActive: true }, // ✅ hanya aktif
          },
        },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.role !== "SUPERUSER" && session.role !== "ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // Cek apakah product memiliki order items
    const productWithOrders = await prisma.product.findFirst({
      where: {
        id,
        variants: {
          some: {
            orderItems: {
              some: {},
            },
          },
        },
      },
      include: {
        variants: {
          include: {
            orderItems: {
              take: 1, // cukup cek 1 saja
            },
          },
        },
      },
    });

    if (
      productWithOrders &&
      productWithOrders.variants.some((v) => v.orderItems.length > 0)
    ) {
      return NextResponse.json(
        {
          error: "CANNOT_DELETE",
          message:
            "Cannot delete product because it has existing orders in history. Deleting would corrupt order records.",
        },
        { status: 409 }, // Conflict status code
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
