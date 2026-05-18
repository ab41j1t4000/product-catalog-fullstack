import { startTransition, useDeferredValue, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ProductCard } from "../components/ProductCard";
import { Skeleton } from "../components/Skeleton";
import { getCatalogCopy } from "../features/catalog/copy";
import { buildCatalogSearchParams } from "../features/catalog/searchParams";
import { useCart } from "../features/cart/hooks";
import { useLocale } from "../features/i18n/LocaleContext";
import { useProducts } from "../features/products/hooks";

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = searchParams.get("category") ?? "";
  const rawPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const [search, setSearch] = useState(initialSearch);
  const deferredSearch = useDeferredValue(search);
  const category = initialCategory;
  const { addItem } = useCart();
  const { locale } = useLocale();
  const { data, isLoading, isError, error } = useProducts(deferredSearch, category, page);
  const copy = getCatalogCopy(locale);

  /** Persists current catalog filters into the URL so the view is shareable and reload-safe. */
  const updateFilters = (nextSearch: string, nextCategory: string, nextPage = 1) => {
    startTransition(() => {
      setSearchParams(buildCatalogSearchParams(nextSearch, nextCategory, nextPage));
    });
  };

  const totalPages = data?.pagination.totalPages ?? 1;
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <section className="catalog-layout">
      <aside className="filter-panel">
        <label className="search-field">
          <span>{copy.search}</span>
          <input
            type="search"
            placeholder={copy.searchPlaceholder}
            value={search}
            onChange={(event) => {
              const nextSearch = event.target.value;
              setSearch(nextSearch);
              updateFilters(nextSearch, category, 1);
            }}
          />
        </label>

        <div className="category-group">
          <button
            type="button"
            className={category === "" ? "selected" : ""}
            onClick={() => updateFilters(search, "", 1)}
          >
            {copy.allCategories}
          </button>
          {data?.categories.map((entry) => (
            <button
              type="button"
              key={entry}
              className={category === entry ? "selected" : ""}
              onClick={() => updateFilters(search, entry, 1)}
            >
              {entry}
            </button>
          ))}
        </div>
      </aside>

      <div className="catalog-results">
        <div className="results-header">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2>{data?.pagination.total ?? 0} {copy.heading}</h2>
          </div>
        </div>

        {isLoading ? <Skeleton /> : null}

        {isError ? (
          <div className="empty-state">
            <h3>{copy.loadError}</h3>
            <p>{error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        ) : null}

        {!isLoading && !isError && data?.items.length === 0 ? (
          <div className="empty-state">
            <h3>{copy.noMatch}</h3>
            <p>{copy.noMatchText}</p>
          </div>
        ) : null}

        {!isLoading && !isError && data?.items.length ? (
          <>
            <div className="product-grid">
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addItem} />
              ))}
            </div>

            <div className="pagination-controls" aria-label="Product pagination">
              <button
                type="button"
                className="ghost-button compact-button"
                onClick={() => updateFilters(search, category, page - 1)}
                disabled={!canGoPrevious}
              >
                {copy.previousPage}
              </button>
              <p className="pagination-label">
                {copy.pageLabel} {page} / {totalPages}
              </p>
              <button
                type="button"
                className="ghost-button compact-button"
                onClick={() => updateFilters(search, category, page + 1)}
                disabled={!canGoNext}
              >
                {copy.nextPage}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
