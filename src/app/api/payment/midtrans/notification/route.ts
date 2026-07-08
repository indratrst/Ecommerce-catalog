import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { PaymentStatus } from "@prisma/client";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;

export async function GET() {
  console.log("=== [Midtrans Notification] GET request received ===");
  return NextResponse.json({
    active: true,
    message: "Midtrans notification endpoint is active and listening.",
  });
}

export async function POST(request: Request) {
  console.log("\n=== [Midtrans Notification] POST request received ===");
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      console.warn("[Midtrans Notification] Empty or invalid JSON body received.");
      return NextResponse.json({
        success: true,
        message: "Empty or invalid JSON body ignored.",
      });
    }

    console.log("[Midtrans Webhook] Received Body:", JSON.stringify(body, null, 2));

    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
    } = body;

    // Check if the payload is a placeholder/test ping (e.g. from Dashboard setup)
    if (!order_id || !status_code || !gross_amount || !transaction_status) {
      console.log("[Midtrans Notification] Received test/incomplete body, returning 200 OK.");
      return NextResponse.json({
        success: true,
        message: "Test ping received successfully.",
      });
    }

    // Force gross_amount to have two decimal places to match Midtrans' signature calculation
    const formattedGrossAmount = parseFloat(String(gross_amount)).toFixed(2);
    const signatureString = `${order_id}${status_code}${formattedGrossAmount}${MIDTRANS_SERVER_KEY}`;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(signatureString)
      .digest("hex");

    console.log("[Midtrans Webhook] Signature verification details:", {
      signatureString,
      receivedSignature: signature_key,
      expectedSignature: expectedSignature,
    });

    if (signature_key !== expectedSignature) {
      console.error("[Midtrans Webhook] INVALID SIGNATURE MATCH ERROR!", {
        order_id,
        receivedSignature: signature_key,
        expectedSignature,
      });
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 200 } // Keep 200 OK so Midtrans stops retrying invalid/mock signatures
      );
    }

    console.log("[Midtrans Webhook] Signature verification PASSED.");

    let resultMsg = "No operation performed";

    await prisma.$transaction(async (tx) => {
      // 1. Ambil data order beserta items-nya
      const order = await tx.order.findUnique({
        where: { id: order_id },
        include: { items: true },
      });

      if (!order) {
        console.warn(`[Midtrans Webhook] Order with ID ${order_id} not found in database. Ignoring.`);
        resultMsg = "Order not found in database";
        return;
      }

      console.log("[Midtrans Webhook] Found order in database:", {
        id: order.id,
        currentPaymentStatus: order.paymentStatus,
        stockReduced: order.stockReduced,
      });

      if (["settlement", "capture", "paid"].includes(transaction_status)) {
        console.log(`[Midtrans Webhook] Handling settlement status for ${order_id}...`);
        
        const orderUpdate = await tx.order.updateMany({
          where: {
            id: order_id,
            stockReduced: false,
          },
          data: {
            paymentStatus: 'SETTLEMENT',
            stockReduced: true,
            externalId: body.transaction_id,
            paymentMethod: body.payment_type,
          },
        });

        console.log(`[Midtrans Webhook] Order update status count: ${orderUpdate.count}`);

        if (orderUpdate.count === 0) {
          console.log("[Midtrans Webhook] Order updateMany updated 0 records (likely already processed). Returning.");
          resultMsg = "Order already processed (stockReduced was true)";
          return;
        }

        // 3. Jika berhasil mengunci order, baru kurangi stok produk
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

          console.log(`[Midtrans Webhook] Reduced stock for variant ${item.productVariantId} by quantity ${item.quantity}. Count updated: ${updatedVariant.count}`);

          if (updatedVariant.count === 0) {
            console.error(`[Midtrans Webhook] Failed to reduce stock for variant ${item.productVariantId}. Not enough stock!`);
            throw new Error(
              `Stok untuk varian ${item.productVariantId} tidak mencukupi`,
            );
          }
        }
        resultMsg = "Order status successfully updated to SETTLEMENT and stock decremented";
      } else if (
        ["expire", "cancel", "deny", "failure"].includes(transaction_status)
      ) {
        console.log(`[Midtrans Webhook] Handling cancellation status (${transaction_status}) for ${order_id}...`);
        await tx.order.update({
          where: { id: order_id },
          data: { paymentStatus: PaymentStatus.CANCEL },
        });
        resultMsg = `Order status successfully updated to CANCEL due to transaction_status: ${transaction_status}`;
      } else {
        console.log(`[Midtrans Webhook] Unhandled transaction status: ${transaction_status}`);
        resultMsg = `Ignored transaction status: ${transaction_status}`;
      }
    });

    console.log(`[Midtrans Webhook] Transaction process finished. Result: ${resultMsg}`);
    return NextResponse.json({ success: true, message: resultMsg });
  } catch (error: unknown) {
    console.error("[Midtrans Webhook] FATAL WEBHOOK RUNTIME ERROR:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
