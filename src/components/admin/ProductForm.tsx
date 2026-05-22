"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2, Plus, ArrowLeft, Trash2, Box, Info } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "./ImageUpload";
// import { ProductBaseSchema } from "@/types";
import { CategoryResponse } from "@/lib/validation/category.schema";
import type { FieldErrors } from "react-hook-form";
import {
  CreateProduct,
  CreateProductSchema,
  ProductVariant,
} from "@/lib/validation/products.schema";
import { useEffect } from "react";

// ─── Props ───────────────────────────────────────────────────

interface ProductFormProps {
  initialData?: {
    title?: string;
    price?: number;
    description?: string;
    image?: string;
    categoryId?: string | number;
    variants?: ProductVariant[];
  };
  onSubmit: (data: CreateProduct) => Promise<void>;
  isLoading?: boolean;
  categories?: CategoryResponse[];
}

export function ProductForm({
  initialData,
  onSubmit,
  isLoading,
  categories,
}: ProductFormProps) {
  // ── React Hook Form ──────────────────────────────────────
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateProduct>({
    resolver: standardSchemaResolver(
      CreateProductSchema,
    ) as import("react-hook-form").Resolver<CreateProduct>,
    defaultValues: {
      title: initialData?.title || "",
      price: initialData?.price || 0,
      description: initialData?.description || "",
      image: initialData?.image || "",
      categoryId: String(initialData?.categoryId ?? ""),
      variants: initialData?.variants
        ?.filter((v: ProductVariant) => v.isActive)
        .map((v: ProductVariant) => ({
          id: v.id,
          size: v.size,
          stock: v.stock,
          color: v.color || "",
        })) || [{ size: "One Size", stock: 0, color: "" }],
    },
  });

  const watchedImage = useWatch({ control, name: "image" });
  const watchedVariants = useWatch({ control, name: "variants" });
  const watchedCategoryId = useWatch({ control, name: "categoryId" });

  // ── Fetch Categories ─────────────────────────────────────

  useEffect(() => {
    if (
      categories &&
      categories.length > 0 &&
      !initialData && // Only for new product
      !watchedCategoryId // Only if not already set
    ) {
      setValue("categoryId", String(categories[0].id));
    }
  }, [categories, initialData, setValue, watchedCategoryId]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  if (!categories && !initialData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ── Variant Helpers ──────────────────────────────────────
  const addVariant = () => {
    append({ size: "", stock: 0, color: "" });
  };

  const removeVariant = (index: number) => {
    const current = watchedVariants[index];
    if (current?.id) {
      // Variant lama (ada di DB) → soft delete
      setValue(`variants.${index}.isDeleted`, true);
    } else {
      // Variant baru → hard remove
      remove(index);
    }
  };

  // Count visible (non-deleted) variants
  const visibleCount = watchedVariants.filter((v) => !v.isDeleted).length;

  // ── Submit Handler ───────────────────────────────────────
  const onFormSubmit = (data: CreateProduct) => {
    onSubmit(data);
  };

  const onFormError = (errors: FieldErrors<CreateProduct>) => {
    console.log("❌ Validation errors:", errors);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          {initialData ? "Edit Product" : "New Product"}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onFormSubmit, onFormError)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* ═══ Main Info ═══ */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-600">
              <Info className="w-5 h-5" />
              General Information
            </h3>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                Product Title
              </label>
              <input
                {...register("title")}
                placeholder="e.g. Classic Logo T-Shirt"
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Price + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  Price (IDR)
                </label>
                <input
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${
                    errors.price
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.price && (
                  <p className="text-xs text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  Category
                </label>
                <select
                  {...register("categoryId")}
                  value={watchedCategoryId || ""}
                  onChange={(e) => setValue("categoryId", e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none ${
                    errors.categoryId
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <option value="" disabled>
                    {!categories
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={6}
                placeholder="Product details and specifications..."
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* ═══ Variants ═══ */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-600">
                <Box className="w-5 h-5" />
                Inventory & Variants
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>

            {/* Variant-level error (e.g. "minimal 1 variant") */}
            {errors.variants?.root && (
              <p className="text-xs text-red-500">
                {errors.variants.root.message}
              </p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => {
                // Skip soft-deleted variants
                if (watchedVariants[index]?.isDeleted) return null;

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative group"
                  >
                    {/* Hidden field for DB id */}
                    <input
                      type="hidden"
                      {...register(`variants.${index}.id`)}
                    />

                    {/* Size */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Size
                      </label>
                      <input
                        {...register(`variants.${index}.size`)}
                        placeholder="e.g. M"
                        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs dark:text-white ${
                          errors.variants?.[index]?.size
                            ? "border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                      {errors.variants?.[index]?.size && (
                        <p className="text-[10px] text-red-500">
                          {errors.variants[index].size.message}
                        </p>
                      )}
                    </div>

                    {/* Color */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Color
                      </label>
                      <input
                        {...register(`variants.${index}.color`)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                      />
                    </div>

                    {/* Stock */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Stock
                      </label>
                      <input
                        {...register(`variants.${index}.stock`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="0"
                        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs dark:text-white ${
                          errors.variants?.[index]?.stock
                            ? "border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                      {errors.variants?.[index]?.stock && (
                        <p className="text-[10px] text-red-500">
                          {errors.variants[index].stock.message}
                        </p>
                      )}
                    </div>

                    {/* Delete button */}
                    <div className="flex items-end justify-end">
                      {visibleCount > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ Sidebar / Media ═══ */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <ImageUpload
              value={watchedImage ?? ""}
              onChange={(url) => setValue("image", url)}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 sticky top-24">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase text-slate-400 tracking-widest">
                Actions
              </h4>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>{initialData ? "Update Product" : "Publish Product"}</>
                )}
              </button>

              <Link
                href="/admin/products"
                className="w-full py-4 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
