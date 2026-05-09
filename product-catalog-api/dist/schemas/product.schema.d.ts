import { z } from "zod";
export declare const productSearchSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    featured: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodLiteral<"true">, z.ZodLiteral<"false">]>, z.ZodTransform<boolean, "true" | "false">>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
//# sourceMappingURL=product.schema.d.ts.map