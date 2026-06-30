import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // Mengambil ID order dari URL parameter
    const { id } = await params;

    const body = await request.json();
    const { fulfillmentStatus } = body;

    // 1. Validasi apakah order tersebut ada di database
    const existingOrder = await prisma.order.findUnique({
      where: { id },
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
