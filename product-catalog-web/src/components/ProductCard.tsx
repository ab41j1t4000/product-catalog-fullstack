import { Link } from "react-router-dom";

import type { Product } from "../features/products/api";
import { useLocale } from "../features/i18n/LocaleContext";

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
};

export function ProductCard({ onAddToCart, product }: ProductCardProps) {
  const { formatCurrency, locale } = useLocale();
  const copy =
    locale === "ja"
      ? { featured: "注目", inStock: "在庫", addToCart: "カートに追加" }
      : { featured: "Featured", inStock: "in stock", addToCart: "Add to cart" };

  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-image-link">
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </Link>
      <div className="product-meta">
        <div className="product-heading">
          <span className="product-category">{product.category}</span>
          {product.isFeatured ? <span className="badge">{copy.featured}</span> : null}
        </div>
        <Link to={`/products/${product.slug}`} className="product-title-link">
          <h2>{product.name}</h2>
        </Link>
        <p className="product-description">{product.description}</p>
      </div>
      <div className="product-footer">
        <div>
          <strong>{formatCurrency(product.priceCents)}</strong>
          <p>{product.inventory} {copy.inStock}</p>
        </div>
        <button type="button" onClick={() => onAddToCart(product)} disabled={product.inventory < 1}>
          {copy.addToCart}
        </button>
      </div>
    </article>
  );
}
