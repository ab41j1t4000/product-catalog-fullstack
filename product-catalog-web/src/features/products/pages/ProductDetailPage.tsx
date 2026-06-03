import { useEffect, useState } from "react";
import { fetchProducts } from "../api/fetchProducts";
import type { Product } from "../types";
import ProductInfo from "../components/ProductInfo";

function ProductDetailPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                setProduct(data.item);
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
        <div>
            <h1>Product Detail Page</h1>
            {product && <ProductInfo product={product} />}
        </div>
    );
}

export default ProductDetailPage;
