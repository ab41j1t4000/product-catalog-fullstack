import type {
    CreateProductInput,
    Product,
    UpdateProductInput,
} from "../schemas/product.schema.js";
import { getSupabaseAdminClient, isSupabaseConfigured } from "../lib/supabase.js";

const products: Product[] = [
    {
        id: "1",
        slug: "kitsune-festival-mask",
        name: "Kitsune Festival Mask",
        priceInr: 2499,
        shortDescription: "White fox mask with red festival detailing.",
        imageUrl:
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
        maskType: "Fox",
        inStock: true,
    },
    {
        id: "2",
        slug: "oni-red-mask",
        name: "Oni Red Mask",
        priceInr: 3299,
        shortDescription: "Bold red oni mask for statement styling and decor.",
        imageUrl:
            "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=80",
        maskType: "Oni",
        inStock: true,
    },
    {
        id: "3",
        slug: "noh-elegance-mask",
        name: "Noh Elegance Mask",
        priceInr: 2899,
        shortDescription: "Minimal theatrical mask inspired by traditional Noh art.",
        imageUrl:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
        maskType: "Noh",
        inStock: false,
    },
];

let nextProductId = products.length + 1;

type ProductServiceErrorCode =
    | "PRODUCT_NOT_FOUND"
    | "INVALID_PRODUCT"
    | "DUPLICATE_SLUG"
    | "DATABASE_ERROR";

export class ProductServiceError extends Error {
    code: ProductServiceErrorCode;

    constructor(code: ProductServiceErrorCode, message: string) {
        super(message);
        this.code = code;
    }
}

function assertNonEmptyString(value: string, fieldName: string) {
    if (!value.trim()) {
        throw new ProductServiceError("INVALID_PRODUCT", `${fieldName} is required.`);
    }
}

function assertValidPrice(priceInr: number) {
    if (!Number.isInteger(priceInr) || priceInr < 0) {
        throw new ProductServiceError(
            "INVALID_PRODUCT",
            "priceInr must be a non-negative integer.",
        );
    }
}

function assertUniqueSlug(slug: string, productIdToIgnore?: string) {
    const duplicateProduct = products.find(
        (product) => product.slug === slug && product.id !== productIdToIgnore,
    );

    if (duplicateProduct) {
        throw new ProductServiceError("DUPLICATE_SLUG", "Product slug already exists.");
    }
}

type ProductRow = {
    id: number | string;
    slug: string;
    name: string;
    price_inr: number;
    short_description: string;
    image_url: string;
    mask_type: string;
    in_stock: boolean;
};

const PRODUCT_COLUMNS =
    "id, slug, name, price_inr, short_description, image_url, mask_type, in_stock";

function fromProductRow(row: ProductRow): Product {
    return {
        id: String(row.id),
        slug: row.slug,
        name: row.name,
        priceInr: row.price_inr,
        shortDescription: row.short_description,
        imageUrl: row.image_url,
        maskType: row.mask_type,
        inStock: row.in_stock,
    };
}

function toProductRow(input: CreateProductInput | UpdateProductInput) {
    return {
        ...(input.slug === undefined ? {} : { slug: input.slug }),
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.priceInr === undefined ? {} : { price_inr: input.priceInr }),
        ...(input.shortDescription === undefined
            ? {}
            : { short_description: input.shortDescription }),
        ...(input.imageUrl === undefined ? {} : { image_url: input.imageUrl }),
        ...(input.maskType === undefined ? {} : { mask_type: input.maskType }),
        ...(input.inStock === undefined ? {} : { in_stock: input.inStock }),
    };
}

function throwDatabaseError(error: { code?: string; message: string }): never {
    if (error.code === "23505") {
        throw new ProductServiceError("DUPLICATE_SLUG", "Product slug already exists.");
    }

    throw new ProductServiceError(
        "DATABASE_ERROR",
        "The product database is temporarily unavailable.",
    );
}

function validateCreateProductInput(input: CreateProductInput) {
    assertNonEmptyString(input.slug, "slug");
    assertNonEmptyString(input.name, "name");
    assertNonEmptyString(input.shortDescription, "shortDescription");
    assertNonEmptyString(input.imageUrl, "imageUrl");
    assertNonEmptyString(input.maskType, "maskType");
    assertValidPrice(input.priceInr);
    assertUniqueSlug(input.slug);
}

function validateUpdateProductInput(productId: string, input: UpdateProductInput) {
    if (!Object.keys(input).length) {
        throw new ProductServiceError("INVALID_PRODUCT", "At least one field is required.");
    }

    if (input.slug !== undefined) {
        assertNonEmptyString(input.slug, "slug");
        assertUniqueSlug(input.slug, productId);
    }

    if (input.name !== undefined) {
        assertNonEmptyString(input.name, "name");
    }

    if (input.shortDescription !== undefined) {
        assertNonEmptyString(input.shortDescription, "shortDescription");
    }

    if (input.imageUrl !== undefined) {
        assertNonEmptyString(input.imageUrl, "imageUrl");
    }

    if (input.maskType !== undefined) {
        assertNonEmptyString(input.maskType, "maskType");
    }

    if (input.priceInr !== undefined) {
        assertValidPrice(input.priceInr);
    }
}

export async function getAllProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured()) return products;

    const { data, error } = await getSupabaseAdminClient()
        .from("products")
        .select(PRODUCT_COLUMNS)
        .order("id");

    if (error) throwDatabaseError(error);
    return (data as ProductRow[]).map(fromProductRow);
}

export async function getProductById(productId: string): Promise<Product | undefined> {
    if (!isSupabaseConfigured()) {
        return products.find((product) => product.id === productId);
    }

    const { data, error } = await getSupabaseAdminClient()
        .from("products")
        .select(PRODUCT_COLUMNS)
        .eq("id", productId)
        .maybeSingle();

    if (error) throwDatabaseError(error);
    return data ? fromProductRow(data as ProductRow) : undefined;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
    validateCreateProductInput(input);

    if (isSupabaseConfigured()) {
        const { data, error } = await getSupabaseAdminClient()
            .from("products")
            .insert(toProductRow(input))
            .select(PRODUCT_COLUMNS)
            .single();

        if (error) throwDatabaseError(error);
        return fromProductRow(data as ProductRow);
    }

    const product: Product = {
        id: String(nextProductId++),
        ...input,
    };

    products.push(product);
    return product;
}

export async function updateProduct(
    productId: string,
    input: UpdateProductInput,
): Promise<Product> {
    if (isSupabaseConfigured()) {
        validateUpdateProductInput(productId, input);
        const { data, error } = await getSupabaseAdminClient()
            .from("products")
            .update(toProductRow(input))
            .eq("id", productId)
            .select(PRODUCT_COLUMNS)
            .maybeSingle();

        if (error) throwDatabaseError(error);
        if (!data) {
            throw new ProductServiceError("PRODUCT_NOT_FOUND", "Product not found.");
        }
        return fromProductRow(data as ProductRow);
    }

    const product = products.find((candidate) => candidate.id === productId);

    if (!product) {
        throw new ProductServiceError("PRODUCT_NOT_FOUND", "Product not found.");
    }

    validateUpdateProductInput(productId, input);

    Object.assign(product, input);

    return product;
}
