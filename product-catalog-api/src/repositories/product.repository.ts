import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../schemas/product.schema.js";

export type ProductRepositoryErrorCode =
  | "DUPLICATE_SLUG"
  | "INVALID_PRODUCT"
  | "DATABASE_ERROR"
  | "CONFIGURATION_ERROR";

export class ProductRepositoryError extends Error {
  constructor(
    public readonly code: ProductRepositoryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ProductRepositoryError";
  }
}

export interface ProductRepository {
  list(): Promise<Product[]>;
  findById(productId: string): Promise<Product | undefined>;
  create(input: CreateProductInput): Promise<Product>;
  update(productId: string, input: UpdateProductInput): Promise<Product | undefined>;
}

export type ProductRecordInput = Omit<Product, "id">;

export function validateProductRecord(input: ProductRecordInput): void {
  assertNonEmptyString(input.slug, "slug");
  assertNonEmptyString(input.name, "name");
  assertNonNegativeInteger(input.priceInr);
  assertNonEmptyString(input.shortDescription, "shortDescription");
  assertNonEmptyString(input.imageUrl, "imageUrl");
  assertNonEmptyString(input.maskType, "maskType");

  if (typeof input.inStock !== "boolean") {
    throw new ProductRepositoryError("INVALID_PRODUCT", "inStock must be a boolean.");
  }
}

export function validateProductUpdate(input: UpdateProductInput): void {
  if (Object.keys(input).length === 0) {
    throw new ProductRepositoryError("INVALID_PRODUCT", "At least one field is required.");
  }

  if (input.slug !== undefined) assertNonEmptyString(input.slug, "slug");
  if (input.name !== undefined) assertNonEmptyString(input.name, "name");
  if (input.priceInr !== undefined) assertNonNegativeInteger(input.priceInr);
  if (input.shortDescription !== undefined) {
    assertNonEmptyString(input.shortDescription, "shortDescription");
  }
  if (input.imageUrl !== undefined) assertNonEmptyString(input.imageUrl, "imageUrl");
  if (input.maskType !== undefined) assertNonEmptyString(input.maskType, "maskType");
  if (input.inStock !== undefined && typeof input.inStock !== "boolean") {
    throw new ProductRepositoryError("INVALID_PRODUCT", "inStock must be a boolean.");
  }
}

function assertNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ProductRepositoryError("INVALID_PRODUCT", `${fieldName} is required.`);
  }
}

function assertNonNegativeInteger(value: unknown): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new ProductRepositoryError(
      "INVALID_PRODUCT",
      "priceInr must be a non-negative integer.",
    );
  }
}

export function cloneProduct(product: Product): Product {
  return { ...product };
}

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "kitsune-festival-mask",
    name: "Kitsune Festival Mask",
    priceInr: 2499,
    shortDescription: "White fox mask with red festival detailing.",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    maskType: "Fox",
    inStock: true,
  },
  {
    id: "2",
    slug: "oni-red-mask",
    name: "Oni Red Mask",
    priceInr: 3299,
    shortDescription: "Bold red oni mask for statement styling and decor.",
    imageUrl:
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=80",
    maskType: "Oni",
    inStock: true,
  },
  {
    id: "3",
    slug: "noh-elegance-mask",
    name: "Noh Elegance Mask",
    priceInr: 2899,
    shortDescription: "Minimal theatrical mask inspired by traditional Noh art.",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    maskType: "Noh",
    inStock: false,
  },
];
