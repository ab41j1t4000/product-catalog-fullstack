import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import type { Product } from "../products/api";

const STORAGE_KEY = "product-catalog-cart";

type CartItem = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  cartCount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStoredCart() {
  if (typeof window === "undefined") {
    return [] as CartItem[];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as CartItem[];
  }

  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [] as CartItem[];
  }
}

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, 10)) }
          : item,
      ),
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount: items.reduce((total, item) => total + item.quantity, 0),
        addItem,
        removeItem,
        clearCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

export type { CartItem };
