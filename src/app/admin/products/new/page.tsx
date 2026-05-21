"use client";

import { useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct } from "@/hooks/useProducts";
import { CreateProduct } from "@/lib/validation/products.schema";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: categories } = useCategories();

  const createProduct = useCreateProduct();
  const handleSubmit = async (data: CreateProduct) => {
    console.log("Submitting data:", data);
    await createProduct.mutateAsync(data);
    router.push("/admin/products");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={loading}
        categories={categories || []}
      />
    </div>
  );
}
