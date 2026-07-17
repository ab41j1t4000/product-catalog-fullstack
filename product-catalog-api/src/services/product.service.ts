import type {
    CreateProductInput,
    Product,
    UpdateProductInput,
} from "../schemas/product.schema.js";

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
    | "DUPLICATE_SLUG";

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

export function getAllProducts() {
    return products;
}

export function getProductById(productId: string) {
    return products.find((product) => product.id === productId);
}

export function createProduct(input: CreateProductInput) {
    validateCreateProductInput(input);

    const product: Product = {
        id: String(nextProductId++),
        ...input,
    };

    products.push(product);
    return product;
}

export function updateProduct(productId: string, input: UpdateProductInput) {
    const product = getProductById(productId);

    if (!product) {
        throw new ProductServiceError("PRODUCT_NOT_FOUND", "Product not found.");
    }

    validateUpdateProductInput(productId, input);

    Object.assign(product, input);

    return product;
}
