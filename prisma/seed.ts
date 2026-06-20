import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // USERS
  await prisma.user.upsert({
    where: { email: "superuser@admin.com" },
    update: {},
    create: {
      email: "superuser@admin.com",
      name: "Super User",
      password: hashedPassword,
      role: "SUPERUSER",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@admin.com" },
    update: {},
    create: {
      email: "user@admin.com",
      name: "Standard User",
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("✅ Users created");

  // CATEGORIES
  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: {
      name: "Clothing",
      slug: "clothing",
    },
  });

  const bags = await prisma.category.upsert({
    where: { slug: "bags" },
    update: {},
    create: {
      name: "Bags",
      slug: "bags",
    },
  });

  console.log("✅ Categories created");

  const productsData = [
    {
      title: "Wellborn Fukazi LS T-shirt",
      price: 189000,
      categoryId: clothing.id,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Grey"],
    },
    {
      title: "Wellborn Daily Bag",
      price: 320000,
      categoryId: bags.id,
      sizes: ["One Size"],
      colors: ["Black"],
    },
  ];

  for (const productData of productsData) {
    const { sizes, colors, ...data } = productData;

    const product = await prisma.product.create({
      data: {
        ...data,
        description: "Sample product description",
        image:
          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
        ratingRate: 4.5,
        ratingCount: 100,
      },
    });

    for (const size of sizes) {
      for (const color of colors) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size,
            color,
            stock: Math.floor(Math.random() * 50) + 10,
            isActive: true, // ✅ eksplisit
          },
        });
      }
    }

    console.log(`✅ Product seeded: ${product.title}`);
  }

  console.log("🎉 Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
