import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchCart } from "../api/fetchCart";
import { addCartItem } from "../api/addCartItem";
import { removeCartItem } from "../api/removeCartItem";
import { updateCartItem } from "../api/updateCartItem";
import type { Cart } from "../types";

type CartContextValue = {
    cart: Cart | null;
    isLoading: boolean;
    error: string;
    addItem: (productId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
    refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function emptyCart(): Cart {
    return {
        items: [],
        totalItems: 0,
        totalPriceInr: 0
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const refreshCart = async () => {
        try {
            setError("");
            const data = await fetchCart();
            setCart(data.cart);
        } catch (loadError) {
            const nextError = loadError instanceof Error ? loadError.message : "Unknown error";
            setError(nextError);
            setCart(emptyCart());
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void refreshCart();
    }, []);

    const addItem = async (productId: string, quantity: number) => {
        setError("");
        const data = await addCartItem({ productId, quantity });
        setCart(data.cart);
    };

    const updateItemQuantity = async (cartItemId: string, quantity: number) => {
        setError("");
        const data = await updateCartItem({ id: cartItemId, quantity });
        setCart(data.cart);
    };

    const removeItemFromCart = async (cartItemId: string) => {
        setError("");
        const data = await removeCartItem(cartItemId);
        setCart(data.cart);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                isLoading,
                error,
                addItem,
                updateItemQuantity,
                removeItem: removeItemFromCart,
                refreshCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}