import type { FormEvent } from "react";

import type { AdminCopy } from "../copy";
import type { ProductFormState } from "../formState";

type AdminProductFormProps = {
  copy: AdminCopy;
  editingId: string | null;
  form: ProductFormState;
  errorMessage: string | null;
  isSaving: boolean;
  onFieldChange: <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => void;
  onClear: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function AdminProductForm({
  copy,
  editingId,
  form,
  errorMessage,
  isSaving,
  onFieldChange,
  onClear,
  onSubmit,
}: AdminProductFormProps) {
  return (
    <form className="admin-form-card" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{editingId ? copy.editProduct : copy.newProduct}</p>
          <h2>{editingId ? copy.updateItem : copy.createItem}</h2>
        </div>
      </div>

      <label className="search-field">
        <span>{copy.name}</span>
        <input
          type="text"
          value={form.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
          required
        />
      </label>
      <label className="search-field">
        <span>{copy.brand}</span>
        <input
          type="text"
          value={form.brand}
          onChange={(event) => onFieldChange("brand", event.target.value)}
          required
        />
      </label>
      <label className="search-field">
        <span>{copy.category}</span>
        <input
          type="text"
          value={form.category}
          onChange={(event) => onFieldChange("category", event.target.value)}
          required
        />
      </label>
      <label className="search-field">
        <span>{copy.description}</span>
        <textarea
          rows={5}
          value={form.description}
          onChange={(event) => onFieldChange("description", event.target.value)}
          required
        />
      </label>
      <div className="admin-form-grid">
        <label className="search-field">
          <span>{copy.priceInCents}</span>
          <input
            type="number"
            min="0"
            value={form.priceCents}
            onChange={(event) => onFieldChange("priceCents", event.target.value)}
            required
          />
        </label>
        <label className="search-field">
          <span>{copy.inventory}</span>
          <input
            type="number"
            min="0"
            value={form.inventory}
            onChange={(event) => onFieldChange("inventory", event.target.value)}
            required
          />
        </label>
      </div>
      <label className="search-field">
        <span>{copy.imageUrl}</span>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(event) => onFieldChange("imageUrl", event.target.value)}
          required
        />
      </label>
      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(event) => onFieldChange("isFeatured", event.target.checked)}
        />
        {copy.featureProduct}
      </label>

      <div className="admin-actions">
        <button type="submit" disabled={isSaving}>
          {isSaving ? copy.saving : editingId ? copy.saveChanges : copy.saveProduct}
        </button>
        <button type="button" className="ghost-button" onClick={onClear}>
          {copy.clear}
        </button>
      </div>
      {errorMessage ? <p className="form-note error">{errorMessage}</p> : null}
    </form>
  );
}
