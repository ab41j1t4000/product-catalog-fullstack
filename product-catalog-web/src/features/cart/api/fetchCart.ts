import { getCartApiUrl, parseCartResponse } from "./cartApi";
import type { CartResponse } from "../types";

export async function fetchCart(): Promise<CartResponse> {
    const response = await fetch(getCartApiUrl("/cart"));
    return parseCartResponse<CartResponse>(response);
}