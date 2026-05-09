import type { Prisma } from "@prisma/client/index";

import { prisma } from "../db/prisma.js";
import type { ProductSearchInput } from "../schemas/product.schema.js";

export async function listProducts(input: ProductSearchInput) {
  const { category, featured, limit, page, search } = input;
  const where: Prisma.ProductWhereInput = {};

  if (category) {
    where.category = { equals: category, mode: "insensitive" };
  }

  if (typeof featured === "boolean") {
    where.isFeatured = featured;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        description: true,
        priceCents: true,
        imageUrl: true,
        inventory: true,
        isFeatured: true,
      },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      distinct: ["category"],
      orderBy: { category: "asc" },
      select: { category: true },
    }),
  ]);

  return {
    items,
    categories: categories.map((entry) => entry.category),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      priceCents: true,
      imageUrl: true,
      inventory: true,
      isFeatured: true,
    },
  });
}
