import type { Locale } from "../i18n/LocaleContext";

export type CatalogCopy = {
  search: string;
  searchPlaceholder: string;
  allCategories: string;
  eyebrow: string;
  heading: string;
  loadError: string;
  noMatch: string;
  noMatchText: string;
};

/** Centralizes catalog copy so filtering UI stays small and easy to scan. */
export function getCatalogCopy(locale: Locale): CatalogCopy {
  return locale === "ja"
    ? {
        search: "検索",
        searchPlaceholder: "商品名、カテゴリ、用途で検索",
        allCategories: "すべてのカテゴリ",
        eyebrow: "商品カタログ",
        heading: "件の商品を表示中",
        loadError: "商品の読み込みに失敗しました",
        noMatch: "条件に一致する商品がありません",
        noMatchText: "キーワードを広げるか、カテゴリを変更してください。",
      }
    : {
        search: "Search",
        searchPlaceholder: "Search products, category, or use case",
        allCategories: "All categories",
        eyebrow: "Product catalog",
        heading: "products ready to browse",
        loadError: "Unable to load products",
        noMatch: "No products match the current filters",
        noMatchText: "Try a broader keyword or switch back to all categories.",
      };
}
