import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCartItem } from "../api/addCartItem";
import { removeCartItem } from "../api/removeCartItem";
import { updateCartItem } from "../api/updateCartItem";
import { cartKeys, cartQueryOptions } from "../api/cartQueries";
import type { Cart } from "../types";
import { CartContext } from "./cart-context";

export function CartProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const cartQuery = useQuery(cartQueryOptions());

    const syncCart = (cart: Cart) => {
        queryClient.setQueryData(cartKeys.current, cart);
    };

    const addItemMutation = useMutation({
        mutationFn: addCartItem,
        onSuccess: (response) => syncCart(response.cart),
    });

    const updateItemMutation = useMutation({
        mutationFn: updateCartItem,
        onSuccess: (response) => syncCart(response.cart),
    });

    const removeItemMutation = useMutation({
        mutationFn: removeCartItem,
        onSuccess: (response) => syncCart(response.cart),
    });

    const refreshCart = async () => {
        await cartQuery.refetch();
    };

    const addItem = async (productId: string, quantity: number) => {
        await addItemMutation.mutateAsync({ productId, quantity });
    };

    const updateItemQuantity = async (cartItemId: string, quantity: number) => {
        await updateItemMutation.mutateAsync({ id: cartItemId, quantity });
    };

    const removeItemFromCart = async (cartItemId: string) => {
        await removeItemMutation.mutateAsync(cartItemId);
    };

    return (
        <CartContext.Provider
            value={{
                cart: cartQuery.data ?? null,
                isLoading: cartQuery.isPending,
                error: cartQuery.error?.message ?? "",
                addItem,
                updateItemQuantity,
                removeItem: removeItemFromCart,
                refreshCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
