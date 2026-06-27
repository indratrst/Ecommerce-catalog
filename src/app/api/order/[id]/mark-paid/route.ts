import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { payment_type, transaction_id } = body;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Jika sudah SETTLEMENT atau stock sudah dikurangi, return early
      if (order.status === OrderStatus.SETTLEMENT || order.stockReduced) {
        console.log(
          `Order ${id} already processed. Status: ${order.status}, StockReduced: ${order.stockReduced}`,
        );
        return { alreadyProcessed: true };
      }

      // Hanya lakukan jika masih PENDING
      if (order.status !== "PENDING") {
        console.log(`Order ${id} status is ${order.status}, not PENDING`);
        return { alreadyProcessed: true };
      }

      // Kurangi stock jika belum dikurangi
      for (const item of order.items) {
        const updatedVariant = await tx.productVariant.updateMany({
          where: {
            id: item.productVariantId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updatedVariant.count === 0) {
          throw new Error(
            `Stok untuk varian ${item.productVariantId} tidak mencukupi`,
          );
        }
      }

      // Update order status menjadi SETTLEMENT
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.SETTLEMENT,
          stockReduced: true,
          externalId: transaction_id || order.externalId,
          paymentMethod: payment_type || order.paymentMethod,
        },
      });

      return { alreadyProcessed: false, order: updatedOrder };
    });

    return NextResponse.json({
      success: true,
      message: result.alreadyProcessed
        ? "Order already processed"
        : "Order status updated to SETTLEMENT",
      ...result,
    });
  } catch (error: unknown) {
    console.error("Error marking order as paid:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
