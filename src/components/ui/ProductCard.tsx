"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  ProductResponse,
  VariantResponse,
} from "@/lib/validation/products.schema";

// type Variant = {
//   id: string;
//   size: string;
//   stock: number;
//   isActive?: boolean;
// };

// type Product = {
//   id: string;
//   title: string;
//   image?: string | null;
//   category?: { name: string } | null;
//   price: number;
//   variants: Variant[];
// };

// interface ProductCardProps {
//   product: Product;
// }

type ProductWithCategory = ProductResponse & {
  category?: {
    id: string;
    name: string;
    slug: string;
  };
};

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.variants?.[0]?.size ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const { cart, addToCart } = useCart();
  const totalStock = product.variants.reduce(
    (sum: number, v: VariantResponse) => sum + v.stock,
    0,
  );
  const selectedVariant = product.variants?.find(
    (v: VariantResponse) => v.size === selectedSize && v.isActive,
  );

  console.log(selectedVariant);
  const currentStock = selectedVariant ? selectedVariant.stock : totalStock;
  const cartItem = cart.find(
    (item) =>
      item.product.id === product.id &&
      item.productVariantId === selectedVariant?.id,
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const remainingStock = currentStock - cartQuantity;
  // useEffect(() => {
  //   // if (product.variants && product.variants.length > 0) {
  //   //   const firstInStock = product.variants.find((v) => v.stock > 0);
  //   //   setSelectedSize(firstInStock ? firstInStock.size : null);
  //   // }

  //   console.log(product);
  // }, [product, product.variants]);

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
    if (currentStock === 0) return "text-red-500";
    if (currentStock < 5) return "text-orange-500";
    return "text-black";
  };

  const getStockMessage = (currentStock: number) => {
    if (currentStock === 0) return "Out of Stock";
    if (currentStock === 1) return `Only 1 left!`;
    if (currentStock < 5) return `Only ${currentStock} left!`; // Optional: untuk currentStock 2-4
    return `${currentStock} in stock`;
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
            <div className="relative aspect-4/5 overflow-hidden bg-neutral-100">
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
                  bg-linear-to-t
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
        <div className="space-y-3 py-5 px-5">
          {/* category */}
          <Link href={`/products?category=${product.category?.slug}`}>
            <span
              className="
              uppercase
              tracking-wider
              border border-black text-black text-xs font-medium px-2 py-1 rounded
              hover:bg-black hover:text-white transition-colors
            "
            >
              {product.category?.name}
            </span>
          </Link>
          {/* title */}
          <Link href={`/product/${product.id}`}>
            <h3
              className="
                line-clamp-2
                text-[16px]
                font-semibold
                leading-snug
                text-neutral-900
                transition-colors
                hover:text-neutral-600
                mt-3
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
            {product?.variants
              .filter(
                (variant: VariantResponse) =>
                  variant.stock > 0 && variant.isActive,
              )
              .map((variant: VariantResponse) => (
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

          <p
            className={`text-sm font-bold uppercase tracking-widest ${getStockColor(currentStock)}`}
          >
            {getStockMessage(currentStock)}
          </p>
          {/* ADD TO CART BUTTON (moved to bottom) */}
          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0 || cartQuantity === currentStock}
            className={`w-full py-4 px-8 uppercase font-bold tracking-widest flex items-center justify-center gap-3 shadow-lg transition-colors rounded-4xl ${
              currentStock === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
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
      </motion.div>
    </motion.div>
  );
}
