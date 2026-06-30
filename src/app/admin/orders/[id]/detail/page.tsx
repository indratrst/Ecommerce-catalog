"use client";

import Link from "next/link";
import { formatDate, useConfirmPickup, useOrder } from "@/hooks/useOrders";
import { useParams } from "next/navigation";
import { OrderItemDetail } from "@/types/checkout";

export default function OrdersDetailPage() {
  const params = useParams();
  const ordersId = params.id as string;

  const { data: orders } = useOrder(ordersId);

  const { mutate: confirmPickup, isPending } = useConfirmPickup();
  const handleConfirm = () => {
    if (
      confirm(
        `Apakah kamu yakin order ${ordersId} sudah diambil oleh customer?`,
      )
    ) {
      confirmPickup(ordersId);
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
          href="/admin/orderss"
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
                className={`px-2 py-1 text-xs rounded ${
                  orders.fulfillmentStatus === "PICKED_UP"
                    ? "bg-green-200 text-green-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {orders.fulfillmentStatus === "PICKED_UP"
                  ? "Sudah Diambil"
                  : "Menunggu Pick Up"}
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
          <div
            className={`mt-9 w-full rounded-4xl transition-colors ${
              orders.fulfillmentStatus === "PICKED_UP"
                ? "bg-gray-400 cursor-not-allowed" // Jika sudah diambil: abu-abu & kursor banned
                : "bg-green-600 hover:bg-green-700" // Jika belum diambil: hijau & hover hijau lebih tua
            }`}
          >
            <button
              onClick={handleConfirm}
              // Tombol otomatis di-disable jika sedang loading ATAU barang sudah diambil
              disabled={isPending || orders.fulfillmentStatus === "PICKED_UP"}
              className="text-white py-3 w-full uppercase font-medium tracking-wider disabled:cursor-not-allowed"
            >
              {isPending
                ? "Memproses..."
                : orders.fulfillmentStatus === "PICKED_UP"
                  ? "Sudah Diambil"
                  : "Tandai Telah Diambil"}
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
                <p className="text-slate-100">{orders.status}</p>
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
    </div>
  );
}
