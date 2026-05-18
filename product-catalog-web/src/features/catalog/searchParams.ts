/** Builds the router search params from the active catalog filters. */
export function buildCatalogSearchParams(search: string, category: string, page = 1) {
  const nextParams = new URLSearchParams();

  if (search.trim()) {
    nextParams.set("search", search.trim());
  }

  if (category.trim()) {
    nextParams.set("category", category.trim());
  }

  if (page > 1) {
    nextParams.set("page", String(page));
  }

  return nextParams;
}
