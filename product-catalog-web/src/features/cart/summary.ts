import type { CartItem } from "./hooks";

export type CartSummary = {
  subtotalCents: number;
  estimatedTaxCents: number;
  totalCents: number;
};

/** Derives checkout totals from cart items so page components stay render-focused. */
export function getCartSummary(items: CartItem[]): CartSummary {
  const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
  const estimatedTaxCents = Math.round(subtotalCents * 0.1);

  return {
    subtotalCents,
    estimatedTaxCents,
    totalCents: subtotalCents + estimatedTaxCents,
  };
}
