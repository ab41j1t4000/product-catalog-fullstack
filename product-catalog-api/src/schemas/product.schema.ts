import { z } from "zod";

// Search input is permissive, but still bounded to avoid unreasonably large queries.
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

// Admin credentials are separated from customer sign-in on purpose.
export const adminCredentialsSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

// Admin product writes validate all fields before Prisma sees the payload.
export const adminProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  brand: z.string().trim().min(2).max(60),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().min(10).max(2000),
  priceCents: z.coerce.number().int().min(0),
  imageUrl: z.string().trim().url(),
  inventory: z.coerce.number().int().min(0),
  isFeatured: z.coerce.boolean().default(false),
});

// Inferred types let services consume already-validated shapes.
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
export type AdminCredentialsInput = z.infer<typeof adminCredentialsSchema>;
export type AdminProductInput = z.infer<typeof adminProductSchema>;
