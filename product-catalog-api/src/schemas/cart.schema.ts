import type { Product } from "./product.schema.js";

export type CartItem = {
    id: string;
    productId: string;
    quantity: number;
    product: Product;
};
export type Cart = {
    items: CartItem[];
    totalItems: number;
    totalPriceInr: number;
};
export type CreateCartItemInput = {
    productId: string;
    quantity: number;
};
export type UpdateCartItemInput = {
    quantity: number;
};