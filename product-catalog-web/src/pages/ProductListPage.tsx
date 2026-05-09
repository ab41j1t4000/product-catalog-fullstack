import { startTransition, useDeferredValue, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ProductCard } from "../components/ProductCard";
import { Skeleton } from "../components/Skeleton";
import { useCart } from "../features/cart/hooks";
import { useProducts } from "../features/products/hooks";

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = searchParams.get("category") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const deferredSearch = useDeferredValue(search);
  const category = initialCategory;
  const { addItem } = useCart();
  const { data, isLoading, isError, error } = useProducts(deferredSearch, category);

  const updateFilters = (nextSearch: string, nextCategory: string) => {
    startTransition(() => {
      const nextParams = new URLSearchParams();

      if (nextSearch.trim()) {
        nextParams.set("search", nextSearch.trim());
      }

      if (nextCategory.trim()) {
        nextParams.set("category", nextCategory.trim());
      }

      setSearchParams(nextParams);
    });
  };

  return (
    <section className="catalog-layout">
      <aside className="filter-panel">
        <label className="search-field">
          <span>Search</span>
          <input
            type="search"
            placeholder="Search products, category, or use case"
            value={search}
            onChange={(event) => {
              const nextSearch = event.target.value;
              setSearch(nextSearch);
              updateFilters(nextSearch, category);
            }}
          />
        </label>

        <div className="category-group">
          <button
            type="button"
            className={category === "" ? "selected" : ""}
            onClick={() => updateFilters(search, "")}
          >
            All categories
          </button>
          {data?.categories.map((entry) => (
            <button
              type="button"
              key={entry}
              className={category === entry ? "selected" : ""}
              onClick={() => updateFilters(search, entry)}
            >
              {entry}
            </button>
          ))}
        </div>
      </aside>

      <div className="catalog-results">
        <div className="results-header">
          <div>
            <p className="eyebrow">Product catalog</p>
            <h2>{data?.pagination.total ?? 0} products ready to browse</h2>
          </div>
        </div>

        {isLoading ? <Skeleton /> : null}

        {isError ? (
          <div className="empty-state">
            <h3>Unable to load products</h3>
            <p>{error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        ) : null}

        {!isLoading && !isError && data?.items.length === 0 ? (
          <div className="empty-state">
            <h3>No products match the current filters</h3>
            <p>Try a broader keyword or switch back to all categories.</p>
          </div>
        ) : null}

        {!isLoading && !isError && data?.items.length ? (
          <div className="product-grid">
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addItem} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
