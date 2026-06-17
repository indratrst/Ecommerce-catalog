"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteModal } from "@/components/admin/DeleteModal";
import { Plus, Package, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import { useDeleteUser } from "@/hooks/useUsers";
import {
  ProductResponse,
  VariantResponse,
} from "@/lib/validation/products.schema";

type ProductWithCategory = ProductResponse & {
  category?: {
    id: string;
    name: string;
  };
};

export default function ProductsPage() {
  const router = useRouter();
  // const [products, setProducts] = useState<any[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // async function fetchProducts() {
  //   setIsLoading(true);
  //   try {
  //     const res = await fetch("/api/products");
  //     const data = await res.json();
  //     setProducts(data);
  //   } catch (error) {
  //     console.error("Failed to fetch products:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // useEffect(() => {
  //   fetchProducts();
  // }, []);

  const { data: products, isLoading } = useProducts();

  // const handleDelete = async () => {
  //   if (!deleteId) return;
  //   setIsDeleting(true);
  //   try {
  //     const res = await fetch(`/api/products/${deleteId}`, {
  //       method: "DELETE",
  //     });
  //     if (res.ok) {
  //       setProducts(products.filter((p) => p.id !== deleteId));
  //       setDeleteId(null);
  //     }
  //   } catch (error) {
  //     console.error("Failed to delete product:", error);
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  const deleteProduct = useDeleteProduct();
  const handleDelete = async () => {
    if (!deleteId) return;

    deleteProduct.mutate(deleteId, {
      onSuccess: (data) => {
        setDeleteId(null);
        // Success toast
        alert("Product deleted successfully");
      },
      onError: (error: any) => {
        // Cek apakah error karena product memiliki orders
        if (
          error.response?.status === 409 ||
          error.message?.includes("CANNOT_DELETE")
        ) {
          alert(
            "Cannot delete product! This product has existing orders in history. " +
              "Deleting it would corrupt order records.",
          );
        } else {
          alert("Failed to delete product");
        }
      },
    });
  };

  const columns = [
    {
      key: "image",
      label: "Product",
      render: (image: string, item: ProductWithCategory) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
            {image ? (
              <Image
                src={image}
                fill
                alt={item.title}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
              {item.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {item.category?.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (price: number) => (
        <span className="font-bold text-slate-900 dark:text-white">
          IDR {price.toLocaleString()}
        </span>
      ),
    },
    {
      key: "variants",
      label: "Stock",
      render: (variants: VariantResponse[]) => {
        const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);
        return (
          <div className="flex flex-col gap-1">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block w-fit ${
                totalStock > 20
                  ? "bg-emerald-100 text-emerald-700"
                  : totalStock > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {totalStock} in stock
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
              {variants.length} SKU{variants.length > 1 ? "s" : ""}
            </span>
          </div>
        );
      },
    },
    {
      key: "id",
      label: "Preview",
      render: (id: string) => (
        <Link
          href={`/product/${id}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-widest px-3 py-1.5 bg-indigo-50 rounded-lg transition-colors group"
        >
          Storefront
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Product Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Control your inventory and showcase your items.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        onEdit={(item) => router.push(`/admin/products/${item.id}/edit`)}
        onDelete={(item) => setDeleteId(item.id)}
        searchPlaceholder="Filter products by title, category..."
      />

      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone and will also remove all its variants."
      />
    </div>
  );
}
