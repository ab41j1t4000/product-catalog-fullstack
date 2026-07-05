import { useState } from "react";
import { Button, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { useCart } from "../context/CartContext";

type AddToCartProps = {
    productId: string;
    inStock: boolean;
};

export default function AddToCart({ productId, inStock }: AddToCartProps) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState("1");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");

    const handleAddToCart = async () => {
        const parsedQuantity = parseInt(quantity, 10);
        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
            setError("Enter a quantity of at least 1");
            setFeedback("");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            setFeedback("");
            await addItem(productId, parsedQuantity);
            setFeedback("Item added to cart");
        } catch (submitError) {
            const nextError = submitError instanceof Error ? submitError.message : "Unknown error";
            setError(nextError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Stack gap="3" pt="4">
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
                        disabled={!inStock || isSubmitting}
                    />
                </Stack>

                <Button
                    colorPalette="orange"
                    onClick={handleAddToCart}
                    loading={isSubmitting}
                    disabled={!inStock}
                >
                    Add to cart
                </Button>
            </HStack>
            {feedback && <Text color="green.700">{feedback}</Text>}
            {error && <Text color="red.700">{error}</Text>}
        </Stack>
    );
};