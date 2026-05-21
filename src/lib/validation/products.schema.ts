import { z } from "zod";

// const variantSchema = z.object({
//   id: z.string().optional(),
//   size: z.string().min(1, "Size wajib diisi"),
//   color: z.string().default(""),
//   stock: z.number().int().min(0, "Stock minimal 0"),
//   isDeleted: z.boolean().optional(),
// });

// const productSchema = z.object({
//   title: z.string().min(1, "Judul produk wajib diisi"),
//   price: z
//     .number({ message: "Harga wajib diisi" })
//     .int("Harga harus bilangan bulat")
//     .positive("Harga harus lebih dari 0"),
//   description: z.string().min(1, "Deskripsi wajib diisi"),
//   image: z.string().default(""),
//   categoryId: z.string().min(1, "Kategori wajib dipilih"),
//   variants: z
//     .array(variantSchema)
//     .refine(
//       (variants) => variants.filter((v) => !v.isDeleted).length > 0,
//       "Minimal 1 variant harus ada",
//     ),
// });

// // CREATE schema
// export const CreateProductSchema = z.object({
//   ...productSchema,
// });

// const ProductResponseSchema = z.object({
//   id: z.string(),
//   title: z.string(),
//   price: z.number(),
//   description: z.string(),
//   image: z.string(),
//   categoryId: z.string(),
//   variants: z
//     .array(variantSchema)
//     .refine(
//       (variants) => variants.filter((v) => !v.isDeleted).length > 0,
//       "Minimal 1 variant harus ada",
//     ),
//   createdAt: z.date(),
//   updatedAt: z.date(),
// });

// export const UpdateProductSchema = z.object({
//   id: z.string().min(1, "Product ID required"),
//   ...productSchema.partial(), // Semua field optional karena partial()
// });

// export type ProductFormValidation = z.infer<typeof productSchema>;
// export type CreateProduct = z.infer<typeof CreateProductSchema>;
// export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
// export type ProductResponse = z.infer<typeof ProductResponseSchema>;

// ===== VARIANT SCHEMAS =====
const VariantBaseSchema = {
  size: z.string().min(1, "Size wajib diisi"),
  color: z
    .string()
    .nullable()
    .transform((val) => val ?? ""),
  stock: z.number().int().min(0, "Stock minimal 0"),
};

// Untuk input (CREATE/UPDATE)
const VariantInputSchema = z.object({
  id: z.string().optional(), // Untuk update variant
  ...VariantBaseSchema,
  isActive: z.boolean().optional(), // Untuk soft delete variant
  isDeleted: z.boolean().optional(),
});

// Untuk response (dari DB)
export const VariantResponseSchema = z.object({
  id: z.string(),
  ...VariantBaseSchema,
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

// ===== PRODUCT SCHEMAS =====
const ProductBaseSchema = {
  title: z.string().min(1, "Judul produk wajib diisi"),
  price: z
    .number({ message: "Harga wajib diisi" })
    .positive("Harga harus lebih dari 0"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  image: z.string().default(""),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
};

// CREATE schema
export const CreateProductSchema = z.object({
  ...ProductBaseSchema,
  variants: z
    .array(VariantInputSchema)
    .refine(
      (variants) => variants.filter((v) => !v.isDeleted).length > 0,
      "Minimal 1 variant harus ada",
    )
    .refine((variants) => {
      const activeVariants = variants.filter((v) => !v.isDeleted);
      const combinations = activeVariants.map((v) => `${v.size}-${v.color}`);
      return new Set(combinations).size === combinations.length;
    }, "Kombinasi size & color harus unik"),
});

// UPDATE schema
export const UpdateProductSchema = z
  .object({
    id: z.union([z.string()]),
    ...ProductBaseSchema,
  })
  .partial();

// RESPONSE schema
export const ProductResponseSchema = z.object({
  id: z.string(),
  ...ProductBaseSchema,
  variants: z.array(VariantResponseSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ===== TYPE INFERS =====
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ProductVariant = z.infer<typeof VariantInputSchema>;
export type VariantResponse = z.infer<typeof VariantResponseSchema>;
