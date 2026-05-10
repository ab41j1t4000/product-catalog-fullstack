import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { useAuth } from "../features/auth/AuthContext";
import { apiClient } from "../lib/apiClient";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  inventory: number;
  isFeatured: boolean;
};

type ProductFormState = {
  name: string;
  category: string;
  description: string;
  priceCents: string;
  imageUrl: string;
  inventory: string;
  isFeatured: boolean;
};

const emptyForm: ProductFormState = {
  name: "",
  category: "",
  description: "",
  priceCents: "",
  imageUrl: "",
  inventory: "",
  isFeatured: false,
};

function toPayload(form: ProductFormState) {
  return {
    name: form.name.trim(),
    category: form.category.trim(),
    description: form.description.trim(),
    priceCents: Number(form.priceCents),
    imageUrl: form.imageUrl.trim(),
    inventory: Number(form.inventory),
    isFeatured: form.isFeatured,
  };
}

export function AdminPage() {
  const queryClient = useQueryClient();
  const { isAdmin, signInAdmin, signOut, signingIn, token, user } = useAuth();
  const [credentials, setCredentials] = useState({ username: "admin", password: "admin" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => apiClient<Product[]>("/api/admin/products", { token }),
    enabled: isAdmin && Boolean(token),
  });

  const saveProductMutation = useMutation({
    mutationFn: async () => {
      const path = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";

      return apiClient<Product>(path, {
        method,
        token,
        body: JSON.stringify(toPayload(form)),
      });
    },
    onSuccess: async () => {
      setForm(emptyForm);
      setEditingId(null);
      setErrorMessage(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save product");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) =>
      apiClient<null>(`/api/admin/products/${id}`, {
        method: "DELETE",
        token,
      }),
    onSuccess: async (_, deletedId) => {
      if (editingId === deletedId) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setErrorMessage(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete product");
    },
  });

  useEffect(() => {
    if (!isAdmin) {
      setEditingId(null);
      setForm(emptyForm);
    }
  }, [isAdmin]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    await saveProductMutation.mutateAsync();
  };

  if (!isAdmin) {
    return (
      <section className="admin-shell">
        <div className="admin-login-card">
          <p className="eyebrow">Admin access</p>
          <h2>Manage product entries</h2>
          <p className="form-note">Use `admin` / `admin` to sign in.</p>
          <form
            className="admin-login-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setErrorMessage(null);

              try {
                await signInAdmin(credentials);
              } catch (error) {
                setErrorMessage(
                  error instanceof Error ? error.message : "Unable to sign in as admin",
                );
              }
            }}
          >
            <label className="search-field">
              <span>Username</span>
              <input
                type="text"
                value={credentials.username}
                onChange={(event) =>
                  setCredentials((current) => ({ ...current, username: event.target.value }))
                }
                required
              />
            </label>
            <label className="search-field">
              <span>Password</span>
              <input
                type="password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </label>
            <button type="submit" disabled={signingIn}>
              {signingIn ? "Signing in..." : "Admin sign in"}
            </button>
          </form>
          {errorMessage ? <p className="form-note error">{errorMessage}</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="admin-shell">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin panel</p>
          <h2>Products</h2>
          <p className="form-note">Signed in as {user?.name ?? "Administrator"}.</p>
        </div>
        <button type="button" className="ghost-button" onClick={signOut}>
          Sign out
        </button>
      </div>

      <div className="admin-layout">
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{editingId ? "Edit product" : "New product"}</p>
              <h2>{editingId ? "Update existing item" : "Create a catalog item"}</h2>
            </div>
          </div>

          <label className="search-field">
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
          <label className="search-field">
            <span>Category</span>
            <input
              type="text"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
              required
            />
          </label>
          <label className="search-field">
            <span>Description</span>
            <textarea
              rows={5}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              required
            />
          </label>
          <div className="admin-form-grid">
            <label className="search-field">
              <span>Price in cents</span>
              <input
                type="number"
                min="0"
                value={form.priceCents}
                onChange={(event) =>
                  setForm((current) => ({ ...current, priceCents: event.target.value }))
                }
                required
              />
            </label>
            <label className="search-field">
              <span>Inventory</span>
              <input
                type="number"
                min="0"
                value={form.inventory}
                onChange={(event) =>
                  setForm((current) => ({ ...current, inventory: event.target.value }))
                }
                required
              />
            </label>
          </div>
          <label className="search-field">
            <span>Image URL</span>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, imageUrl: event.target.value }))
              }
              required
            />
          </label>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                setForm((current) => ({ ...current, isFeatured: event.target.checked }))
              }
            />
            Feature this product
          </label>

          <div className="admin-actions">
            <button type="submit" disabled={saveProductMutation.isPending}>
              {saveProductMutation.isPending
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Save product"}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setErrorMessage(null);
              }}
            >
              Clear
            </button>
          </div>
          {errorMessage ? <p className="form-note error">{errorMessage}</p> : null}
        </form>

        <div className="admin-table-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Saved products</p>
              <h2>{productsQuery.data?.length ?? 0} items</h2>
            </div>
          </div>

          {productsQuery.isLoading ? <p className="form-note">Loading products...</p> : null}
          {productsQuery.isError ? (
            <p className="form-note error">
              {productsQuery.error instanceof Error
                ? productsQuery.error.message
                : "Unable to load products"}
            </p>
          ) : null}

          {productsQuery.data?.length ? (
            <div className="admin-table">
              {productsQuery.data.map((product) => (
                <article key={product.id} className="admin-row">
                  <img className="admin-thumb" src={product.imageUrl} alt={product.name} />
                  <div className="admin-row-copy">
                    <div className="admin-row-heading">
                      <div>
                        <h3>{product.name}</h3>
                        <p>
                          {product.category} · {product.slug}
                        </p>
                      </div>
                      {product.isFeatured ? <span className="badge">Featured</span> : null}
                    </div>
                    <p>{product.description}</p>
                    <div className="admin-row-meta">
                      <span>$ {(product.priceCents / 100).toFixed(2)}</span>
                      <span>Stock {product.inventory}</span>
                    </div>
                  </div>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        setEditingId(product.id);
                        setForm({
                          name: product.name,
                          category: product.category,
                          description: product.description,
                          priceCents: String(product.priceCents),
                          imageUrl: product.imageUrl,
                          inventory: String(product.inventory),
                          isFeatured: product.isFeatured,
                        });
                        setErrorMessage(null);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ghost-button danger-button"
                      disabled={deleteProductMutation.isPending}
                      onClick={() => {
                        void deleteProductMutation.mutateAsync(product.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
