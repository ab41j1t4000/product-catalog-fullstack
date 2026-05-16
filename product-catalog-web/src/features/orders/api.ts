import { apiClient } from "../../lib/apiClient";

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  productName: string;
  productCategory: string;
};

export type Order = {
  id: string;
  status: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  paymentReference: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
};

export type OrdersResponse = {
  items: Order[];
};

export function fetchOrders(token: string) {
  return apiClient<OrdersResponse>("/api/orders", { token });
}
