import {
    Heading,
    HStack,
    Image,
    Stack,
    Text,
    chakra,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types";

type ProductCardProps = {
    product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
    const navigate = useNavigate();

    return (
        <chakra.button
            type="button"
            onClick={() => navigate(`/products/${product.id}`)}
            overflow="hidden"
            borderRadius="2xl"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            textAlign="left"
            cursor="pointer"
            transition="transform 0.2s ease, box-shadow 0.2s ease"
            _hover={{ transform: "translateY(-2px)", shadow: "md" }}
            _focusVisible={{ outline: "2px solid", outlineColor: "orange.400" }}
        >
            <Image
                src={product.imageUrl}
                alt={product.name}
                width="100%"
                height="260px"
                objectFit="cover"
            />

            <Stack p="5" gap="3">
                <HStack align="start" justify="space-between" gap="3">
                    <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="orange.700"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                    >
                        {product.maskType}
                    </Text>
                    <Text fontWeight="700">
                        Rs. {product.priceInr.toLocaleString("en-IN")}
                    </Text>
                </HStack>

                <Heading as="h2" size="md">
                    {product.name}
                </Heading>
                <Text color="gray.600">{product.shortDescription}</Text>

                <Text
                    fontWeight="700"
                    color={product.inStock ? "green.700" : "red.700"}
                >
                    {product.inStock ? "In stock" : "Out of stock"}
                </Text>
            </Stack>
        </chakra.button>
    );
}
