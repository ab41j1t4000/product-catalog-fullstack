import { apiClient } from "../../lib/apiClient";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  inventory: number;
  isFeatured: boolean;
  brand: string;
};

export type ProductListResponse = {
  items: Product[];
  categories: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function fetchProducts(search: string, category: string, page: number) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (category.trim()) {
    params.set("category", category.trim());
  }
  params.set("page", String(page));
  params.set("limit", "12");

  return apiClient<ProductListResponse>(`/api/products?${params.toString()}`);
}

export function fetchProduct(slug: string) {
  return apiClient<Product>(`/api/products/${slug}`);
}
