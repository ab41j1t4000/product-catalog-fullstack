import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import CartItemRow from "../components/CartItemRow";
import CartSummary from "../components/CartSummary";
import { useCart } from "../context/CartContext";

function CartPage() {
    const { cart, isLoading, error } = useCart();

    return (
        <Box
            as="main"
            width="min(1200px, calc(100% - 32px))"
            mx="auto"
            py={{ base: "12", md: "16" }}
        >
            <Heading as="h1" size="2xl" mb="8">
                Your Cart
            </Heading>
            {isLoading && <Text>Loading cart...</Text>}
            {!isLoading && error && <Text color="red.700">Error: {error}</Text>}

            {!isLoading && cart && cart.items.length === 0 && (
                <Box borderWidth="1px" borderColor="gray.200" borderRadius="2xl" bg="white" p="6">
                    <Text>Your cart is empty.</Text>
                </Box>
            )}
            {!isLoading && cart && cart.items.length > 0 && (
                <Stack gap="6">
                    <Stack gap="4">
                        {cart.items.map((item) => (
                            <CartItemRow key={item.id} item={item} />
                        ))}
                    </Stack>
                    <CartSummary cart={cart} />
                </Stack>
            )}
        </Box>
    );
}

export default CartPage;