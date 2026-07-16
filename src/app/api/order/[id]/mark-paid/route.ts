import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FulfillmentStatus, PaymentStatus, ShippingMethod } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { sendShippingEmail } from "@/lib/nodemailer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { payment_type, transaction_id } = body;

    console.log("[mark-paid] request body:", body);
    console.log("[mark-paid] order id:", id);

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

        // Generate tracking number jika belum ada dan method adalah SHIPPING
        const needsTrackingNumber =
          !order.trackingNumber && order.shippingMethod === ShippingMethod.SHIPPING;

        const trackingNumber = needsTrackingNumber
          ? `${faker.string.alphanumeric(4).toUpperCase()}-${faker.string.numeric(10)}`
          : order.trackingNumber;

        const updatedOrder = await tx.order.update({
          where: { id },
          data: {
            fulfillmentStatus: targetFulfillmentStatus,
            trackingNumber,
          },
        });

        // Kirim email jika tracking number baru saja digenerate
        if (needsTrackingNumber) {
          const orderWithItems = await tx.order.findUnique({
            where: { id },
            include: {
              items: {
                include: {
                  productVariant: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          });

          if (orderWithItems) {
            console.log("[mark-paid] sending shipping email for already settled order", orderWithItems.customerEmail);
            await sendShippingEmail({
              to: orderWithItems.customerEmail,
              orderId: orderWithItems.id,
              customerName: orderWithItems.customerName,
              items: orderWithItems.items,
              totalAmount: orderWithItems.totalAmount,
              trackingNumber: trackingNumber,
            });
          }
        }

        console.log(
          `Order ${id} already settled. Ensured fulfillmentStatus is ${updatedOrder.fulfillmentStatus}. Tracking: ${trackingNumber}`,
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

      // Generate tracking number jika SHIPPING
      const trackingNumber =
        order.shippingMethod === ShippingMethod.SHIPPING
          ? `${faker.string.alphanumeric(4).toUpperCase()}-${faker.string.numeric(10)}`
          : null;

      // Update order paymentStatus menjadi SETTLEMENT
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          fulfillmentStatus: FulfillmentStatus.PROCESSING,
          paymentStatus: PaymentStatus.SETTLEMENT,
          stockReduced: true,
          externalId: transaction_id || order.externalId,
          paymentMethod: payment_type || order.paymentMethod,
          trackingNumber,
        },
      });

      // Fetch items untuk email
      const orderWithItems = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      // Send email notification
      if (orderWithItems) {
        console.log("[mark-paid] orderWithItems fetched. shippingMethod", order.shippingMethod, "customerEmail", orderWithItems.customerEmail);
        if (order.shippingMethod === ShippingMethod.SHIPPING) {
          console.log("[mark-paid] sending shipping email for newly settled order", orderWithItems.customerEmail);
          await sendShippingEmail({
            to: orderWithItems.customerEmail,
            orderId: orderWithItems.id,
            customerName: orderWithItems.customerName,
            items: orderWithItems.items,
            totalAmount: orderWithItems.totalAmount,
            trackingNumber: trackingNumber,
          });
        } else {
          console.log("[mark-paid] not sending shipping email because shippingMethod is not SHIPPING");
        }
      }

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
