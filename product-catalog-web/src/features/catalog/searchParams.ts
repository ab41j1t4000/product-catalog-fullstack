/** Builds the router search params from the active catalog filters. */
export function buildCatalogSearchParams(search: string, category: string) {
  const nextParams = new URLSearchParams();

  if (search.trim()) {
    nextParams.set("search", search.trim());
  }

  if (category.trim()) {
    nextParams.set("category", category.trim());
  }

  return nextParams;
}
