"use client";

import { CartItem } from "@/types";
import { ShippingRate } from "@/types/checkout";
import { getCartItemKey } from "@/store/useCartStore";
import { X, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react";
import Image from "next/image";

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  items: CartItem[];
  deliveryMethod: "shipping" | "pickup";
  shippingRate: ShippingRate | null;
  total: number;
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  items,
  deliveryMethod,
  shippingRate,
  total,
}: PaymentConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-deep-space-blue-950/80 backdrop-blur-sm p-4">
      <div
        className="bg-deep-space-blue-900 text-white w-full max-w-lg rounded-xl overflow-hidden shadow-2xl relative border"
        style={{ borderColor: "var(--steel-blue-700)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 hover:opacity-70 transition-opacity"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-amber-flame-500 text-deep-space-blue-950 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-white">
                Konfirmasi Pesanan
              </h2>
              <p className="text-xs text-deep-space-blue-100 uppercase ">
                Pastikan data pesanan Anda sudah benar
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8 max-h-75 overflow-y-auto pr-2 custom-scrollbar text-white">
            {items.map((item) => {
              const itemKey = getCartItemKey(
                item.product.id,
                item.productVariantId,
              );
              return (
                <div
                  key={itemKey}
                  className="flex gap-4 p-3 bg-deep-space-blue-800 rounded-lg border"
                  style={{ borderColor: "var(--steel-blue-700)" }}
                >
                  <div className="h-16 w-16 bg-card-bg rounded overflow-hidden shrink-0">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                        width={500}
                        height={500}
                      />
                    ) : (
                      <div className="h-full w-full bg-cool-steel-100 flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 opacity-20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold uppercase truncate">
                      {item.product.title}
                    </h4>
                    {item.variant?.size && (
                      <p className="text-[10px] opacity-60 uppercase tracking-widest">
                        Size: {item.variant.size}
                      </p>
                    )}
                    <p className="text-xs opacity-60">
                      {item.quantity} x Rp{" "}
                      {item.product.price.toLocaleString("id-ID")}
                    </p>
                    <p className="text-sm font-bold mt-1">
                      Rp{" "}
                      {(item.product.price * item.quantity).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-deep-space-blue-900 text-white p-6 rounded-xl mb-1 flex justify-between items-center shadow-lg">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-60">
                Delivery Method:
              </p>
              <div className="flex items-center gap-2">
                <h4 className="capitalize">{deliveryMethod} - </h4>
                <p
                  className={`text-xl font-black ${shippingRate?.price === 0 ? "line-through opacity-60" : ""}`}
                >
                  {shippingRate?.price === 0
                    ? `Rp ${shippingRate?.price.toLocaleString("id-ID")}`
                    : "Free"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-amber-flame-500 text-deep-space-blue-950 p-6 rounded-xl mb-8 flex justify-between items-center shadow-lg">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-60">
                Total Pembayaran
              </p>
              <p className="text-2xl font-black">
                Rp {total.toLocaleString("id-ID")}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 opacity-20" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full bg-amber-flame-500 text-deep-space-blue-950 py-4 font-black uppercase tracking-widest hover:bg-amber-flame-400 transition-all rounded-lg text-sm shadow-xl flex items-center justify-center gap-2"
            >
              Sudah benar
            </button>
            <button
              onClick={onClose}
              className="w-full bg-deep-space-blue-800 border-2 border-dashed border-steel-blue-600 py-4 font-bold uppercase tracking-widest transition-all rounded-lg text-sm text-deep-space-blue-100 hover:bg-deep-space-blue-700"
            >
              Cek kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


