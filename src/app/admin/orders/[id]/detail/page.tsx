"use client";

import Link from "next/link";
import { formatDate, useConfirmPickup, useOrder } from "@/hooks/useOrders";
import { useParams } from "next/navigation";
import { OrderItemDetail } from "@/types/checkout";
import { useState } from "react"; // Tambahkan useState untuk kontrol modal custom

export default function OrdersDetailPage() {
  const params = useParams();
  const ordersId = params.id as string;

  const { data: orders } = useOrder(ordersId);
  const { mutate: confirmPickup, isPending } = useConfirmPickup();

  // State untuk mengontrol kustom konfirmasi modal
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Menentukan target status berikutnya yang akan dikirim ke API
  const getNextStatus = () => {
    if (!orders) return null;
    if (orders.fulfillmentStatus === "PROCESSING") return "READY_TO_PICKUP";
    if (orders.fulfillmentStatus === "READY_TO_PICKUP") return "PICKED_UP";
    return null;
  };

  const nextStatus = getNextStatus();

  const handleActionClick = () => {
    if (nextStatus) {
      setIsAlertOpen(true);
    }
  };

  const handleConfirmAction = () => {
    setIsAlertOpen(false);

    if (nextStatus) {
      // Pastikan mengirimkan object berisi id DAN status baru ke hook mutasi kamu
      confirmPickup({ id: ordersId, fulfillmentStatus: nextStatus });
    }
  };

  if (!orders) {
    return <div>Data order tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 dark:text-white uppercase tracking-tight">
            orders Detail
          </h1>
          <p className="text-slate-300 dark:text-slate-400 mt-1 font-medium">
            Menampilkan semua atribut yang tersimpan di tabel orders.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 shadow-sm transition hover:bg-slate-800"
        >
          Kembali ke daftar orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/40">
          <div className="mb-6 flex flex-wrap gap-2">
            {/* <StatusBadge status={orders.status} /> */}
            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-100">
              Stock reduced: {orders.stockReduced ? "Yes" : "No"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                orders ID
              </p>
              <p className="mt-1 text-slate-100 font-semibold">{orders.id}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Total Amount
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {orders.totalAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Customer Name
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {orders.customerName}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Customer Email
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {orders.customerEmail}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Customer Phone
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {orders.customerPhone}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Shipping Address
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {orders.shippingAddress ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Payment Method
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {orders.paymentMethod ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                External ID
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {orders.externalId ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Fulfillment Status
              </p>
              <span
                className={`px-2 py-1 text-xs rounded font-medium inline-block mt-1 ${
                  orders.fulfillmentStatus === "PICKED_UP"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : orders.fulfillmentStatus === "READY_TO_PICKUP"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                }`}
              >
                {orders.fulfillmentStatus === "PICKED_UP" && "Sudah Diambil"}
                {orders.fulfillmentStatus === "READY_TO_PICKUP" &&
                  "Siap Diambil (Ready)"}
                {orders.fulfillmentStatus === "PROCESSING" &&
                  "Menunggu Disiapkan"}
                {orders.fulfillmentStatus === "NOT_APPLICABLE" &&
                  "Reguler / Kurir"}
              </span>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Snap Redirect URL
              </p>
              <p className="mt-1 wrap-break-word text-slate-100 font-semibold">
                {orders.snapRedirectUrl ?? "-"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Snap Token
              </p>
              <p className="mt-1 wrap-break-word text-slate-100 font-semibold">
                {orders.snapToken ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                User ID
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {orders.userId ?? "Guest"}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                User Name
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {orders.user?.name ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Created At
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {formatDate(orders.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Updated At
              </p>
              <p className="mt-1 text-slate-100 font-semibold">
                {formatDate(orders.updatedAt)}
              </p>
            </div>
          </div>

          {/* ================= MODIFIKASI SEKSI BUTTON UTAMA ================= */}
          <div
            className={`mt-9 w-full rounded-xl overflow-hidden transition-all ${
              orders.fulfillmentStatus === "PICKED_UP" ||
              orders.fulfillmentStatus === "NOT_APPLICABLE"
                ? "bg-slate-800 border border-slate-700 cursor-not-allowed shadow-none"
                : orders.fulfillmentStatus === "PROCESSING"
                  ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/20"
                  : "bg-green-600 hover:bg-green-700 shadow-md shadow-green-900/20"
            }`}
          >
            <button
              onClick={handleActionClick}
              disabled={
                isPending ||
                orders.fulfillmentStatus === "PICKED_UP" ||
                orders.fulfillmentStatus === "NOT_APPLICABLE"
              }
              className="text-white py-3 w-full uppercase font-semibold text-sm tracking-wider disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses...
                </span>
              ) : orders.fulfillmentStatus === "PROCESSING" ? (
                "📦 Siapkan & Kirim Email Notifikasi"
              ) : orders.fulfillmentStatus === "READY_TO_PICKUP" ? (
                "🤝 Konfirmasi Pengambilan Produk"
              ) : orders.fulfillmentStatus === "NOT_APPLICABLE" ? (
                "Pengiriman Reguler (Non-Pickup)"
              ) : (
                "Selesai (Sudah Diambil)"
              )}
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/40">
            <h2 className="text-lg font-semibold text-slate-100">
              Orders Items
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              {orders.items.length} item(s) in this orders.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-800 text-slate-100">
                  <tr>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Variant</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.items.map((item: OrderItemDetail) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-700 last:border-0 bg-slate-950/60"
                    >
                      <td className="px-3 py-3 font-medium text-slate-100">
                        {item.productVariant.product.title}
                      </td>
                      <td className="px-3 py-3 text-slate-200">
                        {item.productVariant.size}
                        {item.productVariant.color
                          ? ` / ${item.productVariant.color}`
                          : ""}
                      </td>
                      <td className="px-3 py-3 text-slate-100">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-3 text-slate-100">
                        IDR {item.priceAtPurchase.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-slate-100">
                        IDR{" "}
                        {(
                          item.priceAtPurchase * item.quantity
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/40">
            <h2 className="text-lg font-semibold text-slate-100">
              Raw Attributes
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Semua field yang tersimpan di tabel orders.
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="font-semibold text-slate-100">Status</p>
                <p className="text-slate-100">{orders.paymentStatus}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="font-semibold text-slate-100">Stock Reduced</p>
                <p className="text-slate-100">
                  {orders.stockReduced ? "true" : "false"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="font-semibold text-slate-100">External ID</p>
                <p className="text-slate-100">{orders.externalId ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="font-semibold text-slate-100">Snap Token</p>
                <p className="wrap-break-word text-slate-100">
                  {orders.snapToken ?? "-"}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* ================= CUSTOM CONFIRMATION ALERT DIALOG MODAL ================= */}
      {isAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-100">
              Konfirmasi Perubahan Status
            </h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              {orders.fulfillmentStatus === "PROCESSING" ? (
                <>
                  Apakah Anda yakin pesanan{" "}
                  <span className="font-mono text-blue-400 font-semibold">
                    {orders.id}
                  </span>{" "}
                  sudah selesai disiapkan? Aksi ini sekaligus akan mengirimkan{" "}
                  <strong>notifikasi email otomatis</strong> ke customer.
                </>
              ) : (
                <>
                  Apakah Anda yakin customer sudah datang ke store dan mengambil
                  produk untuk order{" "}
                  <span className="font-mono text-green-400 font-semibold">
                    {orders.id}
                  </span>
                  ? Status akan diubah menjadi permanen selesai.
                </>
              )}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsAlertOpen(false)}
                className="rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                  orders.fulfillmentStatus === "PROCESSING"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
