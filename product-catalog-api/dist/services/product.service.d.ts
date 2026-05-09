import type { Prisma } from "@prisma/client/index";
import type { ProductSearchInput } from "../schemas/product.schema.js";
export declare function listProducts(input: ProductSearchInput): Promise<{
    items: {
        name: string;
        id: string;
        slug: string;
        category: string;
        description: string;
        priceCents: number;
        imageUrl: string;
        inventory: number;
        isFeatured: boolean;
    }[];
    categories: string[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getProductBySlug(slug: string): Prisma.Prisma__ProductClient<{
    name: string;
    id: string;
    slug: string;
    category: string;
    description: string;
    priceCents: number;
    imageUrl: string;
    inventory: number;
    isFeatured: boolean;
} | null, null, import("@prisma/client/runtime/client").DefaultArgs, {
    adapter: import("@prisma/adapter-pg").PrismaPg;
}>;
//# sourceMappingURL=product.service.d.ts.map