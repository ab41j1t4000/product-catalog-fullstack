import type { FastifyRequest } from "fastify";
import type { CheckoutInput, SignInInput } from "../schemas/cart.schema.js";
export declare function hashToken(token: string): string;
export declare function signInUser(input: SignInInput): Promise<{
    token: string;
    user: {
        email: string;
        name: string | null;
        id: string;
    };
}>;
export declare function getUserFromRequest(request: FastifyRequest): Promise<{
    email: string;
    name: string | null;
    id: string;
} | null>;
export declare function createCheckout(userId: string, input: CheckoutInput): Promise<{
    items: {
        productId: string;
        quantity: number;
        id: string;
        unitPriceCents: number;
        productName: string;
        productCategory: string;
        orderId: string;
    }[];
} & {
    shippingAddress: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    status: import(".prisma/client/client").$Enums.OrderStatus;
    subtotalCents: number;
    taxCents: number;
    totalCents: number;
    paymentReference: string;
}>;
//# sourceMappingURL=cart.service.d.ts.map