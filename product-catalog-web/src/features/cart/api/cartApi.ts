const CART_API_BASE_URL = "http://localhost:4000";

export async function parseCartResponse<T>(response: Response): Promise<T> {
    const data = (await response.json()) as T & { message?: string };
    if (!response.ok) {
        throw new Error(data.message ?? `Request failed with status ${response.status}`);
    }
    return data;
}

export function getCartApiUrl(path: string): string {
    return `${CART_API_BASE_URL}${path}`;
}