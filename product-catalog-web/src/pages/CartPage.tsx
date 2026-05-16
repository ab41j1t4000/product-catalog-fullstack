import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

import { checkout } from "../features/cart/api";
import { getCartCopy } from "../features/cart/copy";
import { useCart } from "../features/cart/hooks";
import { getCartSummary } from "../features/cart/summary";
import { useAuth } from "../features/auth/AuthContext";
import { useLocale } from "../features/i18n/LocaleContext";

export function CartPage() {
  const { items, clearCart, removeItem, updateQuantity } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { formatCurrency, locale } = useLocale();
  const [shippingAddress, setShippingAddress] = useState("");
  const { subtotalCents, estimatedTaxCents, totalCents } = getCartSummary(items);
  const copy = getCartCopy(locale);

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
        <h2>{copy.empty}</h2>
        <p>{copy.emptyText}</p>
      </div>
    );
  }

  return (
    <section className="cart-layout">
      <div className="cart-items">
        <div className="section-heading">
          <p className="eyebrow">{copy.cart}</p>
          <h2>{items.length} {copy.itemsReady}</h2>
        </div>
        {items.map((item) => (
          <article className="cart-row" key={item.productId}>
            <img src={item.imageUrl} alt={item.name} className="cart-image" />
            <div className="cart-row-copy">
              <h3>{item.name}</h3>
              <p>{item.category}</p>
            </div>
            <label className="quantity-field">
              <span>{copy.qty}</span>
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
              {copy.remove}
            </button>
          </article>
        ))}
      </div>

      <aside className="checkout-card">
        <div className="section-heading">
          <p className="eyebrow">{copy.checkout}</p>
          <h2>{copy.summary}</h2>
        </div>
        <label className="search-field">
          <span>{copy.shipping}</span>
          <textarea
            placeholder={copy.shippingPlaceholder}
            value={shippingAddress}
            onChange={(event) => setShippingAddress(event.target.value)}
          />
        </label>
        <div className="price-stack">
          <div>
            <span>{copy.subtotal}</span>
            <strong>{formatCurrency(subtotalCents)}</strong>
          </div>
          <div>
            <span>{copy.tax}</span>
            <strong>{formatCurrency(estimatedTaxCents)}</strong>
          </div>
          <div className="total-row">
            <span>{copy.total}</span>
            <strong>{formatCurrency(totalCents)}</strong>
          </div>
        </div>
        <button
          type="button"
          onClick={() => checkoutMutation.mutate()}
          disabled={!isAuthenticated || shippingAddress.trim().length < 10 || checkoutMutation.isPending}
        >
          {checkoutMutation.isPending ? copy.processing : copy.payNow}
        </button>
        {!isAuthenticated ? (
          <p className="form-note">{copy.signInPrompt}</p>
        ) : null}
        {checkoutMutation.isError ? (
          <p className="form-note error">
            {checkoutMutation.error instanceof Error
              ? checkoutMutation.error.message
              : copy.checkoutFailed}
          </p>
        ) : null}
        {checkoutMutation.isSuccess ? (
          <div className="success-box">
            <strong>{copy.paymentCaptured}</strong>
            <p>{copy.reference}: {checkoutMutation.data.paymentReference}</p>
            <Link to="/orders" className="secondary-link inline-link">
              {copy.viewOrders}
            </Link>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
