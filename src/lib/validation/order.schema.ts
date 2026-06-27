// src/lib/validation/order.schema.ts

import { z } from "zod";

// Base schema (shared fields)
const OrderBaseSchema = {
  customerName: z.string().min(1, "Customer name is required").max(255),
  customerEmail: z.string().email("Invalid email"),
  customerPhone: z.string().length(10, "Invalid phone number"),
  shippingAddress: z.string().optional().nullable(),
  totalAmount: z.number().positive("Total amount must be a positive number"),
  status: z.enum(["PENDING", "SETTLEMENT", "EXPIRED", "CANCEL", "FAILED"]),
  snapToken: z.string().optional().nullable(),
  snapRedirectUrl: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  externalId: z.string().uuid("Invalid UUID").optional(),
  stockReduced: z.boolean().default(false),
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

// Infer types
export type CreateOrderData = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderData = z.infer<typeof UpdateOrderSchema>;
export type Order = z.infer<typeof OrderSchema>;
