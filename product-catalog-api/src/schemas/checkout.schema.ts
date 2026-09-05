export type CheckoutCustomer = {
    name: string;
    email: string;
    phone: string;
};
export type ShippingAddress = {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: "IN";
};
export type CheckoutInput = {
    customer: CheckoutCustomer;
    shippingAddress: ShippingAddress;
    payment: {
        token: string;
    };
};