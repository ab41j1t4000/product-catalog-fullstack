import { createContext, useContext } from "react";
import type { Cart } from "../types";

export type CartContextValue = {
    cart: Cart | null;
    isLoading: boolean;
    error: string;
    addItem: (productId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
    refreshCart: () => Promise<void>;
};

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }

    return context;
}
