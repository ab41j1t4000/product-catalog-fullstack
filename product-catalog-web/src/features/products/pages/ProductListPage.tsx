import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../api/fetchProducts";
import type { Product } from "../types";

function ProductListPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                setProducts(data.items);
            } catch (loadError) {
                const nextError =
                    loadError instanceof Error ? loadError.message : "Unknown error";
                setError(nextError);
            } finally {
                setIsLoading(false);
            }
        };

        void loadProducts();
    }, []);

    return (
        <main className="page">
            <section className="hero">
                <p className="eyebrow">Catalog</p>
                <h1>Japanese Masks in India</h1>
                <p className="intro">
                    A curated first pass of the product listing page.
                </p>
            </section>

            {isLoading && <p className="status">Loading products...</p>}
            {error && <p className="status error">Error: {error}</p>}

            {!isLoading && !error && (
                <section className="grid">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </section>
            )}
        </main>
    );
}

export default ProductListPage;
