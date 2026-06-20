import { z } from "zod";

// Base schema (shared fields)
const CategoryBaseSchema = {
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string(),
  description: z.string().optional().nullable(),
};

// CREATE schema
export const CreateCategorySchema = z.object({
  ...CategoryBaseSchema,
});

// UPDATE schema
export const UpdateCategorySchema = z
  .object({
    id: z.union([z.string()]),
    ...CategoryBaseSchema,
  })
  .partial(); // Semua field optional except id

// RESPONSE schema (from DB)
export const CategoryResponseSchema = z.object({
  id: z.string(),
  ...CategoryBaseSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CategoryDataTableSchema = CategoryResponseSchema.omit({
  createdAt: true,
  updatedAt: true,
});

// Infer types
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
export type CategoryWithCount = CategoryResponse & {
  _count: {
    products?: number;
  };
};
export type CategoryDataTableSchema = z.infer<typeof CategoryDataTableSchema>;
