"use client";

import { useProductUnique } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { ProductWithRelations } from "@/lib/data";
import { useSearchParams } from "next/navigation";

interface ProductListClientProps {
  initialData?: ProductWithRelations[];
  categorySlug?: string;
  initialCategory?: string;
  initialSearch?: string;
}

export function ProductListClient({ initialData }: ProductListClientProps) {
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || undefined;
  const activeSearch = searchParams.get("search") || undefined;

  const {
    data: products,
    isLoading,
    isError,
  } = useProductUnique(activeCategory, activeSearch);

  // Fallback to initialData if query hasn't returned yet (for hydration)
  const displayProducts = products || initialData;

  if (isLoading && !displayProducts) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError && !displayProducts) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>Failed to load products. Please try again later.</p>
      </div>
    );
  }

  if (!displayProducts || displayProducts.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
        <p className="text-xl font-medium mb-2">No products found.</p>
        <p>
          Try adjusting your search or filters to find what you &apos;re looking
          for.
        </p>
      </div>
    );
  }

  return <ProductGrid products={displayProducts} />;
}
