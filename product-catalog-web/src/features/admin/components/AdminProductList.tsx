import type { Product } from "../../products/api";
import type { AdminCopy } from "../copy";

type AdminProductListProps = {
  copy: AdminCopy;
  products: Product[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isDeleting: boolean;
  formatCurrency: (priceCents: number) => string;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
};

export function AdminProductList({
  copy,
  products,
  isLoading,
  isError,
  error,
  isDeleting,
  formatCurrency,
  onEdit,
  onDelete,
}: AdminProductListProps) {
  return (
    <div className="admin-table-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{copy.savedProducts}</p>
          <h2>{products?.length ?? 0} {copy.items}</h2>
        </div>
      </div>

      {isLoading ? <p className="form-note">{copy.loading}</p> : null}
      {isError ? (
        <p className="form-note error">
          {error instanceof Error ? error.message : copy.loadError}
        </p>
      ) : null}

      {products?.length ? (
        <div className="admin-table">
          {products.map((product) => (
            <article key={product.id} className="admin-row">
              <img className="admin-thumb" src={product.imageUrl} alt={product.name} />
              <div className="admin-row-copy">
                <div className="admin-row-heading">
                  <div>
                    <h3>{product.name}</h3>
                    <p>
                      {product.brand} · {product.category} · {product.slug}
                    </p>
                  </div>
                  {product.isFeatured ? <span className="badge">{copy.featured}</span> : null}
                </div>
                <p>{product.description}</p>
                <div className="admin-row-meta">
                  <span>{formatCurrency(product.priceCents)}</span>
                  <span>{copy.stock} {product.inventory}</span>
                </div>
              </div>
              <div className="admin-row-actions">
                <button type="button" className="ghost-button" onClick={() => onEdit(product)}>
                  {copy.edit}
                </button>
                <button
                  type="button"
                  className="ghost-button danger-button"
                  disabled={isDeleting}
                  onClick={() => onDelete(product.id)}
                >
                  {copy.delete}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
