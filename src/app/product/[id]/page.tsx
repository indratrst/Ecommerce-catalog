import { getProductById, getAllProducts } from "@/lib/data";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { VariantResponseSchema } from "@/lib/validation/products.schema";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p: { id: string }) => ({ id: p.id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return notFound();
  }

  // Map to the shape the client component expects

  // Compute total stock from all variants
  const totalStock = product.variants.reduce(
    (sum: number, v) => sum + v.stock,
    0,
  );

  const filteredVariants = product.variants
    .filter((v) => v.isActive === true)
    .map((v) => VariantResponseSchema.parse(v));

  return (
    <ProductDetailClient
      product={product}
      totalStock={totalStock}
      variants={filteredVariants}
    />
  );
}
