import { useEffect, useState } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { fetchProducts } from "../api/fetchProducts";
import type { Product } from "../types";
import ProductInfo from "../components/ProductInfo";

function ProductDetailPage() {
    const { id = "" } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts(id);
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
    }, [id]);

    return (
        <Box
            as="main"
            width="min(1200px, calc(100% - 32px))"
            mx="auto"
            py={{ base: "12", md: "16" }}
        >
            <Heading as="h1" size="2xl" mb="8">
                Product Detail Page
            </Heading>
            {isLoading && <Text>Loading product...</Text>}
            {error && <Text color="red.700">Error: {error}</Text>}
            {!isLoading && !error && product && <ProductInfo product={product} />}
        </Box>
    );
}

export default ProductDetailPage;
