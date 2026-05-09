import { z } from "zod";
export declare const signInSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodEmail, z.ZodTransform<string, string>>;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const checkoutSchema: z.ZodObject<{
    shippingAddress: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
//# sourceMappingURL=cart.schema.d.ts.map