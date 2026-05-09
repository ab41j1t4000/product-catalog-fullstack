const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function apiClient<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && payload.error
        ? payload.error
        : "Request failed";
    throw new Error(message);
  }

  return payload as T;
}
