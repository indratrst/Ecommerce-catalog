"use client";

import { useState } from "react";
import { Column, DataTable } from "@/components/admin/DataTable";
import { DeleteModal } from "@/components/admin/DeleteModal";
import { Package, Plus, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { CategoryWithCount } from "@/lib/validation/category.schema";
import Image from "next/image";

export default function CategoriesPage() {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories, isLoading: categoryLoading } = useCategories();

  const deleteCategory = useDeleteCategory();
  const isDeleting = deleteCategory.isPending;
  const handleDelete = async () => {
    if (!deleteId) return;
    deleteCategory.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        // fetchCategories(); // atau invalidate query
      },
    });
  };

  const columns: Column<CategoryWithCount>[] = [
    {
      key: "image",
      label: "Category Name",
      render: (image, item) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
            {image ? (
              <Image
                src={image}
                fill
                alt={item.name}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              {item.name}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
              /{item.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (desc) => (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">
          {desc || "No description"}
        </p>
      ),
    },
    {
      key: "_count",
      label: "Products",
      render: (count) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {count?.products || 0} items
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Categories
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Organize your products into logical groups.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        isLoading={categoryLoading}
        onEdit={(item) => router.push(`/admin/categories/${item.id}/edit`)}
        onDelete={(item) => setDeleteId(item.id)}
        searchPlaceholder="Filter categories by name..."
      />

      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Category"
        description="Are you sure you want to delete this category? Products associated with this category might need to be reassigned."
      />
    </div>
  );
}
