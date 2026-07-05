import { getCartApiUrl, parseCartResponse } from "./cartApi";
import type { CartItemMutationResponse } from "../types";

type AddCartItemInput = {
    productId: string;
    quantity: number;
};

export async function addCartItem(input: AddCartItemInput): Promise<CartItemMutationResponse> {
    const response = await fetch(getCartApiUrl("/cart/items"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });
    return parseCartResponse<CartItemMutationResponse>(response);
}
