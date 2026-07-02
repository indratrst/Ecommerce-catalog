import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { OrderStatus } from "@prisma/client";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract notification data
    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key, // Tambahkan informasi apakah stok sudah dikurangi
    } = body;

    // Verify signature using Midtrans notification formula
    const signatureString = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(signatureString)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.error("Invalid signature for order:", order_id, { body });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // // Map Midtrans status to our OrderStatus
    // let newStatus: OrderStatus;
    // switch (transaction_status) {
    //   case "pending":
    //     newStatus = OrderStatus.PENDING;
    //     break;
    //   case "settlement":
    //     newStatus = OrderStatus.SETTLEMENT;
    //     break;
    //   case "paid":
    //     newStatus = OrderStatus.PAID;
    //     break;
    //   case "expired":
    //     newStatus = OrderStatus.EXPIRED;
    //     break;
    //   case "cancel":
    //     newStatus = OrderStatus.CANCEL;
    //     break;
    //   case "failure":
    //     newStatus = OrderStatus.FAILED;
    //     break;
    //   default:
    //     console.warn("Unknown transaction status:", transaction_status);
    //     newStatus = OrderStatus.PENDING;
    // }

    // // Update order status in database
    // const updatedOrder = await prisma.order.update({
    //   where: { id: order_id },
    //   data: {
    //     status: newStatus,
    //     stockReduced:
    //       newStatus === OrderStatus.PAID ? true : order.stockReduced,
    //     paymentMethod: payment_type,
    //     externalId: transaction_id,
    //   },
    // });

    await prisma.$transaction(async (tx) => {
      // 1. Ambil data order beserta items-nya
      const order = await tx.order.findUnique({
        where: { id: order_id },
        include: { items: true },
      });

      if (!order) throw new Error("Order not found");

      if (["settlement", "capture", "paid"].includes(transaction_status)) {
        // 2. KUNCI UTAMA: Coba update status order TERLEBIH DAHULU dengan syarat stockReduced harus masih false.
        // Kita gunakan updateMany karena updateMany mengembalikan 'count'.
        // Jika count === 0, berarti order ini SUDAH diproses oleh request lain yang masuk duluan.
        const orderUpdate = await tx.order.updateMany({
          where: {
            id: order_id,
            stockReduced: false, // Ini benteng pertahanan kita dari request ganda
          },
          data: {
            status: OrderStatus.SETTLEMENT,
            stockReduced: true,
            externalId: body.transaction_id,
            paymentMethod: body.payment_type,
          },
        });

        // Jika count 0, artinya request lain sudah mengubah stockReduced menjadi true dalam milidetik yang sama.
        // Kita langsung stop proses di sini agar tidak terjadi double-decrement stok.
        if (orderUpdate.count === 0) {
          return; // Keluar dengan aman tanpa melempar error (idempotent)
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

          if (updatedVariant.count === 0) {
            // Jika stok tidak cukup, transaksi akan rollback otomatis (status order batal berubah)
            throw new Error(
              `Stok untuk varian ${item.productVariantId} tidak mencukupi`,
            );
          }
        }
      } else if (
        ["expire", "cancel", "deny", "failure"].includes(transaction_status)
      ) {
        await tx.order.update({
          where: { id: order_id },
          data: { status: OrderStatus.CANCEL },
        });
      }
    });

    // console.log(
    //   `Order ${order_id} status updated to ${status_code} with payment type ${payment_type} and stock reduced: ${stock_reduced}`,
    // );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
