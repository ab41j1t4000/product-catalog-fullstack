import { getCartApiUrl, parseCartResponse } from "./cartApi";
import type { CartItemMutationResponse } from "../types";

type UpdateCartItemInput = {
    id: string;
    quantity: number;
};

export async function updateCartItem({ id, quantity }: UpdateCartItemInput): Promise<CartItemMutationResponse> {
    const response = await fetch(getCartApiUrl(`/cart/items/${id}`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
    });
    return parseCartResponse<CartItemMutationResponse>(response);
}