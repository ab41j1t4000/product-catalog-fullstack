import type { Product } from "../schemas/product.schema.js";

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

export function getAllProducts() {
    return products;
}