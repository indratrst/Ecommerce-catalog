"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";

type Variant = {
  id: string;
  size: string;
  stock?: number;
};

type Product = {
  id: string;
  title: string;
  image?: string | null;
  category?: string | null;
  price: number;
  variants?: Variant[] | null;
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.variants?.[0]?.size ?? null,
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    // if (product.variants && product.variants.length > 0) {
    //   const firstInStock = product.variants.find((v) => v.stock > 0);
    //   setSelectedSize(firstInStock ? firstInStock.size : null);
    // }

    console.log(product);
  }, [product.variants]);

  const handleAddToCart = () => {
    // Cek apakah produk memiliki variants dan perlu memilih ukuran
    if (product.variants && product.variants.length > 0 && !selectedSize) {
      console.warn("Please select a size");
      return;
    }

    setIsAddingToCart(true);

    // Dapatkan variant yang dipilih
    const selectedVariant = product.variants?.find(
      (v) => v.size === selectedSize,
    );

    // Siapkan data variant untuk cart
    const cartVariant = selectedVariant
      ? {
          id: selectedVariant.id,
          size: selectedVariant.size,
        }
      : undefined;

    // Panggil fungsi addToCart dari context
    addToCart(
      product,
      1, // quantity
      cartVariant,
    );

    // Reset loading state setelah delay
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  };

  return (
    <motion.div initial={false} whileHover="hover" className="group">
      <motion.div
        variants={{
          hover: {
            y: -8,
            boxShadow: "0 25px 40px -12px rgba(0,0,0,0.25)",
            transition: {
              type: "spring",
              stiffness: 700,
              damping: 22,
            },
          },
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 22,
        }}
        className="
          overflow-hidden
          rounded-[28px]
          border
          border-neutral-200
          bg-white
          shadow-[0_4px_30px_rgba(0,0,0,0.07)]
        "
      >
        {/* IMAGE AREA */}
        <div className="relative overflow-hidden">
          <Link href={`/product/${product.id}`}>
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
              {product.image ? (
                <motion.img
                  src={product.image}
                  alt={product.title}
                  variants={{
                    hover: {
                      scale: 1.08,
                    },
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  No Image
                </div>
              )}

              {/* gradient */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/15
                  via-transparent
                  to-transparent
                "
              />
            </div>
          </Link>

          {/* Wishlist */}
          {/* <motion.button
            whileTap={{ scale: 0.9 }}
            className="
              absolute
              right-4
              top-4
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white/90
              backdrop-blur-md
              shadow-lg
            "
          >
            <Heart size={18} />
          </motion.button> */}

          {/* Quick Add */}
        </div>

        {/* CONTENT */}
        <div className="space-y-3 p-5">
          {/* category */}
          <span
            className="
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-neutral-400
            "
          >
            {product.category?.name}
          </span>

          {/* title */}
          <Link href={`/product/${product.id}`}>
            <h3
              className="
                line-clamp-2
                text-[15px]
                font-semibold
                leading-snug
                text-neutral-900
                transition-colors
                hover:text-neutral-600
              "
            >
              {product.title}
            </h3>
          </Link>

          {/* footer */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-neutral-900
                "
              >
                Rp {product.price.toLocaleString("id-ID")}
              </p>

              <p
                className="
                  text-sm
                  text-neutral-400
                  line-through
                "
              >
                Rp {(product.price * 1.25).toLocaleString("id-ID")}
              </p>
            </div>

            <div
              className="
                rounded-full
                bg-green-50
                px-3
                py-1
                text-xs
                font-medium
                text-green-600
              "
            >
              -20%
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {product.variants
              .filter(
                (variant: { stock: number; isActive: boolean }) =>
                  variant.stock > 0 && variant.isActive,
              )
              .map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedSize(variant.size)}
                  className={`
          h-9
          min-w-9
          px-3
          rounded-full
          border
          text-sm
          font-medium
          transition-all
          ${
            selectedSize === variant.size
              ? "bg-black text-white border-black"
              : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
          }
        `}
                >
                  {variant.size}
                </button>
              ))}
          </div>
          {/* ADD TO CART BUTTON (moved to bottom) */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="
              mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg
              bg-neutral-900 text-sm font-medium text-white transition-all
              hover:bg-neutral-800 active:scale-95
              dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200
              disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {isAddingToCart ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-neutral-900" />
            ) : (
              <>
                <ShoppingBag size={16} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
