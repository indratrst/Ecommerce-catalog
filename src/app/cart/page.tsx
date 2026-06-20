"use client";

import { useCart } from "@/contexts/CartContext";
import { getCartItemKey } from "@/store/useCartStore";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ProductResponse } from "@/lib/validation/products.schema";

export default function CartPage() {
  const { cart = [], removeFromCart, updateQuantity, cartTotal } = useCart();
  const [recommendedProducts, setRecommendedProducts] = useState<
    ProductResponse[]
  >([]);

  // Fetch recommendations from API, excluding items in cart

  useEffect(() => {
    if (!cart || cart.length === 0) {
      // Boleh fetch products tanpa filter cart
      fetchRecommendations();
      return;
    }
    async function fetchRecommendations() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const allProducts = await res.json();
          const cartIds = cart.map((item) => String(item.product.id));
          const filtered = allProducts
            .filter((p: ProductResponse) => !cartIds.includes(String(p.id)))
            .slice(0, 4);
          setRecommendedProducts(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      }
    }
    fetchRecommendations();
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <ShoppingBag
          className="h-24 w-24 mb-6 opacity-20"
          style={{ color: "var(--foreground)" }}
        />
        <h1
          className="text-3xl font-bold uppercase tracking-wider mb-4"
          style={{ color: "var(--foreground)" }}
        >
          Your Cart is Empty
        </h1>
        <p className="max-w-md mx-auto mb-8" style={{ color: "var(--muted)" }}>
          Looks like you haven&apos;t added anything to your cart yet. Browse
          our collections and find something you like!
        </p>
        <Link
          href="/"
          className="bg-black text-white px-8 py-3 uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
      <h1
        className="text-3xl font-bold uppercase tracking-widest mb-10 text-center"
        style={{ color: "var(--foreground)" }}
      >
        Your Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-12 mb-20">
        <div className="lg:w-2/3">
          {/* Table header */}
          <div
            className="hidden md:grid grid-cols-6 gap-4 border-b pb-4 mb-6 uppercase text-sm font-bold tracking-wider"
            style={{
              borderColor: "var(--surface-border)",
              color: "var(--muted)",
            }}
          >
            <div className="col-span-3">Product</div>
            <div className="text-center">Price</div>
            <div className="text-center">Quantity</div>
            <div className="text-right">Subtotal</div>
          </div>

          <ul
            className="space-y-6 md:space-y-0 md:divide-y"
            style={{ borderColor: "var(--surface-border)" }}
          >
            {cart.map((item) => {
              const itemKey = getCartItemKey(
                item.product.id,
                item.productVariantId,
              );
              return (
                <li
                  key={itemKey}
                  className="flex flex-col md:grid md:grid-cols-6 items-center gap-4 py-6"
                  style={{ borderColor: "var(--surface-border)" }}
                >
                  <div className="col-span-3 flex items-center gap-6 w-full">
                    <div
                      className="h-32 w-24 shrink-0 relative overflow-hidden"
                      style={{ background: "var(--surface)" }}
                    >
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="h-full w-full flex items-center justify-center"
                          style={{ color: "var(--muted)" }}
                        >
                          No Img
                        </div>
                      )}
                    </div>
                    <div>
                      <h3
                        className="font-semibold uppercase tracking-wide line-clamp-2 mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        {item.product.title}
                      </h3>
                      {item.variant?.size && (
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">
                          Size: {item.variant.size}
                        </p>
                      )}
                      <button
                        onClick={() =>
                          removeFromCart(
                            getCartItemKey(
                              item.product.id,
                              item.productVariantId,
                            ),
                          )
                        }
                        className="text-sm text-red-500 font-medium hover:text-red-700 uppercase flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>

                  <div
                    className="md:text-center w-full flex justify-between md:block font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    <span
                      className="md:hidden uppercase text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      Price:{" "}
                    </span>
                    Rp {item.product.price.toLocaleString("id-ID")}
                  </div>

                  <div className="flex justify-between md:justify-center w-full">
                    <span
                      className="md:hidden uppercase text-sm font-medium"
                      style={{ color: "var(--muted)" }}
                    >
                      Quantity:{" "}
                    </span>
                    <div
                      className="flex items-center border w-fit"
                      style={{
                        borderColor: "var(--surface-border)",
                        color: "var(--foreground)",
                      }}
                    >
                      <button
                        className="px-3 py-2 hover:opacity-70 transition-opacity"
                        onClick={() =>
                          updateQuantity(
                            getCartItemKey(
                              item.product.id,
                              item.productVariantId,
                            ),
                            item.quantity - 1,
                          )
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span
                        className="px-4 py-2 font-medium w-12 text-center border-x"
                        style={{ borderColor: "var(--surface-border)" }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        className="px-3 py-2 hover:opacity-70 transition-opacity"
                        disabled={item.quantity === item.variant?.stock}
                        onClick={() =>
                          updateQuantity(
                            getCartItemKey(
                              item.product.id,
                              item.productVariantId,
                            ),
                            item.quantity < item.variant?.stock
                              ? item.quantity + 1
                              : item.quantity,
                          )
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    className="md:text-right w-full flex justify-between md:block font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    <span
                      className="md:hidden uppercase text-sm font-normal"
                      style={{ color: "var(--muted)" }}
                    >
                      Subtotal:{" "}
                    </span>
                    Rp{" "}
                    {(item.product.price * item.quantity).toLocaleString(
                      "id-ID",
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div
            className="p-8 border"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--surface-border)",
            }}
          >
            <h2
              className="text-xl font-bold uppercase tracking-wider border-b pb-4 mb-6"
              style={{
                color: "var(--foreground)",
                borderColor: "var(--surface-border)",
              }}
            >
              Order Summary
            </h2>

            <div
              className="flex justify-between mb-4"
              style={{ color: "var(--muted)" }}
            >
              <span>Subtotal</span>
              <span>Rp {cartTotal.toLocaleString("id-ID")}</span>
            </div>

            <div
              className="flex justify-between mb-6"
              style={{ color: "var(--muted)" }}
            >
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div
              className="flex justify-between font-bold text-xl border-t pt-6 mb-8 uppercase"
              style={{
                color: "var(--foreground)",
                borderColor: "var(--surface-border)",
              }}
            >
              <span>Total</span>
              <span>Rp {cartTotal.toLocaleString("id-ID")}</span>
            </div>

            <Link href="/checkout">
              <button className="w-full bg-black text-white py-4 px-6 uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                Checkout <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <p
              className="text-center text-sm mt-4"
              style={{ color: "var(--muted)" }}
            >
              Taxes and shipping calculated at checkout
            </p>
          </div>
        </div>
      </div>

      {/* RECOMMENDED PRODUCTS SECTION */}
      {recommendedProducts.length > 0 && (
        <div
          className="mt-16 pt-16 border-t"
          style={{ borderColor: "var(--surface-border)" }}
        >
          <div className="flex flex-col items-center mb-10">
            <h2
              className="text-3xl font-bold uppercase tracking-widest text-center"
              style={{ color: "var(--foreground)" }}
            >
              You May Also Like
            </h2>
            <div
              className="h-1 w-20 mt-4"
              style={{ background: "var(--muted)" }}
            ></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 gap-y-10">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
