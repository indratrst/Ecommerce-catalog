import {
  ProductResponseSchema,
  VariantResponseSchema,
} from "@/lib/validation/products.schema";
import { z } from "zod";

// export const CategorySchema = z.object({
//   id: z.union([z.string(), z.number()]).optional(),
//   name: z.string(),
//   slug: z.string().optional(),
//   description: z.string().optional(),
// });

// export const ProductVariantSchema = z.object({
//   id: z.string(),
//   size: z.string(),
//   color: z.string().nullable().optional(),
//   stock: z.number(),
//   isActive: z.boolean(),
// });

// export const ProductSchema = z.object({
//   id: z.union([z.string(), z.number()]),
//   title: z.string(), // Sesuai dengan format FakeStoreAPI / DummyJSON
//   price: z.number(),
//   description: z.string(),
//   category: z.string(),
//   image: z.string().optional(),
//   rating: z
//     .object({
//       rate: z.number(),
//       count: z.number(),
//     })
//     .optional(),
// });

// export const ProductVariantSchema = z.object({
//   id: z.string().optional(),
//   size: z.string().min(1, "Size wajib diisi"),
//   color: z.string().default(""),
//   stock: z.number().int().min(0, "Stock minimal 0"),
//   isDeleted: z.boolean().optional(),
// });

export const CartItemSchema = z.object({
  product: ProductResponseSchema,
  quantity: z.number().min(1),
  productVariantId: z.string().optional(),
  variant: VariantResponseSchema.optional(),
});

// export const ProductBaseSchema = z.object({
//   title: z.string().min(1, "Judul produk wajib diisi"),
//   price: z
//     .number({ message: "Harga wajib diisi" })
//     .int("Harga harus bilangan bulat")
//     .positive("Harga harus lebih dari 0"),
//   description: z.string().min(1, "Deskripsi wajib diisi"),
//   image: z.string().default(""),
//   categoryId: z.string().min(1, "Kategori wajib dipilih"),
//   variants: z
//     .array(ProductVariantSchema)
//     .refine(
//       (variants) => variants.filter((v) => !v.isDeleted).length > 0,
//       "Minimal 1 variant harus ada",
//     ),
// });
// // export type Category = z.infer<typeof CategorySchema>;
// export type Product = z.infer<typeof ProductSchema>;
// export type ProductVariantSchema = z.infer<typeof ProductVariantSchema>;
// export type ProductBaseSchema = z.infer<typeof ProductBaseSchema>;

export const Error = z.object({
  response: z
    .object({
      status: z.number().optional(),
    })
    .optional(),
  message: z.string().optional(),
});

export type ErrorSchema = z.infer<typeof Error>;
export type CartItem = z.infer<typeof CartItemSchema>;
