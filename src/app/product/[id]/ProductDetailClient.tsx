"use client";

import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import {
  ProductResponse,
  VariantResponse,
} from "@/lib/validation/products.schema";
import Image from "next/image";

type ProductWithCategory = ProductResponse & {
  category?: {
    id: string;
    name: string;
  };
};

export default function ProductDetailClient({
  product,
  totalStock,
  variants,
}: {
  product: ProductWithCategory;
  totalStock: number;
  variants: VariantResponse[];
}) {
  const { cart, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    variants.length > 0 ? variants[0].size : null,
  );

  const selectedVariant = variants.find(
    (v: VariantResponse) => v.size === selectedSize && v.isActive,
  );
  const currentStock = selectedVariant ? selectedVariant.stock : totalStock;

  const cartItem = cart.find(
    (item) =>
      item.product.id === product.id &&
      item.productVariantId === selectedVariant?.id,
  );

  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const remainingStock = currentStock - cartQuantity;

  const handleAddToCart = () => {
    if (remainingStock <= 0) {
      alert("Stok habis di keranjang");
      return;
    }
    const safeQuantity = Math.min(quantity, remainingStock);
    setQuantity(1);
    addToCart(
      product,
      safeQuantity,
      selectedVariant ?? undefined,
      currentStock,
    );
  };

  const getStockColor = (currentStock: number) => {
    if (currentStock === 0) return "text-brick-ember-600";
    if (currentStock < 5) return "text-amber-flame-700";
    return "text-white";
  };

  const getStockMessage = (currentStock: number) => {
    if (currentStock === 0) return "Out of Stock";
    if (currentStock === 1) return `Only 1 left!`;
    if (currentStock < 5) return `Only ${currentStock} left!`;
    return `${currentStock} in stock`;
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl mt-5">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-10 transition-colors hover:opacity-70"
        style={{ color: "var(--muted)" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
        {/* Product Image */}
        <div
          className="w-full md:w-1/2 aspect-4/5 relative overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover object-center"
              width={500}
              height={500}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ color: "var(--muted)" }}
            >
              No Image Available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="mb-2">
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "var(--muted)" }}
            >
              {product?.category?.name}
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-4"
            style={{ color: "var(--foreground)" }}
          >
            {product.title}
          </h1>

          {/* MODIFIKASI: Section Harga Dinamis (Harga Aktif + Harga Coret + Badge Diskon) */}
          <div className="flex items-baseline gap-4 mb-8">
            <p
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              Rp {product.price.toLocaleString("id-ID")}
            </p>

            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <p className="text-md md:text-lg text-cool-steel-400 line-through">
                  Rp {product.originalPrice.toLocaleString("id-ID")}
                </p>
                <div className="rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-steel-blue-600">
                  -
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100,
                  )}
                  % OFF
                </div>
              </>
            )}
          </div>

          <div
            className="text-sm leading-relaxed mb-10 space-y-3"
            style={{ color: "var(--muted)" }}
          >
            <p>{product.description}</p>
            <p>
              <strong style={{ color: "var(--foreground)" }}>
                Syarat & Ketentuan Return Produk:
              </strong>
              <br />
              – Penukaran / Pengembalian Barang Tidak Berlaku Untuk Tukar Size
              dan Penukaran / Pengembalian Barang Maksimal 3 Hari Setelah Barang
              Diterima.
              <br />– Kondisi Hang Tag Label Masih Terpasang.
            </p>
          </div>

          {/* Size Selector */}
          {variants.length > 0 && (
            <div className="mb-8">
              <p
                className="text-sm font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant: VariantResponse) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedSize(variant.size)}
                    className={`px-4 py-2 border-2 text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                      selectedSize === variant.size
                        ? "bg-deep-space-blue-900 text-white border-deep-space-blue-900"
                        : variant.stock === 0
                          ? "border-cool-steel-200 text-cool-steel-300 cursor-not-allowed line-through"
                          : "border-cool-steel-300 hover:border-deep-space-blue-900"
                    }`}
                    style={
                      selectedSize === variant.size
                        ? {}
                        : {
                            color:
                              variant.stock === 0
                                ? undefined
                                : "var(--foreground)",
                          }
                    }
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 mb-8">
            <div
              className="flex items-center border-2 w-fit"
              style={{
                borderColor: "var(--foreground)",
                color: "var(--foreground)",
              }}
            >
              <button
                className="px-4 py-3 hover:opacity-70 transition-opacity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-5 w-5" />
              </button>
              <span
                className="px-6 py-3 font-bold text-center border-x-2 min-w-15"
                style={{ borderColor: "var(--foreground)" }}
              >
                {quantity}
              </span>
              <button
                disabled={quantity >= remainingStock}
                className="px-4 py-3 hover:opacity-70 transition-opacity"
                onClick={() =>
                  setQuantity((q) => Math.min(currentStock, q + 1))
                }
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p
              className={`text-sm font-bold uppercase tracking-widest ${getStockColor(currentStock)}`}
            >
              {getStockMessage(currentStock)}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0 || cartQuantity === currentStock}
            className={`w-full py-4 px-8 uppercase font-bold tracking-widest flex items-center justify-center gap-3 shadow-lg transition-colors ${
              currentStock === 0
                ? "bg-cool-steel-200 text-cool-steel-500 cursor-not-allowed"
                : "bg-deep-space-blue-900 text-white hover:bg-steel-blue-700"
            }`}
          >
            <ShoppingBag className="h-6 w-6" />
            {currentStock === 0
              ? "Out of Stock"
              : cartQuantity === currentStock
                ? "Max Stock Reached"
                : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
