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
