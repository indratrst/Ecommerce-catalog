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
    <div className="bg-surface p-6 rounded-lg">
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
            <div key={itemKey} className="flex gap-4 items-start">
              <div
                className="h-16 w-16 bg-white rounded overflow-hidden shrink-0 border"
                style={{ borderColor: "var(--surface-border)" }}
              >
                {item.product.image ? (
                  <Image
                    src={item.product.image}
                    alt={item.product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase line-clamp-1">
                  {item.product.title}
                </h4>
                {item.variant?.size && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Size: {item.variant.size}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {item.quantity} x Rp{" "}
                  {item.product.price.toLocaleString("id-ID")}
                </p>
                <p className="text-xs font-bold mt-1">
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
