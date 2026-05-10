import type { Prisma } from "@prisma/client/index";

import { prisma } from "../db/prisma.js";
import type { AdminProductInput, ProductSearchInput } from "../schemas/product.schema.js";

function slugifyProductName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function createUniqueSlug(name: string, excludeId?: string) {
  const baseSlug = slugifyProductName(name) || "product";
  let slug = baseSlug;
  let suffix = 0;

  for (;;) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existingProduct) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

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

export function listAdminProducts() {
  return prisma.product.findMany({
    orderBy: [{ createdAt: "desc" }],
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

export async function createProduct(input: AdminProductInput) {
  const slug = await createUniqueSlug(input.name);

  return prisma.product.create({
    data: {
      ...input,
      slug,
    },
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

export async function updateProduct(id: string, input: AdminProductInput) {
  const slug = await createUniqueSlug(input.name, id);

  return prisma.product.update({
    where: { id },
    data: {
      ...input,
      slug,
    },
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

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
    select: { id: true },
  });
}
