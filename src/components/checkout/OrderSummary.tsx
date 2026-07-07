"use client";

import { CartItem } from "@/types";
import { ShippingRate } from "@/types/checkout";
import { getCartItemKey } from "@/store/useCartStore";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingRate: ShippingRate | null;
}

export function OrderSummary({
  items,
  subtotal,
  shippingRate,
}: OrderSummaryProps) {
  const shippingCost = shippingRate?.price || 0;
  const total = subtotal + shippingCost;

  return (
    <div className="bg-surface px-6 rounded-lg py-4">
      <h2 className="text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5" /> Your Order
      </h2>
      <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-6 pr-2 custom-scrollbar">
        {items.map((item) => {
          const itemKey = getCartItemKey(
            item.product.id,
            item.productVariantId,
          );
          return (
            <div key={itemKey} className="flex gap-4 items-start py-1">
              {/* IMAGE AREA */}
              <div
                className="h-24 w-20 bg-cool-steel-100 rounded-lg overflow-hidden shrink-0 border"
                style={{ borderColor: "var(--surface-border)" }}
              >
                {item.product.image ? (
                  <Image
                    src={item.product.image}
                    alt={item.product.title}
                    className="h-full w-full object-cover"
                    width={160}
                    height={200}
                  />
                ) : (
                  <div className="h-full w-full bg-deep-space-blue-900" />
                )}
              </div>

              {/* DETAILS AREA */}
              <div className="flex-1 space-y-1">
                {/* Judul Produk - Dinaikkan ke text-sm & semi-bold agar dominan */}
                <h4 className="text-sm font-semibold uppercase tracking-tight line-clamp-2 text-slate-900 ">
                  {item.product.title}
                </h4>

                {item.variant?.size && (
                  <p className="text-[11px] text-cool-steel-500 uppercase tracking-wider font-medium">
                    Size: {item.variant.size}
                  </p>
                )}

                {/* Breakdown Harga - text-xs dengan warna medium agar tidak tabrakan */}
                <div className="text-xs text-cool-steel-500 font-medium flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span>
                    {item.quantity} x Rp{" "}
                    {item.product.price.toLocaleString("id-ID")}
                  </span>

                  {item.product.originalPrice &&
                    item.product.originalPrice > item.product.price && (
                      <span className="text-[11px] text-cool-steel-400 line-through font-normal">
                        (Rp {item.product.originalPrice.toLocaleString("id-ID")}
                        )
                      </span>
                    )}
                </div>

                {/* Subtotal Item - Dibuat text-sm & bold sebagai kesimpulan harga item */}
                <p className="text-sm font-bold text-deep-space-blue-950  pt-1">
                  Rp{" "}
                  {(item.product.price * item.quantity).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="space-y-3 border-t pt-4"
        style={{ borderColor: "var(--surface-border)" }}
      >
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground uppercase tracking-tight">
            Subtotal
          </span>
          <span className="font-bold">
            Rp {subtotal.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground uppercase tracking-tight">
            Shipping
          </span>
          <span
            className={`font-bold ${
              shippingRate?.price === 0
                ? "line-through text-muted-foreground"
                : ""
            }`}
          >
            {shippingRate
              ? `Rp ${shippingRate.price.toLocaleString("id-ID")}`
              : "Calculated at next step"}
          </span>
        </div>

        {shippingRate && (
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            Selected: {shippingRate.courier_name}{" "}
            {shippingRate.courier_service_name} ({shippingRate.duration})
          </p>
        )}

        <div
          className="flex justify-between text-lg font-bold border-t pt-3 mt-3"
          style={{ borderColor: "var(--surface-border)" }}
        >
          <span className="uppercase tracking-wider">Total</span>
          <span>Rp {total.toLocaleString("id-ID")}</span>
        </div>
      </div>
    </div>
  );
}
