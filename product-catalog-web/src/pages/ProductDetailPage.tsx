import { Link, useParams } from "react-router-dom";

import { useCart } from "../features/cart/hooks";
import { useLocale } from "../features/i18n/LocaleContext";
import { useProduct } from "../features/products/hooks";

export function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const { formatCurrency, locale } = useLocale();
  const { data: product, isLoading, isError } = useProduct(params.slug ?? "");
  const copy =
    locale === "ja"
      ? {
          loading: "商品を読み込み中...",
          notFound: "商品が見つかりません",
          back: "商品一覧へ戻る",
          units: "点在庫あり",
          addToCart: "カートに追加",
          goToCart: "カートへ",
        }
      : {
          loading: "Loading product...",
          notFound: "Product not found",
          back: "Return to catalog",
          units: "units in stock",
          addToCart: "Add to cart",
          goToCart: "Go to cart",
        };

  if (isLoading) {
    return <div className="detail-card">{copy.loading}</div>;
  }

  if (isError || !product) {
    return (
      <div className="detail-card">
        <h2>{copy.notFound}</h2>
        <Link to="/">{copy.back}</Link>
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
          <span>{product.inventory} {copy.units}</span>
        </div>
        <div className="detail-actions">
          <button type="button" onClick={() => addItem(product)}>
            {copy.addToCart}
          </button>
          <Link to="/cart" className="secondary-link">
            {copy.goToCart}
          </Link>
        </div>
      </div>
    </section>
  );
}
