import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { AdminLoginCard } from "../features/admin/components/AdminLoginCard";
import { AdminProductForm } from "../features/admin/components/AdminProductForm";
import { AdminProductList } from "../features/admin/components/AdminProductList";
import { getAdminCopy } from "../features/admin/copy";
import {
  createEmptyProductForm,
  toAdminProductPayload,
  toEditableProductForm,
  type ProductFormState,
} from "../features/admin/formState";
import { useAuth } from "../features/auth/AuthContext";
import { useLocale } from "../features/i18n/LocaleContext";
import type { Product } from "../features/products/api";
import { apiClient } from "../lib/apiClient";

export function AdminPage() {
  const queryClient = useQueryClient();
  const { isAdmin, signInAdmin, signOut, signingIn, token, user } = useAuth();
  const { formatCurrency, locale } = useLocale();
  const [credentials, setCredentials] = useState({ username: "admin", password: "admin" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(() => createEmptyProductForm());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const copy = getAdminCopy(locale);

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
        body: JSON.stringify(toAdminProductPayload(form)),
      });
    },
    onSuccess: async () => {
      setForm(createEmptyProductForm());
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
        setForm(createEmptyProductForm());
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
      setForm(createEmptyProductForm());
    }
  }, [isAdmin]);

  /** Keeps field updates uniform across the admin form inputs. */
  const updateFormField = <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  /** Clears selection state so the form switches back to create mode. */
  const resetForm = () => {
    setEditingId(null);
    setForm(createEmptyProductForm());
    setErrorMessage(null);
  };

  /** Loads an existing product into the form for editing. */
  const startEditingProduct = (product: Product) => {
    setEditingId(product.id);
    setForm(toEditableProductForm(product));
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    await saveProductMutation.mutateAsync();
  };

  const handleAdminSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      await signInAdmin(credentials);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in as admin");
    }
  };

  if (!isAdmin) {
    return (
      <AdminLoginCard
        copy={copy}
        credentials={credentials}
        signingIn={signingIn}
        errorMessage={errorMessage}
        onCredentialsChange={(field, value) =>
          setCredentials((current) => ({ ...current, [field]: value }))
        }
        onSubmit={handleAdminSignIn}
      />
    );
  }

  return (
    <section className="admin-shell">
      <div className="admin-header">
        <div>
          <p className="eyebrow">{copy.adminPanel}</p>
          <h2>{copy.products}</h2>
          <p className="form-note">{copy.signedInAs} {user?.name ?? "Administrator"}.</p>
        </div>
        <button type="button" className="ghost-button" onClick={signOut}>
          {copy.signOut}
        </button>
      </div>

      <div className="admin-layout">
        <AdminProductForm
          copy={copy}
          editingId={editingId}
          form={form}
          errorMessage={errorMessage}
          isSaving={saveProductMutation.isPending}
          onFieldChange={updateFormField}
          onClear={resetForm}
          onSubmit={handleSubmit}
        />

        <AdminProductList
          copy={copy}
          products={productsQuery.data}
          isLoading={productsQuery.isLoading}
          isError={productsQuery.isError}
          error={productsQuery.error}
          isDeleting={deleteProductMutation.isPending}
          formatCurrency={formatCurrency}
          onEdit={startEditingProduct}
          onDelete={(id) => {
            void deleteProductMutation.mutateAsync(id);
          }}
        />
      </div>
    </section>
  );
}
