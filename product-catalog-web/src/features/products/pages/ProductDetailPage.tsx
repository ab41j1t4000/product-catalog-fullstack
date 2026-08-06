import { useQuery } from "@tanstack/react-query";
import { Box, Heading, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import ProductInfo from "../components/ProductInfo";
import { productQueryOptions } from "../api/productQueries";

function ProductDetailPage() {
    const { id = "" } = useParams();
    const { data: product, error, isPending } = useQuery(productQueryOptions(id));

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
            {isPending && <Text>Loading product...</Text>}
            {error && <Text color="red.700">Error: {error.message}</Text>}
            {!isPending && !error && product && <ProductInfo product={product} />}
        </Box>
    );
}

export default ProductDetailPage;
