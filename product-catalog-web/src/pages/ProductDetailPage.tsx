import { Link, useParams } from "react-router-dom";

import { useCart } from "../features/cart/hooks";
import { useProduct } from "../features/products/hooks";

function formatCurrency(priceCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const { data: product, isLoading, isError } = useProduct(params.slug ?? "");

  if (isLoading) {
    return <div className="detail-card">Loading product...</div>;
  }

  if (isError || !product) {
    return (
      <div className="detail-card">
        <h2>Product not found</h2>
        <Link to="/">Return to catalog</Link>
      </div>
    );
  }

  return (
    <section className="detail-card">
      <img src={product.imageUrl} alt={product.name} className="detail-image" />
      <div className="detail-copy">
        <p className="eyebrow">{product.category}</p>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="detail-meta">
          <strong>{formatCurrency(product.priceCents)}</strong>
          <span>{product.inventory} units in stock</span>
        </div>
        <div className="detail-actions">
          <button type="button" onClick={() => addItem(product)}>
            Add to cart
          </button>
          <Link to="/cart" className="secondary-link">
            Go to cart
          </Link>
        </div>
      </div>
    </section>
  );
}
