"use client";

import { ProductForm } from "@/components/admin/ProductForm";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { UpdateProduct } from "@/lib/validation/products.schema";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { data: categories } = useCategories();

  const { data: product, isLoading: productLoading } = useProduct(productId);

  const updateProduct = useUpdateProduct();
  const handleSubmit = async (data: UpdateProduct) => {
    console.log("Submitting data:", data);
    await updateProduct.mutateAsync({ id: productId, data });
    router.push("/admin/products");
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProductForm
        initialData={product}
        categories={categories || []}
        onSubmit={handleSubmit}
        isLoading={updateProduct.isLoading}
      />
    </div>
  );
}
