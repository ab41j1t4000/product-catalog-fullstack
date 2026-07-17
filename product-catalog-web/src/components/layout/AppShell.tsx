import { Box, Flex, Heading, HStack, Text, chakra } from "@chakra-ui/react";
import { Outlet, Link as RouterLink } from "react-router-dom";
import CartBadge from "../../features/cart/components/CartBadge";

const NavLink = chakra(RouterLink);

export default function AppShell() {
    return (
        <Box minH="100vh">
            <Box
                as="header"
                borderBottomWidth="1px"
                borderBottomColor="gray.200"
                bg="rgba(247,243,238,0.92)"
                backdropFilter="blur(12px)"
            >
                <Flex
                    width="min(1200px, calc(100% - 32px))"
                    mx="auto"
                    py="4"
                    align="center"
                    justify="space-between"
                    gap="4"
                >
                    <Box>
                        <Text
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            color="orange.700"
                        >
                            Curated Store
                        </Text>
                        <Heading size="md">Japanese Masks in India</Heading>
                    </Box>

                    <HStack gap="5">
                        <NavLink to="/" fontWeight="600">
                            Catalog
                        </NavLink>
                        <NavLink to="/admin" fontWeight="600">
                            Admin
                        </NavLink>
                        <NavLink to="/cart">
                            <HStack gap="2" fontWeight="600">
                                <Text>
                                    Cart
                                </Text>
                                <CartBadge />
                            </HStack>
                        </NavLink>
                    </HStack>
                </Flex>
            </Box>
            <Outlet />
        </Box>
    );
}
