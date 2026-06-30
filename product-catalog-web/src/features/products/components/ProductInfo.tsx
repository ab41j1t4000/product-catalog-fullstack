import { Box, Heading, Image, Stack, Text } from "@chakra-ui/react";
import type { Product } from "../types";

export default function ProductInfo({ product }: { product: Product }) {
    return (
        <Stack
            direction={{ base: "column", lg: "row" }}
            gap={{ base: "6", lg: "10" }}
            align="start"
        >
            <Image
                src={product.imageUrl}
                alt={product.name}
                width={{ base: "100%", lg: "420px" }}
                maxW="100%"
                borderRadius="2xl"
                objectFit="cover"
            />
            <Box flex="1">
                <Heading as="h2" size="xl" mb="4">
                    {product.name}
                </Heading>
                <Stack gap="3" color="gray.700">
                    <Text>{product.shortDescription}</Text>
                    <Text fontWeight="600">
                        Price: Rs. {product.priceInr.toLocaleString("en-IN")}
                    </Text>
                    <Text>Mask Type: {product.maskType}</Text>
                    <Text
                        fontWeight="700"
                        color={product.inStock ? "green.700" : "red.700"}
                    >
                        {product.inStock ? "In stock" : "Out of stock"}
                    </Text>
                </Stack>
            </Box>
        </Stack>
    );
}
