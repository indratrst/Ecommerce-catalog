import { getProducts } from "@/lib/data";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ProductListClient } from "@/components/products/ProductListClient";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Find the category by slug
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const queryClient = new QueryClient();

  // Prefetch category specific products
  await queryClient.prefetchQuery({
    queryKey: ["products", { category: slug }],
    queryFn: () => getProducts(slug),
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex flex-col items-center mb-10">
        <h1
          className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-center"
          style={{ color: "var(--foreground)" }}
        >
          {category.name}
        </h1>
        <div
          className="h-1 w-24 mt-6"
          style={{ background: "var(--foreground)" }}
        ></div>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductListClient categorySlug={slug} />
      </HydrationBoundary>
    </div>
  );
}
