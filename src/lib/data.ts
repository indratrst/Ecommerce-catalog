import { prisma } from "@/lib/prisma";

// Types that match the Prisma output (with relations)
export type ProductWithRelations = Awaited<
  ReturnType<typeof getProducts>
>[number];
export type CategoryWithCount = Awaited<
  ReturnType<typeof getCategories>
>[number];

export async function getProducts(categorySlug?: string, search?: string) {
  const where: {
    category?: { slug: string };
    OR?: Array<
      | { title: { contains: string; mode: "insensitive" } }
      | { description: { contains: string; mode: "insensitive" } }
      | { category: { name: { contains: string; mode: "insensitive" } } }
      | { category: { slug: { contains: string; mode: "insensitive" } } }
    >;
  } = {};
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { category: { name: { contains: search, mode: "insensitive" } } },
      { category: { slug: { contains: search, mode: "insensitive" } } },
    ];
  }

  return prisma.product.findMany({
    where,
    include: {
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
    },
  });

  if (!product) return null;

  // ✅ Transform di sini
  return {
    ...product,
    image: product.image ?? "",
    variants: product.variants.map((v) => ({
      ...v,
      color: v.color ?? "",
    })),
  };
}

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getRecommendedProducts(excludeIds: string[], limit = 4) {
  return prisma.product.findMany({
    where: {
      id: { notIn: excludeIds },
    },
    include: {
      category: true,
      variants: true,
    },
    take: limit,
    orderBy: { ratingRate: "desc" },
  });
}

export async function getAllProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
