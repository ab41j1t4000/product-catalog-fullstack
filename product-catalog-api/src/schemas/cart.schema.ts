import { z } from "zod";

// Customer sign-in is intentionally lightweight for this learning project.
export const signInSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  name: z.string().trim().min(2).max(80).optional(),
});

// Checkout requires a usable address and at least one valid line item.
export const checkoutSchema = z.object({
  shippingAddress: z.string().trim().min(10).max(240),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1),
});

// These inferred types keep route and service code in sync with validation rules.
export type SignInInput = z.infer<typeof signInSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
