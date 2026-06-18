import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ProductResponse } from "@/lib/validation/products.schema";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;

  // Actions
  addItem: (
    product: ProductResponse,
    quantity?: number,
    maxStock?: number,
    variant?: CartItem["variant"],
  ) => void;
  removeItem: (itemKey: string | number) => void;
  updateQuantity: (
    itemKey: string | number,
    quantity: number,
    maxStock?: number,
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;

  // Getters (computed as values)
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const getCartItemKey = (
  productId: string | number,
  variantId?: string,
) => (variantId ? `${productId}-${variantId}` : String(productId));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (product, quantity = 1, maxStock, variant) => {
        const currentItems = get().items;
        const itemKey = getCartItemKey(product.id, variant?.id);
        const existingItem = currentItems.find(
          (item) =>
            getCartItemKey(item.product.id, item.productVariantId) === itemKey,
        );

        if (existingItem) {
          const currentQty = existingItem.quantity;

          // 🔥 hitung sisa stok yang bisa ditambah
          const remainingStock =
            maxStock !== undefined ? maxStock - currentQty : Infinity;

          // kalau sudah habis
          if (remainingStock <= 0) return;

          // 🔥 jangan lebih dari sisa stok
          const allowedQuantity = Math.min(quantity, remainingStock);

          const finalQuantity = currentQty + allowedQuantity;
          set({
            items: currentItems.map((item) =>
              getCartItemKey(item.product.id, item.productVariantId) === itemKey
                ? { ...item, quantity: finalQuantity }
                : item,
            ),
          });
        } else {
          const finalQuantity =
            maxStock !== undefined ? Math.min(quantity, maxStock) : quantity;
          set({
            items: [
              ...currentItems,
              {
                product,
                quantity: finalQuantity,
                productVariantId: variant?.id,
                variant: variant ? { ...variant } : undefined,
              },
            ],
          });
        }

        set({ isCartOpen: true });
      },

      removeItem: (itemKey) => {
        const key = String(itemKey);
        set({
          items: get().items.filter(
            (item) =>
              getCartItemKey(item.product.id, item.productVariantId) !== key,
          ),
        });
      },

      updateQuantity: (itemKey, quantity, maxStock) => {
        if (quantity < 1) {
          get().removeItem(itemKey);
          return;
        }

        const key = String(itemKey);
        const finalQuantity =
          maxStock !== undefined ? Math.min(quantity, maxStock) : quantity;

        set({
          items: get().items.map((item) =>
            getCartItemKey(item.product.id, item.productVariantId) === key
              ? { ...item, quantity: finalQuantity }
              : item,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "shopping-cart-storage", // key in localStorage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
