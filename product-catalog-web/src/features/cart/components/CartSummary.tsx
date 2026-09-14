import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import type { Cart } from "../types";

export default function CartSummary({ cart }: { cart: Cart }) {
    const navigate = useNavigate();

    return (
        <Box borderWidth="1px" borderColor="gray.200" borderRadius="2xl" bg="white" p="6">
            <Stack gap="3">
                <Text fontSize="lg" fontWeight="700">
                    Cart Summary
                </Text>
                <Text color="gray.600">Items: {cart.totalItems}</Text>
                <Text fontSize="xl" fontWeight="800">
                    Total: Rs. {cart.totalPriceInr.toLocaleString("en-IN")}
                </Text>
                <Button
                    mt="2"
                    size="lg"
                    colorPalette="orange"
                    onClick={() => navigate("/checkout")}
                >
                    Proceed to checkout
                </Button>
            </Stack>
        </Box>
    );
}
