import type { Product } from "../../products/types";

const ADMIN_API_BASE_URL = "http://localhost:4000";

export type ProductPayload = Omit<Product, "id">;

type AdminMutationResponse = {
    status: string;
    message: string;
    item: Product;
};

export async function parseAdminResponse<T>(response: Response): Promise<T> {
    const data = (await response.json()) as T & { message?: string };
    if (!response.ok) {
        throw new Error(data.message ?? `Request failed with status ${response.status}`);
    }
    return data;
}

function getAdminApiUrl(path: string) {
    return `${ADMIN_API_BASE_URL}${path}`;
}

export async function createAdminProduct(input: ProductPayload): Promise<AdminMutationResponse> {
    const response = await fetch(getAdminApiUrl("/admin/products"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    return parseAdminResponse<AdminMutationResponse>(response);
}

export async function updateAdminProduct(
    productId: string,
    input: Partial<ProductPayload>,
): Promise<AdminMutationResponse> {
    const response = await fetch(getAdminApiUrl(`/admin/products/${productId}`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    return parseAdminResponse<AdminMutationResponse>(response);
}
