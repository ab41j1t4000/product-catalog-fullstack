import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../schemas/product.schema.js";
import { getSupabaseAdminClient } from "../lib/supabase.js";
import {
  ProductRepositoryError,
  type ProductRepository,
  validateProductRecord,
  validateProductUpdate,
} from "./product.repository.js";

type ProductRow = {
  id: number | string;
  slug: string;
  name: string;
  price_inr: number;
  short_description: string;
  image_url: string;
  mask_type: string;
  in_stock: boolean;
};

const PRODUCT_COLUMNS =
  "id, slug, name, price_inr, short_description, image_url, mask_type, in_stock";

export class SupabaseProductRepository implements ProductRepository {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient = getSupabaseAdminClient()) {
    this.client = client;
  }

  async list(): Promise<Product[]> {
    const { data, error } = await this.client
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("id");

    if (error) throwRepositoryError(error);
    return (data as ProductRow[]).map(fromProductRow);
  }

  async findById(productId: string): Promise<Product | undefined> {
    const { data, error } = await this.client
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("id", productId)
      .maybeSingle();

    if (error) throwRepositoryError(error);
    return data ? fromProductRow(data as ProductRow) : undefined;
  }

  async create(input: CreateProductInput): Promise<Product> {
    validateProductRecord(input);
    const { data, error } = await this.client
      .from("products")
      .insert(toProductRow(input))
      .select(PRODUCT_COLUMNS)
      .single();

    if (error) throwRepositoryError(error);
    return fromProductRow(data as ProductRow);
  }

  async update(productId: string, input: UpdateProductInput): Promise<Product | undefined> {
    validateProductUpdate(input);
    const { data, error } = await this.client
      .from("products")
      .update(toProductRow(input))
      .eq("id", productId)
      .select(PRODUCT_COLUMNS)
      .maybeSingle();

    if (error) throwRepositoryError(error);
    return data ? fromProductRow(data as ProductRow) : undefined;
  }
}

function fromProductRow(row: ProductRow): Product {
  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    priceInr: row.price_inr,
    shortDescription: row.short_description,
    imageUrl: row.image_url,
    maskType: row.mask_type,
    inStock: row.in_stock,
  };
}

function toProductRow(input: CreateProductInput | UpdateProductInput) {
  return {
    ...(input.slug === undefined ? {} : { slug: input.slug }),
    ...(input.name === undefined ? {} : { name: input.name }),
    ...(input.priceInr === undefined ? {} : { price_inr: input.priceInr }),
    ...(input.shortDescription === undefined
      ? {}
      : { short_description: input.shortDescription }),
    ...(input.imageUrl === undefined ? {} : { image_url: input.imageUrl }),
    ...(input.maskType === undefined ? {} : { mask_type: input.maskType }),
    ...(input.inStock === undefined ? {} : { in_stock: input.inStock }),
  };
}

function throwRepositoryError(error: { code?: string; message?: string }): never {
  if (error.code === "23505") {
    throw new ProductRepositoryError("DUPLICATE_SLUG", "Product slug already exists.");
  }

  throw new ProductRepositoryError(
    "DATABASE_ERROR",
    "The product database is temporarily unavailable.",
  );
}
