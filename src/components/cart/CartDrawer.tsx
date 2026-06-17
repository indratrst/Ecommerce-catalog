"use client";

import { useCart } from "@/contexts/CartContext";
import { getCartItemKey } from "@/store/useCartStore";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
// import { getItemStock } from "@/lib/cart";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  // const stock = getItemStock(cart);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCartOpen(false);
    };
    if (isCartOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [cart, isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-xl flex flex-col transform transition-transform duration-300"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--surface-border)" }}
        >
          <h2
            className="text-xl font-bold uppercase tracking-wider flex items-center gap-2"
            style={{ color: "var(--foreground)" }}
          >
            <ShoppingBag className="h-5 w-5" />
            Your Cart
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 transition-colors rounded hover:opacity-70"
            style={{ color: "var(--foreground)" }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {cart.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 space-y-4"
              style={{ color: "var(--muted)" }}
            >
              <ShoppingBag className="h-16 w-16 opacity-20" />
              <p className="text-lg">No products in the cart.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 border px-6 py-2 uppercase transition-colors hover:bg-black hover:text-white"
                style={{ borderColor: "var(--foreground)" }}
              >
                Return to shop
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.map((item) => {
                const itemKey = getCartItemKey(
                  item.product.id,
                  item.productVariantId,
                );
                return (
                  <li
                    key={itemKey}
                    className="flex gap-4 border-b pb-6"
                    style={{ borderColor: "var(--surface-border)" }}
                  >
                    <div
                      className="h-24 w-20 shrink-0 overflow-hidden"
                      style={{ background: "var(--surface)" }}
                    >
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.title}
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="h-full w-full"
                          style={{ background: "var(--surface)" }}
                        />
                      )}
                    </div>

                    <div className="flex flex-col flex-1 justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3
                            className="font-semibold text-sm uppercase line-clamp-2 pr-4"
                            style={{ color: "var(--foreground)" }}
                          >
                            {item.product.title}
                          </h3>

                          <p className="text-xs text-muted-foreground uppercase tracking-widest py-1">
                            Size: {item.variant.size}
                          </p>
                          {/* <p className="text-xs text-muted-foreground uppercase tracking-widest">
                            Stock: {item.variant.stock}
                          </p> */}
                          <p
                            className="mt-1 text-sm font-medium"
                            style={{ color: "var(--muted)" }}
                          >
                            Rp {item.product.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(itemKey)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div
                        className="flex items-center gap-3 mt-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        <div
                          className="flex items-center border"
                          style={{ borderColor: "var(--surface-border)" }}
                        >
                          <button
                            className="px-2 py-1 hover:opacity-70 transition-opacity"
                            onClick={() =>
                              updateQuantity(itemKey, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span
                            className="px-4 py-1 text-sm font-medium w-12 text-center border-x"
                            style={{ borderColor: "var(--surface-border)" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            className="px-2 py-1 hover:opacity-70 transition-opacity"
                            disabled={item.quantity === item.variant?.stock}
                            onClick={() =>
                              updateQuantity(
                                itemKey,
                                item.quantity < item.variant?.stock
                                  ? item.quantity + 1
                                  : item.quantity,
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div
                          className="ml-auto font-bold text-sm"
                          style={{ color: "var(--foreground)" }}
                        >
                          Rp{" "}
                          {(item.product.price * item.quantity).toLocaleString(
                            "id-ID",
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Recommended Section inline with the scrollable area */}
          {/* <div
            className="mt-6 pt-6 border-t"
            style={{ borderColor: "var(--surface-border)" }}
          >
            <h3
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: "var(--foreground)" }}
            >
              You may also like
            </h3>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
              {recommendedProducts.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[140px] snap-start flex flex-col group gap-2"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="block relative aspect-[3/4] overflow-hidden"
                    onClick={() => setIsCartOpen(false)}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        className="text-xs font-semibold uppercase line-clamp-1"
                        style={{ color: "var(--foreground)" }}
                      >
                        {product.title}
                      </h4>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-2 text-xs font-bold uppercase flex items-center justify-center gap-1 py-1 border transition-colors hover:bg-black hover:text-white"
                      style={{
                        borderColor: "var(--foreground)",
                        color: "var(--foreground)",
                      }}
                    >
                      <PlusCircle className="h-3 w-3" /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {cart.length > 0 && (
          <div
            className="border-t p-4 shrink-0"
            style={{
              borderColor: "var(--surface-border)",
              background: "var(--card-bg)",
            }}
          >
            <div
              className="flex justify-between items-center mb-6 text-lg font-bold"
              style={{ color: "var(--foreground)" }}
            >
              <span>Subtotal</span>
              <span>Rp {cartTotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="space-y-3">
              <div className="group relative h-12 bg-[#222] text-center rounded-[0.45em] font-arial transition-colors duration-300 hover:bg-[#222]">
                {/* <div className="absolute w-[90px] h-[35px] bg-[#555] text-[0.9rem] text-white rounded-[0.25em] leading-[35px] bottom-[calc(35px+18px+10px)] left-[calc(50%-45px)] opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:bottom-[calc(35px+18px)] transition-all duration-500 pointer-events-none">
                  Price:-$20
                </div>

                <div className="absolute w-0 h-0 border-[10px] border-transparent border-t-[#555] left-[calc(50%-10px)] bottom-[calc(100%+18px-10px)] opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:bottom-[calc(35px+18px-20px)] transition-all duration-500 pointer-events-none"></div> */}

                {/* Button Content */}
                <Link href="/cart">
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="relative block w-full h-full overflow-hidden group border-2 font-bold uppercase tracking-wider transition-colors hover:opacity-70"
                  >
                    <div className="absolute w-full h-full left-0 top-0 text-white flex items-center justify-center transition-all duration-500 group-hover:-top-full">
                      View Cart
                    </div>
                    <div className="absolute w-full h-full left-0 top-full text-white flex items-center justify-center transition-all duration-500 group-hover:top-0">
                      <svg
                        viewBox="0 0 16 16"
                        className="bi bi-cart2 fill-current w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
                      </svg>
                    </div>
                  </button>
                </Link>
              </div>

              <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                <button className="w-full py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors">
                  Checkout
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
