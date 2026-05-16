import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import { useLocale } from "../features/i18n/LocaleContext";
import { fetchOrders } from "../features/orders/api";

export function OrdersPage() {
  const { isAuthenticated, token } = useAuth();
  const { formatCurrency, locale } = useLocale();
  const copy =
    locale === "ja"
      ? {
          loading: "注文履歴を読み込み中...",
          eyebrow: "注文履歴",
          heading: "最近の購入",
          signInTitle: "注文履歴を表示するにはログインしてください",
          signInText: "ヘッダーからログインすると、完了した決済をここで確認できます。",
          empty: "まだ注文はありません",
          emptyText: "カートから決済を完了すると、ここに購入履歴が表示されます。",
          loadError: "注文履歴を読み込めません",
          orderId: "注文ID",
          shipping: "配送先",
          subtotal: "小計",
          tax: "税額",
          total: "合計",
          paymentReference: "参照番号",
          items: "購入商品",
          browse: "商品一覧へ戻る",
        }
      : {
          loading: "Loading orders...",
          eyebrow: "Order history",
          heading: "Recent purchases",
          signInTitle: "Sign in to view your orders",
          signInText: "Use the header sign-in form to load completed checkouts here.",
          empty: "No orders yet",
          emptyText: "Complete a checkout from the cart and your purchase history will appear here.",
          loadError: "Unable to load orders",
          orderId: "Order ID",
          shipping: "Shipping",
          subtotal: "Subtotal",
          tax: "Tax",
          total: "Total",
          paymentReference: "Reference",
          items: "Items",
          browse: "Return to catalog",
        };

  const ordersQuery = useQuery({
    queryKey: ["orders", token],
    queryFn: async () => {
      if (!token) {
        throw new Error("Unauthorized");
      }

      return fetchOrders(token);
    },
    enabled: isAuthenticated && Boolean(token),
  });

  if (!isAuthenticated) {
    return (
      <div className="empty-state">
        <div>
          <h2>{copy.signInTitle}</h2>
          <p>{copy.signInText}</p>
        </div>
      </div>
    );
  }

  if (ordersQuery.isLoading) {
    return <div className="empty-state">{copy.loading}</div>;
  }

  if (ordersQuery.isError) {
    return (
      <div className="empty-state">
        <div>
          <h2>{copy.loadError}</h2>
          <p>{ordersQuery.error instanceof Error ? ordersQuery.error.message : "Unknown error"}</p>
        </div>
      </div>
    );
  }

  const orders = ordersQuery.data?.items ?? [];

  if (!orders.length) {
    return (
      <div className="empty-state">
        <div>
          <h2>{copy.empty}</h2>
          <p>{copy.emptyText}</p>
          <Link to="/" className="secondary-link inline-link">
            {copy.browse}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="orders-shell">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.heading}</h2>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-card-header">
              <div>
                <p className="badge">{order.status}</p>
                <h3>{copy.orderId}: {order.id}</h3>
              </div>
              <div className="order-card-totals">
                <strong>{formatCurrency(order.totalCents)}</strong>
                <p>{new Date(order.createdAt).toLocaleString(locale === "ja" ? "ja-JP" : "en-US")}</p>
              </div>
            </div>

            <div className="order-meta-grid">
              <div>
                <span>{copy.paymentReference}</span>
                <strong>{order.paymentReference}</strong>
              </div>
              <div>
                <span>{copy.shipping}</span>
                <strong>{order.shippingAddress}</strong>
              </div>
              <div>
                <span>{copy.subtotal}</span>
                <strong>{formatCurrency(order.subtotalCents)}</strong>
              </div>
              <div>
                <span>{copy.tax}</span>
                <strong>{formatCurrency(order.taxCents)}</strong>
              </div>
            </div>

            <div className="order-items">
              <p className="eyebrow">{copy.items}</p>
              {order.items.map((item) => (
                <div className="order-item-row" key={item.id}>
                  <div>
                    <h4>{item.productName}</h4>
                    <p>{item.productCategory}</p>
                  </div>
                  <div className="order-item-summary">
                    <span>x{item.quantity}</span>
                    <strong>{formatCurrency(item.unitPriceCents * item.quantity)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
