import { Link } from "react-router-dom";

import type { Product } from "../features/products/api";

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
};

function formatCurrency(priceCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export function ProductCard({ onAddToCart, product }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-image-link">
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </Link>
      <div className="product-meta">
        <div className="product-heading">
          <span className="product-category">{product.category}</span>
          {product.isFeatured ? <span className="badge">Featured</span> : null}
        </div>
        <Link to={`/products/${product.slug}`} className="product-title-link">
          <h2>{product.name}</h2>
        </Link>
        <p className="product-description">{product.description}</p>
      </div>
      <div className="product-footer">
        <div>
          <strong>{formatCurrency(product.priceCents)}</strong>
          <p>{product.inventory} in stock</p>
        </div>
        <button type="button" onClick={() => onAddToCart(product)} disabled={product.inventory < 1}>
          Add to cart
        </button>
      </div>
    </article>
  );
}
