import type { Prisma } from "@prisma/client/index";

import { prisma } from "../db/prisma.js";
import type { AdminProductInput, ProductSearchInput } from "../schemas/product.schema.js";

/** Converts a display name into a URL-safe slug. */
function slugifyProductName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/**
 * Ensures each product slug stays unique even if two products share the same name.
 * On updates, the current product id can be excluded from the uniqueness check.
 */
async function createUniqueSlug(name: string, excludeId?: string) {
  const baseSlug = slugifyProductName(name) || "product";
  let slug = baseSlug;
  let suffix = 0;

  // Keep trying `name`, `name-1`, `name-2`, ... until one is unused.
  for (; ;) {
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

/** Lists customer-facing products with filters, pagination, and distinct categories. */
export async function listProducts(input: ProductSearchInput) {
  const { category, featured, limit, page, search } = input;
  const where: Prisma.ProductWhereInput = {};

  // Build the Prisma where object incrementally from validated query params.
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
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  // Run list, total count, and category lookup in parallel for efficiency.
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
        brand: true,
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

/** Fetches a single product by its slug for the detail page. */
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
      brand: true,
    },
  });
}

/** Returns a flat list for the admin UI, ordered by newest first. */
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
      brand: true,
    },
  });
}

/** Creates a new product after generating a unique slug from the name. */
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
      brand: true,
    },
  });
}

/** Updates a product and keeps the slug aligned with the current product name. */
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
      brand: true,
    },
  });
}

/** Deletes a product by id. Prisma throws if the row does not exist. */
export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
    select: { id: true },
  });
}

/** Returns the distinct catalog categories as a simple string array. */
export async function listCategories() {
  const categories = await prisma.product.findMany({
    distinct: ["category"],
    orderBy: { category: "asc" },
    select: { category: true },
  });

  return categories.map((entry) => entry.category);
}
