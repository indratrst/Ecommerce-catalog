import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FulfillmentStatus, PaymentStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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

      if (order.paymentStatus === PaymentStatus.SETTLEMENT) {
        const targetFulfillmentStatus =
          order.fulfillmentStatus === FulfillmentStatus.NOT_APPLICABLE
            ? FulfillmentStatus.PROCESSING
            : order.fulfillmentStatus;

        const updatedOrder = await tx.order.update({
          where: { id },
          data: {
            fulfillmentStatus: targetFulfillmentStatus,
          },
        });

        console.log(
          `Order ${id} already settled. Ensured fulfillmentStatus is ${updatedOrder.fulfillmentStatus}.`,
        );
        return { alreadyProcessed: true, order: updatedOrder };
      }

      if (order.stockReduced) {
        console.log(
          `Order ${id} already processed. paymentStatus: ${order.paymentStatus}, StockReduced: ${order.stockReduced}`,
        );
        return { alreadyProcessed: true };
      }

      // Hanya lakukan jika masih PENDING
      if (order.paymentStatus !== "PENDING") {
        console.log(
          `Order ${id} paymentStatus is ${order.paymentStatus}, not PENDING`,
        );
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

      // const isPickUp = order.shippingMethod === ShippingMethod.PICKUP_STORE;

      // Update order paymentStatus menjadi SETTLEMENT
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          fulfillmentStatus: FulfillmentStatus.PROCESSING,
          paymentStatus: PaymentStatus.SETTLEMENT,
          stockReduced: true,
          externalId: transaction_id || order.externalId,
          paymentMethod: payment_type || order.paymentMethod,
        },
      });

      console.log(updatedOrder);

      return { alreadyProcessed: false, order: updatedOrder };
    });

    return NextResponse.json({
      success: true,
      message: result.alreadyProcessed
        ? "Order already processed"
        : "Order paymentStatus updated to SETTLEMENT",
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
