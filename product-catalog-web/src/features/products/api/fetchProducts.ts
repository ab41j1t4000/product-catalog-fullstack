import type { ProductResponse } from "../types";

export async function fetchProducts(id: string = ''): Promise<ProductResponse> {
    const response = await fetch(`http://localhost:4000/products/${id}`);

    if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? `Request failed with status ${response.status}`);
    }

    return (await response.json()) as ProductResponse;
}
