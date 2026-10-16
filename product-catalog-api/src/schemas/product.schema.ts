export type Product = {
    id: string;
    slug: string;
    name: string;
    priceInr: number;
    shortDescription: string;
    imageUrl: string;
    maskType: string;
    inStock: boolean;
};

export type CreateProductInput = Omit<Product, "id">;

export type UpdateProductInput = Partial<Omit<Product, "id">>;

export class ProductValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ProductValidationError";
    }
}

export function validateCreateProductInput(value: unknown): asserts value is CreateProductInput {
    const input = asRecord(value, "A product body is required.");
    assertNonEmptyString(input.slug, "slug");
    assertNonEmptyString(input.name, "name");
    assertNonNegativeInteger(input.priceInr);
    assertNonEmptyString(input.shortDescription, "shortDescription");
    assertNonEmptyString(input.imageUrl, "imageUrl");
    assertNonEmptyString(input.maskType, "maskType");
    assertBoolean(input.inStock, "inStock");
}

export function validateUpdateProductInput(value: unknown): asserts value is UpdateProductInput {
    const input = asRecord(value, "A product update body is required.");
    if (Object.keys(input).length === 0) {
        throw new ProductValidationError("At least one field is required.");
    }

    if (input.slug !== undefined) assertNonEmptyString(input.slug, "slug");
    if (input.name !== undefined) assertNonEmptyString(input.name, "name");
    if (input.priceInr !== undefined) assertNonNegativeInteger(input.priceInr);
    if (input.shortDescription !== undefined) {
        assertNonEmptyString(input.shortDescription, "shortDescription");
    }
    if (input.imageUrl !== undefined) assertNonEmptyString(input.imageUrl, "imageUrl");
    if (input.maskType !== undefined) assertNonEmptyString(input.maskType, "maskType");
    if (input.inStock !== undefined) assertBoolean(input.inStock, "inStock");
}

function asRecord(value: unknown, message: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new ProductValidationError(message);
    }
    return value as Record<string, unknown>;
}

function assertNonEmptyString(value: unknown, fieldName: string): asserts value is string {
    if (typeof value !== "string" || !value.trim()) {
        throw new ProductValidationError(`${fieldName} is required.`);
    }
}

function assertNonNegativeInteger(value: unknown): asserts value is number {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new ProductValidationError("priceInr must be a non-negative integer.");
    }
}

function assertBoolean(value: unknown, fieldName: string): asserts value is boolean {
    if (typeof value !== "boolean") {
        throw new ProductValidationError(`${fieldName} must be a boolean.`);
    }
}
