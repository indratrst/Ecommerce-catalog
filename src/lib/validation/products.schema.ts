import { z } from "zod";
import { CategoryResponseSchema } from "./category.schema";

// ===== VARIANT SCHEMAS =====
const VariantBaseSchema = {
  size: z.string().min(1, "Size wajib diisi"),
  color: z.string().nullable().optional(),
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
  originalPrice: z
    .number()
    .positive("Harga asli harus lebih dari 0")
    .nullable()
    .optional(),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  image: z.string().nullable(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
};

// CREATE schema
export const CreateProductSchema = z
  .object({
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
  })
  // Validasi Logika: Harga Coret harus lebih besar dari Harga Jual Aktual
  .refine(
    (data) => {
      if (data.originalPrice && data.originalPrice <= data.price) {
        return false;
      }
      return true;
    },
    {
      message: "Harga asli (harga coret) harus lebih besar dari harga jual",
      path: ["originalPrice"], // Pesan error akan muncul tepat di field originalPrice
    },
  );

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
  category: CategoryResponseSchema.optional(),
  variants: z.array(VariantResponseSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProductCardSchema = ProductResponseSchema.omit({
  createdAt: true,
  updatedAt: true,
  categoryId: true,
});

// ===== TYPE INFERS =====
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ProductVariant = z.infer<typeof VariantInputSchema>;
export type VariantResponse = z.infer<typeof VariantResponseSchema>;
export type ProductCardSchema = z.infer<typeof ProductCardSchema>;
