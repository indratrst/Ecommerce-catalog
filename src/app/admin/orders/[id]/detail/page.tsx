"use client";

import Link from "next/link";
import { formatDate, useConfirmPickup, useShipOrder, useOrder } from "@/hooks/useOrders"; // 1. Import useShipOrder
import { useParams } from "next/navigation";
import { OrderItemDetail } from "@/types/checkout";
import { useState } from "react";
import { faker } from "@faker-js/faker";

export default function OrdersDetailPage() {
  const params = useParams();
  const ordersId = params.id as string;

  const { data: orders } = useOrder(ordersId);
  const { mutate: confirmPickup, isPending: isPickupPending } = useConfirmPickup();
  const { mutate: shipOrder, isPending: isShipPending } = useShipOrder(); // 2. Inisialisasi hook Ship Order

  // State untuk kontrol modal konfirmasi (Pickup / Processing)
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  // 3. State untuk kontrol modal input resi (Shipping)
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  const isPending = isPickupPending || isShipPending;
// 1. DETEKSI JENIS PENGIRIMAN: Apakah order ini dikirim via kurir?
  // Jalur SHIPPING jika ada alamat pengiriman atau field kurir terisi
  const isShippingMethod = !!orders?.shippingAddress; 

  // 2. LOGIKA KONTROL STATUS BERIKUTNYA
  const getNextStatus = () => {
    if (!orders) return null;
    
    // Alur A: Jalur Pickup Store (Ambil Sendiri)
    if (!isShippingMethod) {
      if (orders.fulfillmentStatus === "PROCESSING") return "READY_TO_PICKUP";
      if (orders.fulfillmentStatus === "READY_TO_PICKUP") return "PICKED_UP";
    }
    
    return null;
  };

  const nextStatus = getNextStatus();

  // Ha// 3. HANDLER SAAT TOMBOL UTAMA DIKLIK
  const handleActionClick = () => {
    if (!orders) return;

    // Jika pesanan adalah SHIPPING dan status saat ini masih PROCESSING, buka modal Input Resi
    if (isShippingMethod && orders.fulfillmentStatus === "PROCESSING") {
    // Generate nomor resi tiruan acak (misal alphanumeric 12 digit)
    setTrackingNumber(orders.trackingNumber ?? orders?.shippingCourier + faker.string.alphanumeric(12).toUpperCase());
    // Ambil kurir acak secara opsional
    // setShippingCourier(faker.helpers.arrayElement(["JNE", "J&T", "SiCepat", "Anteraja"]));
    
    setIsShipModalOpen(true);
  }
    // Jika pesanan adalah PICKUP, jalankan konfirmasi status berjenjang
    else if (nextStatus) {
      setIsAlertOpen(true);
    }
  };

  const handleConfirmAction = () => {
    setIsAlertOpen(false);
    if (nextStatus) {
      confirmPickup({ id: ordersId, fulfillmentStatus: nextStatus });
    }
  };

  const handleConfirmShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      alert("Nomor resi wajib diisi!");
      return;
    }

    shipOrder(
      {
        orderId: ordersId,
        trackingNumber: trackingNumber,
      },
      {
        onSuccess: () => {
          setIsShipModalOpen(false);
          setTrackingNumber("");
        },
      }
    );
  };

  if (!orders) {
    return <div>Data order tidak ditemukan.</div>;
  }

  // 4. MAPPING TEXT DISPLAY STATUS AGAR SESUAI ENUM BARU
  const getStatusBadgeConfig = () => {
    switch (orders.fulfillmentStatus) {
      case "NOT_APPLICABLE":
        return { text: "Belum Dibayar / Gagal", className: "bg-rose-500/20 text-rose-400 border border-rose-500/30" };
      case "PROCESSING":
        return { text: "Sedang Dipacking (Admin)", className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" };
      case "READY_TO_PICKUP":
        return { text: "Siap Diambil di Store", className: "bg-blue-500/20 text-blue-400 border border-blue-500/30" };
      case "PICKED_UP":
        return { text: "Sudah Diambil Pelanggan", className: "bg-green-500/20 text-green-400 border border-green-500/30" };
      case "SHIPPED":
        return { text: "Dalam Pengiriman Kurir", className: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" };
      case "DELIVERED":
        return { text: "Pesanan Diterima (Delivered)", className: "bg-green-500/20 text-green-400 border border-green-500/30" };
      default:
        return { text: orders.fulfillmentStatus, className: "bg-slate-500/20 text-slate-400 border border-slate-500/30" };
    }
  };

  const badgeConfig = getStatusBadgeConfig();

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
             <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Fulfillment Status</p>
              <span className={`px-2 py-1 text-xs rounded font-medium inline-block mt-1 ${badgeConfig.className}`}>
                {badgeConfig.text}
              </span>
            </div>
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
                Tracking Number
              </p>
              <p className="mt-1 wrap-break-word text-slate-100 font-semibold">
                {orders.trackingNumber ?? "-"}
              </p>
            </div>
             <div className="sm:col-span-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Courier / Shipping Service
              </p>
              <p className="mt-1 wrap-break-word text-slate-100 font-semibold uppercase">
                {orders.shippingCourier ?? "-"}
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
              orders.fulfillmentStatus === "NOT_APPLICABLE" ||
              orders.fulfillmentStatus === "PICKED_UP" ||
              orders.fulfillmentStatus === "SHIPPED" ||
              orders.fulfillmentStatus === "DELIVERED"
                ? "bg-slate-800 border border-slate-700 cursor-not-allowed shadow-none"
                : orders.fulfillmentStatus === "PROCESSING" && isShippingMethod
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-900/20" // SHIPPING mode
                  : orders.fulfillmentStatus === "PROCESSING"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/20" // PICKUP step 1
                    : "bg-green-600 hover:bg-green-700 shadow-md shadow-green-900/20" // PICKUP step 2
            }`}
          >
            <button
              onClick={handleActionClick}
              disabled={
                isPending ||
                orders.fulfillmentStatus === "NOT_APPLICABLE" ||
                orders.fulfillmentStatus === "PICKED_UP" ||
                orders.fulfillmentStatus === "SHIPPED" ||
                orders.fulfillmentStatus === "DELIVERED"
              }
              className="text-white py-3 w-full uppercase font-semibold text-sm tracking-wider disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses...
                </span>
              ) : orders.fulfillmentStatus === "NOT_APPLICABLE" ? (
                "❌ Menunggu Pembayaran Valid"
              ) : orders.fulfillmentStatus === "PROCESSING" ? (
                isShippingMethod ? "🚚 Input Resi & Kirim Pesanan" : "📦 Siapkan & Siap Diambil Store"
              ) : orders.fulfillmentStatus === "READY_TO_PICKUP" ? (
                "🤝 Konfirmasi Pengambilan Produk"
              ) : (
                "Selesai (Done)"
              )}
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          {/* ... Bagian Orders Items & Raw Attributes (Tetap Sama seperti kode aslimu) ... */}
          <section className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/40">
            <h2 className="text-lg font-semibold text-slate-100">Orders Items</h2>
            <p className="text-sm text-slate-300 mt-1">{orders.items.length} item(s) in this orders.</p>
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
                    <tr key={item.id} className="border-b border-slate-700 last:border-0 bg-slate-950/60">
                      <td className="px-3 py-3 font-medium text-slate-100">{item.productVariant.product.title}</td>
                      <td className="px-3 py-3 text-slate-200">{item.productVariant.size}{item.productVariant.color ? ` / ${item.productVariant.color}` : ""}</td>
                      <td className="px-3 py-3 text-slate-100">{item.quantity}</td>
                      <td className="px-3 py-3 text-slate-100">IDR {item.priceAtPurchase.toLocaleString()}</td>
                      <td className="px-3 py-3 text-slate-100">IDR {(item.priceAtPurchase * item.quantity).toLocaleString()}</td>
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

      {/* ================= CUSTOM CONFIRMATION ALERT DIALOG MODAL (PICKUP) ================= */}
      {isAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-100">Konfirmasi Perubahan Status</h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              {orders.fulfillmentStatus === "PROCESSING" ? (
                <>Apakah Anda yakin pesanan <span className="font-mono text-blue-400 font-semibold">{orders.id}</span> sudah selesai disiapkan? Aksi ini sekaligus akan mengirimkan <strong>notifikasi email otomatis</strong> ke customer.</>
              ) : (
                <>Apakah Anda yakin customer sudah datang ke store dan mengambil produk untuk order <span className="font-mono text-green-400 font-semibold">{orders.id}</span>? Status akan diubah menjadi permanen selesai.</>
              )}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setIsAlertOpen(false)} className="rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800">Batal</button>
              <button onClick={handleConfirmAction} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${orders.fulfillmentStatus === "PROCESSING" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}>Ya, Konfirmasi</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. MODAL FORM INPUT RESI (SHIPPING) ================= */}
      {isShipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-100">Pengiriman Pesanan via Kurir</h3>
            <p className="mt-1 text-xs text-slate-400">Masukkan informasi kurir dan nomor resi pengiriman fisik untuk order ini.</p>
            
            <form onSubmit={handleConfirmShipment} className="mt-4 space-y-4">
              {/* <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Nama Kurir (Opsional)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: JNE, J&T, Sicepat"
                  value={orders?.shippingCourier ?? ""} 
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div> */}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Nomor Resi / Tracking Number <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="Masukkan nomor resi fisik"
                  value={trackingNumber} 
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsShipModalOpen(false)} 
                  className="rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isPending ? "Mengirim..." : "Konfirmasi & Kirim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}