import type { CheckoutCustomer, ShippingAddress } from "./checkout.schema.js";

export type OrderItem = {
    productId: string;
    name: string;
    quantity: number;
    unitPriceInr: number;
    lineTotalInr: number;
};

export type Order = {
    id: string;
    status: "confirmed";
    currency: "INR";
    customer: CheckoutCustomer;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    subtotalInr: number;
    shippingInr: number;
    totalPriceInr: number;
    paymentReference: string;
    createdAt: string;
};

export type CreateOrderInput = Omit<
    Order,
    "id" | "status" | "currency" | "createdAt"
>;