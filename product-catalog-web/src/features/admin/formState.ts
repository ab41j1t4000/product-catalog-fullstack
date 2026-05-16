import type { Product } from "../products/api";

export type ProductFormState = {
  name: string;
  category: string;
  description: string;
  priceCents: string;
  imageUrl: string;
  inventory: string;
  isFeatured: boolean;
  brand: string;
};

/** Creates a new empty form object so reset logic stays consistent across the page. */
export function createEmptyProductForm(): ProductFormState {
  return {
    name: "",
    category: "",
    description: "",
    priceCents: "",
    imageUrl: "",
    inventory: "",
    isFeatured: false,
    brand: "",
  };
}

/** Normalizes form strings into the payload shape expected by the admin API. */
export function toAdminProductPayload(form: ProductFormState) {
  return {
    name: form.name.trim(),
    category: form.category.trim(),
    description: form.description.trim(),
    priceCents: Number(form.priceCents),
    imageUrl: form.imageUrl.trim(),
    inventory: Number(form.inventory),
    isFeatured: form.isFeatured,
    brand: form.brand.trim(),
  };
}

/** Maps a persisted product into form-friendly string values for editing. */
export function toEditableProductForm(product: Product): ProductFormState {
  return {
    name: product.name,
    category: product.category,
    description: product.description,
    priceCents: String(product.priceCents),
    imageUrl: product.imageUrl,
    inventory: String(product.inventory),
    isFeatured: product.isFeatured,
    brand: product.brand,
  };
}
