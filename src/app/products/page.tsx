import { getCategories, getProducts } from "@/lib/data";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ProductListClient } from "@/components/products/ProductListClient";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const { category: categorySlug, search } = resolvedSearchParams;

  const queryClient = new QueryClient();

  // Prefetch products based on search params
  await queryClient.prefetchQuery({
    queryKey: ["products", { category: categorySlug, search }],
    queryFn: () => getProducts(categorySlug, search),
  });

  const categories = await getCategories();

  // Get active category name if applicable
  let categoryName = "All Products";
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { name: true },
    });
    if (category) {
      categoryName = category.name;
    }
  }

  return (
    <>
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage: `url('${
              categories?.find((category) => category.name === categoryName)
                ?.image ?? "/images/homepage/work-office-hero.png"
            }')`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 flex flex-col items-center max-w-4xl">
          <span className="text-white/85 font-semibold tracking-[0.28em] uppercase mb-4 text-xs md:text-sm">
            Latest Collection
          </span>
          <h1 className="font-heading text-6xl md:text-8xl font-semibold text-white mb-6 leading-[0.95]">
            {categoryName}
          </h1>
          <p className="text-base md:text-lg text-gray-200 mb-10 max-w-2xl font-medium leading-8">
            Discover premium streetwear and lifestyle essentials designed for
            those who appreciate quality and style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#products-display"
              className="bg-white text-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group"
            >
              Shop New Arrivals
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#products-display"
              className="bg-transparent border-2 border-white text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT LIST SECTION */}
      <section id="products-display" className="w-full  sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title / Header */}
          <h2
            className="font-heading text-5xl md:text-6xl font-semibold inline-block relative ps-2"
            style={{ color: "var(--foreground)" }}
          >
            {search ? `Search: ${search}` : categoryName}
            <span
              className="absolute -bottom-5 left-0 h-1 mt-6"
              style={{
                background: "var(--foreground)",
                width: "110%",
              }}
            ></span>
          </h2>

          {/* Hydrated Client Component (Product Cards) */}
          <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductListClient />
          </HydrationBoundary>
        </div>
      </section>
    </>
  );
}
