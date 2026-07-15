import { getSession } from "@/lib/auth";
import { sendOrderPickedUpEmail, sendPickupReadyEmail } from "@/lib/nodemailer";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Mengambil ID order dari URL parameter
    const { id } = await params;

    const body = await request.json();
    const { fulfillmentStatus } = body;

    // 1. Validasi apakah order tersebut ada di database
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { productVariant: { include: { product: true } } } },
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order tidak ditemukan" },
        { status: 404 },
      );
    }
    // 1. Validasi Sesi: Pastikan yang melakukan adalah Admin/Staff
    const session = await getSession();
    if (
      !session ||
      (session.role !== "SUPERUSER" && session.role !== "ADMIN")
    ) {
      return NextResponse.json(
        { message: "Unauthorized: Hanya admin yang bisa melakukan aksi ini." },
        { status: 403 },
      );
    }

    // 2. Update Status
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        fulfillmentStatus: fulfillmentStatus || "PICKED_UP",
      },
    });
    // 4. LOGIKA EMAIL: Kirim email jika status berubah dari PROCESSING ke READY_TO_PICKUP
    // ================= TRIGGER EMAIL 1: READY TO PICKUP =================
    if (
      existingOrder.fulfillmentStatus === "PROCESSING" &&
      updatedOrder.fulfillmentStatus === "READY_TO_PICKUP"
    ) {
      if (existingOrder.customerEmail) {
        await sendPickupReadyEmail({
          to: existingOrder.customerEmail,
          orderId: id,
          customerName: existingOrder.customerName || "Customer",
          items: existingOrder.items,
          totalAmount: existingOrder.totalAmount || 0,
        });
      }
    }

    // ================= BARU: TRIGGER EMAIL 2: PICKED UP =================
    if (
      existingOrder.fulfillmentStatus === "READY_TO_PICKUP" &&
      updatedOrder.fulfillmentStatus === "PICKED_UP"
    ) {
      if (existingOrder.customerEmail) {
        await sendOrderPickedUpEmail({
          to: existingOrder.customerEmail,
          orderId: id,
          customerName: existingOrder.customerName || "Customer",
          items: existingOrder.items,
          totalAmount: existingOrder.totalAmount || 0,
        });
      }
    }

    // 5. TRIGGER EMAIL: Hanya jika status berubah dari PROCESSING ke READY_TO_PICKUP
    return NextResponse.json({
      message: "Status pengambilan berhasil diperbarui",
      order: updatedOrder,
    });
  } catch (error: unknown) {
    console.error("Pickup API Error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
