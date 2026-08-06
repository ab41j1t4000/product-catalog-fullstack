import { queryOptions } from "@tanstack/react-query";
import { fetchProducts } from "./fetchProducts";

export const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

export function productsQueryOptions() {
    return queryOptions({
        queryKey: productKeys.lists(),
        queryFn: async () => {
            const response = await fetchProducts();
            return response.items;
        },
    });
}

export function productQueryOptions(id: string) {
    return queryOptions({
        queryKey: productKeys.detail(id),
        queryFn: async () => {
            const response = await fetchProducts(id);
            return response.item;
        },
        enabled: Boolean(id),
    });
}
