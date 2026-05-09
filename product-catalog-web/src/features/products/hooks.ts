import { useQuery } from "@tanstack/react-query";

import { fetchProduct, fetchProducts } from "./api";

export function useProducts(search: string, category: string) {
  return useQuery({
    queryKey: ["products", search, category],
    queryFn: () => fetchProducts(search, category),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: Boolean(slug),
  });
}
