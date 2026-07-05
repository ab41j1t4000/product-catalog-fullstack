import type { Product } from "../products/types";

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
export type CartResponse = {
    status: string;
    cart: Cart;
};
export type CartItemMutationResponse = {
    status: string;
    message: string;
    item: CartItem;
    cart: Cart;
}
