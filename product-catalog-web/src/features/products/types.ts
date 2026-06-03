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

export type ProductResponse = {
    items: Product[];
    item: Product | null;
};
