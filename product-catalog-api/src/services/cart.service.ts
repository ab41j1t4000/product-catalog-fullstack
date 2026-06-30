import type {
    Cart,
    CartItem,
    CreateCartItemInput,
    UpdateCartItemInput,
} from "../schemas/cart.schema.js";
import type { Product } from "../schemas/product.schema.js";
import { getAllProducts } from "./product.service.js";

const cartItems: CartItem[] = [];
let nextCartItemId = 1;

type CartServiceErrorCode =
    | "INVALID_QUANTITY"
    | "OUT_OF_STOCK"
    | "PRODUCT_NOT_FOUND"
    | "CART_ITEM_NOT_FOUND";

export class CartServiceError extends Error {
    code: CartServiceErrorCode;

    constructor(code: CartServiceErrorCode, message: string) {
        super(message);
        this.code = code;
    }
}

function assertValidQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new CartServiceError("INVALID_QUANTITY", "Quantity must be an integer greater than 0.");
    }
}

function getProductOrThrow(productId: string) {
    const product = getAllProducts().find((p) => p.id === productId);
    if (!product) {
        throw new CartServiceError("PRODUCT_NOT_FOUND", "Product not found.");
    }
    if (!product.inStock) {
        throw new CartServiceError("OUT_OF_STOCK", "Product is out of stock.");
    }
    return product;
}

function buildCart(): Cart {
    return {
        items: cartItems,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPriceInr: cartItems.reduce((sum, item) => sum + item.quantity * item.quantity * item.product.priceInr, 0),
    };
}
export function getCart(): Cart {
    return buildCart();
}
export function addCartItem(input: CreateCartItemInput) {
    assertValidQuantity(input.quantity);
    const product = getProductOrThrow(input.productId);
    const existingCartItem = cartItems.find((item) => item.productId === input.productId);
    if (existingCartItem) {
        existingCartItem.quantity += input.quantity;
        return existingCartItem;
    }
    const newCartItem: CartItem = {
        id: String(nextCartItemId++),
        productId: input.productId,
        quantity: input.quantity,
        product,
    };
    cartItems.push(newCartItem);
    return newCartItem;
}
export function updateCartItem(cartItemId: string, input: UpdateCartItemInput) {
    assertValidQuantity(input.quantity);
    const cartItem = cartItems.find((item) => item.id === cartItemId);
    if (!cartItem) {
        throw new CartServiceError("CART_ITEM_NOT_FOUND", "Cart item not found.");
    }
    cartItem.quantity = input.quantity;
    return cartItem;
}
export function removeCartItem(cartItemId: string) {
    const index = cartItems.findIndex((item) => item.id === cartItemId);
    if (index === -1) {
        throw new CartServiceError("CART_ITEM_NOT_FOUND", "Cart item not found.");
    }
    const removedItem = cartItems.splice(index, 1)[0];
    return removedItem;
}