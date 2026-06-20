import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/data";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ProductListClient } from "@/components/products/ProductListClient";

const categories = [
  {
    title: "Clothing",
    image:
      "https://images.unsplash.com/photo-1516826957135-700ede19c6ce?q=80&w=800&auto=format&fit=crop",
    link: "/category/clothing",
  },
  {
    title: "Bags",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop",
    link: "/category/bags",
  },
  {
    title: "Accessories",
    image:
      "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=800&auto=format&fit=crop",
    link: "/category/accessories",
  },
];

export default async function Home() {
  const queryClient = new QueryClient();

  // Prefetch products data
  await queryClient.prefetchQuery({
    queryKey: ["products", { category: undefined }],
    queryFn: () => getProducts(),
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <span className="text-white/80 font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base">
            Latest Collection
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">
            Elevate Your <br className="hidden md:block" /> Everyday
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-medium">
            Discover premium streetwear and lifestyle essentials designed for
            those who appreciate quality and style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#new-arrivals"
              className="bg-white text-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group"
            >
              Shop New Arrivals
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#categories"
              className="bg-transparent border-2 border-white text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section
        id="categories"
        className="py-20"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12">
            <h2
              className="text-3xl font-bold uppercase tracking-widest text-center"
              style={{ color: "var(--foreground)" }}
            >
              Shop by Category
            </h2>
            <div
              className="h-1 w-24 mt-4"
              style={{ background: "var(--muted)" }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {categories.map((category) => (
              <Link
                key={category.title}
                href={`/products?category=${category.title.toLowerCase()}`}
                className="group relative h-100 overflow-hidden flex items-center justify-center"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${category.image}')` }}
                >
                  <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/50" />
                </div>
                <div className="relative z-10 text-center">
                  <h3 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
                    {category.title}
                  </h3>
                  <span className="inline-block border-b-2 border-white text-white font-medium pb-1 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    Explore
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS SECTION */}
      <section
        id="new-arrivals"
        className="py-16 border-t"
        style={{ borderColor: "var(--surface-border)" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-10">
            <h2
              className="text-3xl font-bold uppercase tracking-widest text-center"
              style={{ color: "var(--foreground)" }}
            >
              New Arrivals
            </h2>
            <div
              className="h-1 w-20 mt-4"
              style={{ background: "var(--muted)" }}
            ></div>
          </div>

          <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductListClient />
          </HydrationBoundary>

          <div className="mt-16 flex justify-center">
            <button
              className="border-2 px-10 py-3 font-bold uppercase tracking-widest transition-colors duration-300 hover:opacity-70"
              style={{
                borderColor: "var(--foreground)",
                color: "var(--foreground)",
              }}
            >
              Load More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
