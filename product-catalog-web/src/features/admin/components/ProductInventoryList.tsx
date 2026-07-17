import { Badge, Box, Button, HStack, Image, Stack, Text } from "@chakra-ui/react";
import type { Product } from "../../products/types";

type ProductInventoryListProps = {
    products: Product[];
    selectedProductId: string;
    onSelect: (product: Product) => void;
};

export default function ProductInventoryList({
    products,
    selectedProductId,
    onSelect,
}: ProductInventoryListProps) {
    return (
        <Stack gap="4">
            {products.map((product) => {
                const isSelected = product.id === selectedProductId;

                return (
                    <Box
                        key={product.id}
                        borderWidth="1px"
                        borderColor={isSelected ? "orange.300" : "gray.200"}
                        borderRadius="2xl"
                        bg="white"
                        boxShadow={isSelected ? "md" : "sm"}
                        overflow="hidden"
                    >
                        <Stack direction={{ base: "column", md: "row" }} gap="0">
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                objectFit="cover"
                                width={{ base: "100%", md: "220px" }}
                                height={{ base: "200px", md: "100%" }}
                            />

                            <Stack flex="1" gap="4" p="5">
                                <Stack gap="2">
                                    <HStack justify="space-between" align="start" gap="3">
                                        <Stack gap="1">
                                            <Text fontSize="xl" fontWeight="700">
                                                {product.name}
                                            </Text>
                                            <Text color="gray.600">{product.shortDescription}</Text>
                                        </Stack>
                                        <Badge
                                            colorPalette={product.inStock ? "green" : "red"}
                                            alignSelf="start"
                                        >
                                            {product.inStock ? "In stock" : "Out of stock"}
                                        </Badge>
                                    </HStack>
                                    <HStack gap="3" wrap="wrap" color="gray.600">
                                        <Text>Slug: {product.slug}</Text>
                                        <Text>Type: {product.maskType}</Text>
                                        <Text>Rs. {product.priceInr.toLocaleString("en-IN")}</Text>
                                    </HStack>
                                </Stack>

                                <Button
                                    alignSelf="start"
                                    variant={isSelected ? "solid" : "outline"}
                                    colorPalette="orange"
                                    onClick={() => {
                                        onSelect(product);
                                    }}
                                >
                                    {isSelected ? "Editing" : "Edit product"}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                );
            })}
        </Stack>
    );
}
