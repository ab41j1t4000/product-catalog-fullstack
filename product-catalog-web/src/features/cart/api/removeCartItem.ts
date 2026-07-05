import { getCartApiUrl, parseCartResponse } from "./cartApi";
import type { CartItemMutationResponse } from "../types";

export async function removeCartItem(itemId: string): Promise<CartItemMutationResponse> {
    const response = await fetch(getCartApiUrl(`/cart/items/${itemId}`), {
        method: "DELETE",
    });
    return parseCartResponse<CartItemMutationResponse>(response);
}