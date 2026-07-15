// src/lib/validation/order.schema.ts

import { z } from "zod";
import { ProductResponse, VariantResponse } from "./products.schema";

// Base schema (shared fields)
const OrderBaseSchema = {
  customerName: z.string().min(1, "Customer name is required").max(255),
  customerEmail: z.string().email("Invalid email"),
  customerPhone: z.string().length(10, "Invalid phone number"),
  shippingAddress: z.string().optional().nullable(),
  shippingMethod: z.enum(["PICKUP_STORE", "SHIPPING"]),
  totalAmount: z.number().positive("Total amount must be a positive number"),
  paymentStatus: z.enum([
    "PENDING",
    "SETTLEMENT",
    "EXPIRED",
    "CANCEL",
    "FAILED",
  ]),
  fulfillmentStatus: z.enum([
    "NOT_APPLICABLE",
    "PROCESSING",
    "READY_TO_PICKUP",
    "PICKED_UP",
  ]),
  snapToken: z.string().optional().nullable(),
  snapRedirectUrl: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  externalId: z.string().uuid("Invalid UUID").optional(),
  userId: z.string().uuid("Invalid UUID").optional(),
  stockReduced: z.boolean().default(false),
  shippingCourier: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
};

// CREATE schema
export const CreateOrderSchema = z.object({
  ...OrderBaseSchema,
  items: z.array(
    z.object({
      productId: z.string(),
      productVariantId: z.string(),
      quantity: z.number().positive("Quantity must be a positive number"),
      priceAtPurchase: z
        .number()
        .positive("Price at purchase must be a positive number"),
    }),
  ),
});

// UPDATE schema
export const UpdateOrderSchema = z
  .object({
    id: z.string(),
    ...OrderBaseSchema,
    items: z
      .array(
        z.object({
          productId: z.string(),
          productVariantId: z.string(),
          quantity: z.number().positive("Quantity must be a positive number"),
          priceAtPurchase: z
            .number()
            .positive("Price at purchase must be a positive number"),
        }),
      )
      .optional(), // Optional if no items are being updated
  })
  .partial(); // All fields optional except id

// RESPONSE schema (from DB)
export const OrderSchema = z.object({
  id: z.string(),
  ...OrderBaseSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const OrderDataTableSchema = OrderSchema.omit({
  createdAt: true,
  updatedAt: true,
});

// 1. Buat tipe Variant yang sudah include Product di dalamnya
export type VariantWithProduct = VariantResponse & {
  product?: ProductResponse; // Menyesuaikan dengan schema include backend-mu
};

// 2. Gunakan tipe tersebut di dalam OrderDetail
export type OrderDetail = Order & {
  productVariant: VariantWithProduct;
};
// Infer types
export type CreateOrderData = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderData = z.infer<typeof UpdateOrderSchema>;
export type Order = z.infer<typeof OrderSchema>;
