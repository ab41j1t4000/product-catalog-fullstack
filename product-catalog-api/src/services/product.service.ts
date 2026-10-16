import {
  SupabaseConfigurationError,
  getSupabaseAdminClient,
  isSupabaseConfigured,
} from "../lib/supabase.js";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../schemas/product.schema.js";
import {
  ProductValidationError,
  validateCreateProductInput as validateSchemaCreateProductInput,
  validateUpdateProductInput as validateSchemaUpdateProductInput,
} from "../schemas/product.schema.js";
import { InMemoryProductRepository } from "../repositories/in-memory-product.repository.js";
import {
  ProductRepositoryError,
  type ProductRepository,
} from "../repositories/product.repository.js";
import { SupabaseProductRepository } from "../repositories/supabase-product.repository.js";

type ProductServiceErrorCode =
  | "PRODUCT_NOT_FOUND"
  | "INVALID_PRODUCT"
  | "DUPLICATE_SLUG"
  | "DATABASE_ERROR";

export class ProductServiceError extends Error {
  constructor(
    public readonly code: ProductServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ProductServiceError";
  }
}

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.repository.list();
    } catch (error) {
      throw mapRepositoryError(error);
    }
  }

  async getProductById(productId: string): Promise<Product | undefined> {
    try {
      return await this.repository.findById(productId);
    } catch (error) {
      throw mapRepositoryError(error);
    }
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    validateCreateProductInput(input);

    try {
      return await this.repository.create(input);
    } catch (error) {
      throw mapRepositoryError(error);
    }
  }

  async updateProduct(productId: string, input: UpdateProductInput): Promise<Product> {
    const existingProduct = await this.getProductById(productId);
    if (!existingProduct) {
      throw new ProductServiceError("PRODUCT_NOT_FOUND", "Product not found.");
    }

    validateUpdateProductInput(input);

    try {
      const updatedProduct = await this.repository.update(productId, input);
      if (!updatedProduct) {
        throw new ProductServiceError("PRODUCT_NOT_FOUND", "Product not found.");
      }
      return updatedProduct;
    } catch (error) {
      throw mapRepositoryError(error);
    }
  }
}

export function createProductService(repository?: ProductRepository): ProductService {
  return new ProductService(repository ?? createDefaultProductRepository());
}

const defaultProductService = createProductService();

export function getDefaultProductService(): ProductService {
  return defaultProductService;
}

export async function getAllProducts(): Promise<Product[]> {
  return defaultProductService.getAllProducts();
}

export async function getProductById(productId: string): Promise<Product | undefined> {
  return defaultProductService.getProductById(productId);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  return defaultProductService.createProduct(input);
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput,
): Promise<Product> {
  return defaultProductService.updateProduct(productId, input);
}

function createDefaultProductRepository(): ProductRepository {
  try {
    if (!isSupabaseConfigured()) {
      return new InMemoryProductRepository();
    }

    return new SupabaseProductRepository(getSupabaseAdminClient());
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return new UnavailableProductRepository();
    }
    throw error;
  }
}

class UnavailableProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    return this.fail();
  }

  async findById(_productId: string): Promise<Product | undefined> {
    return this.fail();
  }

  async create(_input: CreateProductInput): Promise<Product> {
    return this.fail();
  }

  async update(_productId: string, _input: UpdateProductInput): Promise<Product | undefined> {
    return this.fail();
  }

  private fail(): never {
    throw new ProductRepositoryError(
      "CONFIGURATION_ERROR",
      "The product database is temporarily unavailable.",
    );
  }
}

function validateCreateProductInput(input: CreateProductInput): void {
  try {
    validateSchemaCreateProductInput(input);
  } catch (error) {
    throw mapRepositoryError(error);
  }
}

function validateUpdateProductInput(input: UpdateProductInput): void {
  try {
    validateSchemaUpdateProductInput(input);
  } catch (error) {
    throw mapRepositoryError(error);
  }
}

function mapRepositoryError(error: unknown): ProductServiceError {
  if (error instanceof ProductServiceError) return error;

  if (error instanceof ProductValidationError) {
    return new ProductServiceError("INVALID_PRODUCT", error.message);
  }

  if (error instanceof ProductRepositoryError) {
    if (error.code === "DUPLICATE_SLUG") {
      return new ProductServiceError("DUPLICATE_SLUG", error.message);
    }

    if (error.code === "INVALID_PRODUCT") {
      return new ProductServiceError("INVALID_PRODUCT", error.message);
    }

    return new ProductServiceError(
      "DATABASE_ERROR",
      "The product database is temporarily unavailable.",
    );
  }

  return new ProductServiceError(
    "DATABASE_ERROR",
    "The product database is temporarily unavailable.",
  );
}
