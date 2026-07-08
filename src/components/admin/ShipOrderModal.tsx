"use client";

import { useState } from "react";
import { useShipOrder } from "@/hooks/useOrders"; // Panggil hook baru
import { Loader2, Truck, X } from "lucide-react";
import { toast } from "sonner";

interface ShipOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentCourier: string | null;
}

export function ShipOrderModal({
  isOpen,
  onClose,
  orderId,
  currentCourier,
}: ShipOrderModalProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState(currentCourier || "");

  // Mengonsumsi mutasi dari react-query hook yang terintegrasi dengan server action
  const { mutate: shipOrder, isPending } = useShipOrder();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Nomor resi tidak boleh kosong");
      return;
    }

    shipOrder(
      {
        orderId,
        trackingNumber,
        shippingCourier: courier,
      },
      {
        onSuccess: () => {
          toast.success("Resi disimpan, status beralih ke SHIPPED!");
          setTrackingNumber("");
          onClose();
        },
      },
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
            <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-600">
              <Truck className="h-5 w-5" /> Input Resi Pengiriman
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Nama Kurir / Ekspedisi
              </label>
              <input
                type="text"
                value={courier.toUpperCase()}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="Contoh: JNE, J&T, SICEPAT"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Nomor Resi Fisik *
              </label>
              <input
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Masukkan nomor resi dari kurir..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono tracking-wide focus:ring-2 focus:ring-indigo-600 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Konfirmasi & Kirim"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
