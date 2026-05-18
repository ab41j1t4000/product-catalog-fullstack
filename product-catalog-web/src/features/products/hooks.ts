import { useQuery } from "@tanstack/react-query";

import { fetchProduct, fetchProducts } from "./api";

export function useProducts(search: string, category: string, page: number) {
  return useQuery({
    queryKey: ["products", search, category, page],
    queryFn: () => fetchProducts(search, category, page),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: Boolean(slug),
  });
}
