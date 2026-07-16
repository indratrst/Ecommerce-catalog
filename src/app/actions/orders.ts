"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendOrderPickedUpEmail, sendPickupReadyEmail, sendShippingEmail } from "@/lib/nodemailer";

interface ConfirmPickupPayload {
  id: string;
  fulfillmentStatus: "READY_TO_PICKUP" | "PICKED_UP";
}

interface ShipOrderPayload {
  orderId: string;
  trackingNumber: string;
  shippingCourier?: string;
}

// Action 1: Update Status Pengambilan Toko (Pickup)
export async function updatePickupStatusAction(payload: ConfirmPickupPayload) {
  const session = await getSession();
  if (!session || (session.role !== "SUPERUSER" && session.role !== "ADMIN")) {
    throw new Error("Unauthorized. Akses admin ditolak.");
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: payload.id },
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

  if (!existingOrder) {
    throw new Error("Data order tidak ditemukan.");
  }

  const updated = await prisma.order.update({
    where: { id: payload.id },
    data: { fulfillmentStatus: payload.fulfillmentStatus },
  });

  // Kirim email berdasarkan status yang baru
  if (existingOrder.customerEmail) {
    if (
      existingOrder.fulfillmentStatus === "PROCESSING" &&
      payload.fulfillmentStatus === "READY_TO_PICKUP"
    ) {
      await sendPickupReadyEmail({
        to: existingOrder.customerEmail,
        orderId: payload.id,
        customerName: existingOrder.customerName || "Customer",
        items: existingOrder.items,
        totalAmount: existingOrder.totalAmount || 0,
      });
    }

    if (
      existingOrder.fulfillmentStatus === "READY_TO_PICKUP" &&
      payload.fulfillmentStatus === "PICKED_UP"
    ) {
      await sendOrderPickedUpEmail({
        to: existingOrder.customerEmail,
        orderId: payload.id,
        customerName: existingOrder.customerName || "Customer",
        items: existingOrder.items,
        totalAmount: existingOrder.totalAmount || 0,
      });
    }
  }

  // Revalidate cache agar komponen RSC di server langsung memperbarui data layar
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${payload.id}`);

  return JSON.parse(JSON.stringify(updated));
}

// Action 2: Input Resi Manual & Kirim Paket (Ekspedisi)
export async function shipOrderAction(payload: ShipOrderPayload) {
  const session = await getSession();
  if (!session || (session.role !== "SUPERUSER" && session.role !== "ADMIN")) {
    throw new Error("Unauthorized. Akses admin ditolak.");
  }

  if (!payload.trackingNumber.trim()) {
    throw new Error("Nomor resi pengiriman kurir wajib diisi.");
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: payload.orderId },
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

  if (!existingOrder) {
    throw new Error("Data transaksi pesanan tidak ditemukan.");
  }

  if (existingOrder.paymentStatus !== "SETTLEMENT") {
    throw new Error(
      "Gagal memproses. Pesanan ini belum diselesaikan pembayarannya.",
    );
  }

  const updated = await prisma.order.update({
    where: { id: payload.orderId },
    data: {
      fulfillmentStatus: "SHIPPED",
      trackingNumber: payload.trackingNumber.trim(),
      shippingCourier: payload.shippingCourier || undefined,
    },
  });

  if (existingOrder.customerEmail) {
    await sendShippingEmail({
      to: existingOrder.customerEmail,
      orderId: payload.orderId,
      customerName: existingOrder.customerName || "Customer",
      items: existingOrder.items,
      totalAmount: existingOrder.totalAmount || 0,
      trackingNumber: payload.trackingNumber.trim(),
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${payload.orderId}`);

  return JSON.parse(JSON.stringify(updated));
}
