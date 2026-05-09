import { z } from "zod";

export const productSearchSchema = z.object({
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  featured: z
    .union([z.literal("true"), z.literal("false")])
    .transform((value) => value === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(12),
});

export type ProductSearchInput = z.infer<typeof productSearchSchema>;
