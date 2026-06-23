// app/api/products/route.ts
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod"; // 🔥 IMPORT ZOD
import { CreateProductSchema } from "@/lib/validation/products.schema";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");

    const where: {
      category?: { slug: string };
      OR?: Array<
        | { title: { contains: string; mode: "insensitive" } }
        | { description: { contains: string; mode: "insensitive" } }
        | { category: { name: { contains: string; mode: "insensitive" } } }
        | { category: { slug: { contains: string; mode: "insensitive" } } }
      >;
    } = {};
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        { category: { slug: { contains: search, mode: "insensitive" } } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// Schema untuk validation
// const CreateProductWithVariantsSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   price: z
//     .number()
//     .or(z.string())
//     .transform((val) => {
//       const num = typeof val === "string" ? parseFloat(val) : val;
//       if (isNaN(num)) throw new Error("Price must be a number");
//       return num;
//     }),
//   description: z.string().optional().default(""),
//   image: z.string().optional().nullable(),
//   categoryId: z.string().min(1, "Category is required"),
//   variants: z
//     .array(
//       z.object({
//         id: z.string().optional(),
//         size: z.string().min(1, "Size is required"),
//         stock: z
//           .number()
//           .or(z.string())
//           .transform((val) => {
//             const num = typeof val === "string" ? parseInt(val) : val;
//             return isNaN(num) ? 0 : num;
//           }),
//         color: z.string().optional().nullable(),
//       }),
//     )
//     .optional()
//     .default([]),
// });

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (
      !session ||
      (session.role !== "SUPERUSER" && session.role !== "ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("📦 Received body:", body); // Debug

    // Validate dengan Zod
    const validatedData = CreateProductSchema.parse(body);
    // console.log("✅ Validated data:", validatedData); // Debug

    const { title, price, description, image, categoryId, variants } =
      validatedData;

    // Cek category
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    // Create product dengan transaction (atomic)
    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          title,
          price,
          description: description || "",
          image: image || null,
          categoryId,
        },
      });

      // Create variants jika ada
      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            productId: newProduct.id,
            size: v.size,
            stock: v.stock,
            color: v.color || null,
            isActive: true,
          })),
        });
      }

      return newProduct;
    });

    // Ambil product lengkap dengan variants
    const productWithVariants = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        variants: true,
      },
    });

    console.log("🎉 Product created:", productWithVariants);
    return NextResponse.json(productWithVariants);
  } catch (error) {
    console.error("❌ Failed to create product:", error);

    if (error instanceof z.ZodError) {
      console.error("Zod validation errors:", error.issues);
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 },
    );
  }
}
