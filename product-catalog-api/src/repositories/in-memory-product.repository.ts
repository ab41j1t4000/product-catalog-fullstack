import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../schemas/product.schema.js";
import {
  cloneProduct,
  DEFAULT_PRODUCTS,
  ProductRepositoryError,
  type ProductRepository,
  validateProductRecord,
  validateProductUpdate,
} from "./product.repository.js";

export class InMemoryProductRepository implements ProductRepository {
  private products: Product[] = [];
  private nextProductId = 1;

  constructor(initialProducts: Product[] = DEFAULT_PRODUCTS) {
    this.reset(initialProducts);
  }

  reset(initialProducts: Product[] = DEFAULT_PRODUCTS): void {
    this.products = initialProducts.map(cloneProduct);
    const numericIds = this.products
      .map((product) => Number(product.id))
      .filter((id) => Number.isInteger(id));
    this.nextProductId = Math.max(0, ...numericIds) + 1;
  }

  async list(): Promise<Product[]> {
    return this.products.map(cloneProduct);
  }

  async findById(productId: string): Promise<Product | undefined> {
    const product = this.products.find((candidate) => candidate.id === productId);
    return product ? cloneProduct(product) : undefined;
  }

  async create(input: CreateProductInput): Promise<Product> {
    validateProductRecord(input);
    this.assertUniqueSlug(input.slug);

    const product: Product = {
      id: String(this.nextProductId++),
      ...input,
    };
    this.products.push(product);
    return cloneProduct(product);
  }

  async update(productId: string, input: UpdateProductInput): Promise<Product | undefined> {
    const productIndex = this.products.findIndex((candidate) => candidate.id === productId);
    if (productIndex < 0) return undefined;

    const existingProduct = this.products[productIndex];
    if (!existingProduct) return undefined;

    validateProductUpdate(input);
    const candidate: Product = { ...existingProduct, ...input };
    validateProductRecord(candidate);
    this.assertUniqueSlug(candidate.slug, productId);

    this.products[productIndex] = candidate;
    return cloneProduct(candidate);
  }

  private assertUniqueSlug(slug: string, productIdToIgnore?: string): void {
    const duplicate = this.products.some(
      (product) => product.slug === slug && product.id !== productIdToIgnore,
    );
    if (duplicate) {
      throw new ProductRepositoryError("DUPLICATE_SLUG", "Product slug already exists.");
    }
  }
}
