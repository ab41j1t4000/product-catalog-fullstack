import { queryOptions } from "@tanstack/react-query";
import { fetchCart } from "./fetchCart";

export const cartKeys = {
    current: ["cart"] as const,
};

export function cartQueryOptions() {
    return queryOptions({
        queryKey: cartKeys.current,
        queryFn: async () => {
            const response = await fetchCart();
            return response.cart;
        },
    });
}
