"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductCardSchema } from "@/lib/validation/products.schema";

const sortOptions = [
  { value: "default", label: "Popular " },
  { value: "name-asc", label: "Name A-Z" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function ProductGrid({ products }: { products: ProductCardSchema[] }) {
  const [sortOption, setSortOption] = useState("default");

  // Map DB products to the shape ProductCard expects
  const mappedProducts = useMemo(() => {
    return products.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.image ?? null,
      variants: p.variants ?? [],
    }));
  }, [products]);

  const sortedProducts = useMemo(() => {
    const items = [...mappedProducts];

    switch (sortOption) {
      case "name-asc":
        return items.sort((a, b) => a.title.localeCompare(b.title));
      case "price-asc":
        return items.sort((a, b) => a.price - b.price);
      case "price-desc":
        return items.sort((a, b) => b.price - a.price);
      default:
        return items;
    }
  }, [sortOption, mappedProducts]);

  return (
    <>
      <div className="mb-8 p-4 shadow-sm transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 ">
          <p className="text-sm uppercase tracking-widest font-semibold">
            Sort Product
          </p>
          <div>
            <label htmlFor="sort" className="sr-only">
              Sort Product
            </label>
            <select
              id="sort"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors duration-200 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-white dark:focus:ring-slate-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
