"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

  const updated = await prisma.order.update({
    where: { id: payload.id },
    data: { fulfillmentStatus: payload.fulfillmentStatus },
  });

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
  });

  if (!existingOrder)
    throw new Error("Data transaksi pesanan tidak ditemukan.");
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
      shippingCourier: payload.shippingCourier || existingOrder.shippingCourier,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${payload.orderId}`);

  return JSON.parse(JSON.stringify(updated));
}
