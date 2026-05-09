import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { checkout } from "../features/cart/api";
import { useCart } from "../features/cart/hooks";
import { useAuth } from "../features/auth/AuthContext";

function formatCurrency(priceCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export function CartPage() {
  const { items, clearCart, removeItem, updateQuantity } = useCart();
  const { isAuthenticated, token } = useAuth();
  const [shippingAddress, setShippingAddress] = useState("");
  const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
  const estimatedTaxCents = Math.round(subtotalCents * 0.1);
  const totalCents = subtotalCents + estimatedTaxCents;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("Please sign in before checkout.");
      }

      return checkout(
        {
          shippingAddress,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
        token,
      );
    },
    onSuccess: () => {
      clearCart();
      setShippingAddress("");
    },
  });

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add a few products from the catalog to test the checkout flow.</p>
      </div>
    );
  }

  return (
    <section className="cart-layout">
      <div className="cart-items">
        <div className="section-heading">
          <p className="eyebrow">Cart</p>
          <h2>{items.length} items ready for checkout</h2>
        </div>
        {items.map((item) => (
          <article className="cart-row" key={item.productId}>
            <img src={item.imageUrl} alt={item.name} className="cart-image" />
            <div className="cart-row-copy">
              <h3>{item.name}</h3>
              <p>{item.category}</p>
            </div>
            <label className="quantity-field">
              <span>Qty</span>
              <input
                type="number"
                min={1}
                max={10}
                value={item.quantity}
                onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
              />
            </label>
            <strong>{formatCurrency(item.priceCents * item.quantity)}</strong>
            <button type="button" className="ghost-button" onClick={() => removeItem(item.productId)}>
              Remove
            </button>
          </article>
        ))}
      </div>

      <aside className="checkout-card">
        <div className="section-heading">
          <p className="eyebrow">Checkout</p>
          <h2>Mock payment summary</h2>
        </div>
        <label className="search-field">
          <span>Shipping address</span>
          <textarea
            placeholder="221B Baker Street, London, NW1 6XE"
            value={shippingAddress}
            onChange={(event) => setShippingAddress(event.target.value)}
          />
        </label>
        <div className="price-stack">
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotalCents)}</strong>
          </div>
          <div>
            <span>Estimated tax</span>
            <strong>{formatCurrency(estimatedTaxCents)}</strong>
          </div>
          <div className="total-row">
            <span>Total</span>
            <strong>{formatCurrency(totalCents)}</strong>
          </div>
        </div>
        <button
          type="button"
          onClick={() => checkoutMutation.mutate()}
          disabled={!isAuthenticated || shippingAddress.trim().length < 10 || checkoutMutation.isPending}
        >
          {checkoutMutation.isPending ? "Processing payment..." : "Pay now"}
        </button>
        {!isAuthenticated ? (
          <p className="form-note">Sign in from the header before checkout.</p>
        ) : null}
        {checkoutMutation.isError ? (
          <p className="form-note error">
            {checkoutMutation.error instanceof Error
              ? checkoutMutation.error.message
              : "Checkout failed"}
          </p>
        ) : null}
        {checkoutMutation.isSuccess ? (
          <div className="success-box">
            <strong>Payment captured</strong>
            <p>Reference: {checkoutMutation.data.paymentReference}</p>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
