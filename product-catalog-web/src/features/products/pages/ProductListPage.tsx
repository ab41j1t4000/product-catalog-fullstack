import { useEffect, useState } from "react";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
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
        <Box
            as="main"
            width="min(1200px, calc(100% - 32px))"
            mx="auto"
            py={{ base: "12", md: "16" }}
        >
            <Box mb="8">
                <Text
                    mb="2"
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    color="orange.700"
                >
                    Catalog
                </Text>
                <Heading
                    as="h1"
                    mb="3"
                    fontSize="clamp(2rem, 5vw, 3.5rem)"
                >
                    Japanese Masks in India
                </Heading>
                <Text maxW="720px" color="gray.600">
                    A curated first pass of the product listing page.
                </Text>
            </Box>

            {isLoading && (
                <Box
                    px="4"
                    py="4"
                    borderRadius="xl"
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.200"
                >
                    <Text>Loading products...</Text>
                </Box>
            )}
            {error && (
                <Box
                    px="4"
                    py="4"
                    borderRadius="xl"
                    bg="red.50"
                    borderWidth="1px"
                    borderColor="red.200"
                >
                    <Text color="red.700">Error: {error}</Text>
                </Box>
            )}

            {!isLoading && !error && (
                <SimpleGrid
                    as="section"
                    gap="5"
                    minChildWidth={{ base: "240px", md: "280px" }}
                >
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
}

export default ProductListPage;
