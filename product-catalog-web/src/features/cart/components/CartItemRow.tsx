import { useState } from "react";
import { Box, Button, HStack, Input, Stack, Text } from "@chakra-ui/react";
import type { CartItem } from "../types";
import { useCart } from "../context/CartContext";

export default function CartItemRow({ item }: { item: CartItem }) {
    const { updateItemQuantity, removeItem } = useCart();
    const [quantity, setQuantity] = useState(item.quantity.toString());
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const handleUpdate = async () => {
        const parsedQuantity = Number.parseInt(quantity, 10);
        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            setError("Please enter a valid quantity.");
            return;
        }
        try {
            setIsSaving(true);
            setError("");
            await updateItemQuantity(item.id, parsedQuantity);
        } catch (updateError) {
            const nextError = updateError instanceof Error ? updateError.message : "Unknown error";
            setError(nextError);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async () => {
        try {
            setIsSaving(true);
            setError("");
            await removeItem(item.id);
        } catch (removeError) {
            const nextError =
                removeError instanceof Error ? removeError.message : "Could not remove item.";
            setError(nextError);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box borderWidth="1px" borderColor="gray.200" borderRadius="2xl" bg="white" p="5">
            <Stack gap="4">
                <Stack gap="1">
                    <Text fontSize="lg" fontWeight="700">
                        {item.product.name}
                    </Text>
                    <Text color="gray.600">{item.product.shortDescription}</Text>
                    <Text fontWeight="600">
                        Rs. {item.product.priceInr.toLocaleString("en-IN")} each
                    </Text>
                </Stack>

                <HStack align="end" justify="space-between" flexWrap="wrap" gap="4">
                    <HStack align="end" gap="3">
                        <Stack gap="1">
                            <Text fontSize="sm" fontWeight="600">
                                Quantity
                            </Text>
                            <Input
                                type="number"
                                min="1"
                                width="88px"
                                value={quantity}
                                onChange={(event) => setQuantity(event.target.value)}
                                disabled={isSaving}
                            />
                        </Stack>
                        <Button variant="outline" onClick={handleUpdate} loading={isSaving}>
                            Update
                        </Button>
                    </HStack>

                    <Stack align={{ base: "start", sm: "end" }} gap="2">
                        <Text fontWeight="700">
                            Rs. {(item.quantity * item.product.priceInr).toLocaleString("en-IN")}
                        </Text>
                        <Button variant="ghost" colorPalette="red" onClick={handleRemove} loading={isSaving}>
                            Remove
                        </Button>
                    </Stack>
                </HStack>
                {error && <Text color="red.700">{error}</Text>}
            </Stack>
        </Box>
    );
}