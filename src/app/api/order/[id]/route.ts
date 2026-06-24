import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: unknown) {
    // Gunakan pesan error yang lebih spesifik untuk debugging internal jika diperlukan
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
