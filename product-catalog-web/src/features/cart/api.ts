import { apiClient } from "../../lib/apiClient";

export type CheckoutPayload = {
  shippingAddress: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type CheckoutResponse = {
  orderId: string;
  paymentReference: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  status: string;
};

export function checkout(payload: CheckoutPayload, token: string) {
  return apiClient<CheckoutResponse>("/api/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}
