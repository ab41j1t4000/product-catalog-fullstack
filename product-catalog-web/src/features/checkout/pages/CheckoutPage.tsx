import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    HStack,
    Image,
    Input,
    RadioGroup,
    Separator,
    Stack,
    Text,
    Textarea,
    chakra,
} from "@chakra-ui/react";
import {
    FiArrowLeft,
    FiCheck,
    FiCreditCard,
    FiLock,
    FiMapPin,
    FiPackage,
    FiShield,
    FiTruck,
} from "react-icons/fi";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useCart } from "../../cart/context/cart-context";

type FieldProps = {
    label: string;
    name: string;
    type?: string;
    placeholder: string;
    autoComplete?: string;
    required?: boolean;
};

const fieldStyles = {
    bg: "white",
    borderColor: "#ded8d1",
    borderRadius: "12px",
    height: "48px",
    _focusVisible: { borderColor: "#b64d20", boxShadow: "0 0 0 1px #b64d20" },
};

function Field({ label, name, type = "text", placeholder, autoComplete, required = true }: FieldProps) {
    return (
        <Stack gap="1.5">
            <chakra.label htmlFor={name} fontSize="sm" fontWeight="700" color="#38322d">
                {label}
            </chakra.label>
            <Input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                {...fieldStyles}
            />
        </Stack>
    );
}

function SectionTitle({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) {
    return (
        <HStack gap="3" align="start">
            <Flex
                width="42px"
                height="42px"
                flexShrink="0"
                borderRadius="12px"
                bg="#f6e5d9"
                color="#a9421c"
                align="center"
                justify="center"
                fontSize="lg"
            >
                {icon}
            </Flex>
            <Box>
                <Text fontSize="xs" fontWeight="800" letterSpacing="0.09em" color="#a9421c" textTransform="uppercase">
                    {eyebrow}
                </Text>
                <Heading as="h2" fontSize="xl" color="#201d1a" letterSpacing="-0.02em">
                    {title}
                </Heading>
            </Box>
        </HStack>
    );
}

export default function CheckoutPage() {
    const { cart, isLoading, error, removeItem } = useCart();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [orderReference, setOrderReference] = useState("");

    const deliveryFee = useMemo(() => (cart && cart.totalPriceInr >= 2500 ? 0 : 149), [cart]);
    const orderTotal = (cart?.totalPriceInr ?? 0) + deliveryFee;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        window.setTimeout(async () => {
            setOrderReference(`JM-${Date.now().toString().slice(-6)}`);
            setIsSubmitting(false);
            setIsComplete(true);
            window.scrollTo({ top: 0, behavior: "smooth" });

            // Clear the purchased lines after confirmation is shown so the cart
            // badge and cart page reflect the completed order immediately.
            await Promise.all(cart?.items.map((item) => removeItem(item.id)) ?? []);
        }, 700);
    };

    if (isLoading) {
        return <Flex minH="65vh" align="center" justify="center"><Text color="gray.600">Preparing your checkout…</Text></Flex>;
    }

    if (error) {
        return <Flex minH="65vh" align="center" justify="center"><Text color="red.700">We couldn’t load your cart. {error}</Text></Flex>;
    }

    if (!isComplete && (!cart || cart.items.length === 0)) {
        return (
            <Flex as="main" minH="70vh" align="center" justify="center" px="5">
                <Stack maxW="440px" textAlign="center" align="center" gap="5">
                    <Flex width="64px" height="64px" borderRadius="full" bg="#f6e5d9" color="#a9421c" align="center" justify="center" fontSize="2xl">
                        <FiPackage />
                    </Flex>
                    <Heading size="xl">Your cart is waiting to be filled</Heading>
                    <Text color="gray.600">Explore our collection and add a mask before heading to checkout.</Text>
                    <Button colorPalette="orange" onClick={() => navigate("/")}>Browse the collection</Button>
                </Stack>
            </Flex>
        );
    }

    if (isComplete) {
        return (
            <Flex as="main" minH="72vh" align="center" justify="center" px="5" py="16">
                <Stack
                    width="full"
                    maxW="600px"
                    bg="white"
                    border="1px solid #e0d9d2"
                    borderRadius="24px"
                    boxShadow="0 24px 70px rgba(58, 42, 29, 0.10)"
                    p={{ base: "7", md: "12" }}
                    textAlign="center"
                    align="center"
                    gap="5"
                >
                    <Flex width="72px" height="72px" borderRadius="full" bg="#e4f3e8" color="#277342" align="center" justify="center" fontSize="3xl">
                        <FiCheck />
                    </Flex>
                    <Box>
                        <Text fontSize="sm" fontWeight="800" color="#a9421c" textTransform="uppercase" letterSpacing="0.1em">Order confirmed</Text>
                        <Heading mt="2" fontSize={{ base: "2xl", md: "3xl" }}>Thank you for your order</Heading>
                    </Box>
                    <Text color="gray.600" maxW="440px">
                        Your handcrafted masks are being prepared. We’ll send shipping updates to your email and phone.
                    </Text>
                    <Box bg="#faf7f3" borderRadius="14px" px="5" py="3">
                        <Text fontSize="sm" color="gray.600">Order reference</Text>
                        <Text fontWeight="800" letterSpacing="0.08em">{orderReference}</Text>
                    </Box>
                    <RouterLink to="/">
                        <Button colorPalette="orange" size="lg">Continue shopping</Button>
                    </RouterLink>
                </Stack>
            </Flex>
        );
    }

    if (!cart) {
        return null;
    }

    return (
        <Box as="main" width="min(1180px, calc(100% - 32px))" mx="auto" py={{ base: "8", md: "12" }}>
            <RouterLink to="/cart">
                <HStack width="fit-content" color="#6e6259" fontWeight="700" fontSize="sm" gap="2" mb="7" _hover={{ color: "#a9421c" }}>
                    <FiArrowLeft />
                    <Text>Back to cart</Text>
                </HStack>
            </RouterLink>

            <Box mb={{ base: "8", md: "10" }}>
                <Text fontSize="xs" fontWeight="800" color="#a9421c" textTransform="uppercase" letterSpacing="0.12em">Secure checkout</Text>
                <Heading as="h1" mt="1" fontSize={{ base: "3xl", md: "5xl" }} color="#201d1a" letterSpacing="-0.045em">Complete your order</Heading>
                <Text mt="3" color="#6e6259">One last step before your masks begin their journey to you.</Text>
            </Box>

            <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 1.45fr) minmax(340px, 0.75fr)" }} gap={{ base: "7", lg: "10" }} alignItems="start">
                <chakra.form id="checkout-form" onSubmit={handleSubmit}>
                    <Stack gap="6">
                        <Box bg="white" border="1px solid #e0d9d2" borderRadius="20px" p={{ base: "5", md: "7" }}>
                            <Stack gap="6">
                                <SectionTitle icon={<FiMapPin />} eyebrow="Step 1" title="Delivery details" />
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
                                    <Field label="First name" name="firstName" placeholder="Aarav" autoComplete="given-name" />
                                    <Field label="Last name" name="lastName" placeholder="Sharma" autoComplete="family-name" />
                                </Grid>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
                                    <Field label="Email address" name="email" type="email" placeholder="aarav@example.com" autoComplete="email" />
                                    <Field label="Phone number" name="phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" />
                                </Grid>
                                <Stack gap="1.5">
                                    <chakra.label htmlFor="address" fontSize="sm" fontWeight="700" color="#38322d">Street address</chakra.label>
                                    <Textarea id="address" name="address" placeholder="House number, street, locality" autoComplete="street-address" required minH="92px" bg="white" borderColor="#ded8d1" borderRadius="12px" _focusVisible={{ borderColor: "#b64d20", boxShadow: "0 0 0 1px #b64d20" }} />
                                </Stack>
                                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr", md: "1.1fr 1fr 0.8fr" }} gap="4">
                                    <Field label="City" name="city" placeholder="Bengaluru" autoComplete="address-level2" />
                                    <Field label="State" name="state" placeholder="Karnataka" autoComplete="address-level1" />
                                    <Field label="PIN code" name="postalCode" placeholder="560001" autoComplete="postal-code" />
                                </Grid>
                            </Stack>
                        </Box>

                        <Box bg="white" border="1px solid #e0d9d2" borderRadius="20px" p={{ base: "5", md: "7" }}>
                            <Stack gap="5">
                                <SectionTitle icon={<FiTruck />} eyebrow="Step 2" title="Delivery method" />
                                <HStack justify="space-between" align="center" border="2px solid #b64d20" bg="#fff9f5" borderRadius="14px" p="4" gap="4">
                                    <HStack gap="3">
                                        <Flex width="20px" height="20px" borderRadius="full" border="6px solid #b64d20" bg="white" flexShrink="0" />
                                        <Box>
                                            <Text fontWeight="800">Standard delivery</Text>
                                            <Text fontSize="sm" color="gray.600">Arrives in 4–6 business days</Text>
                                        </Box>
                                    </HStack>
                                    <Text fontWeight="800" color={deliveryFee === 0 ? "green.700" : "inherit"}>
                                        {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                                    </Text>
                                </HStack>
                            </Stack>
                        </Box>

                        <Box bg="white" border="1px solid #e0d9d2" borderRadius="20px" p={{ base: "5", md: "7" }}>
                            <Stack gap="5">
                                <SectionTitle icon={<FiCreditCard />} eyebrow="Step 3" title="Payment" />
                                <RadioGroup.Root value={paymentMethod} onValueChange={(details) => setPaymentMethod(details.value ?? "upi")}>
                                    <Stack gap="3">
                                        {[
                                            { value: "upi", title: "UPI", caption: "Pay with any UPI app", badge: "Fastest" },
                                            { value: "card", title: "Credit or debit card", caption: "Visa, Mastercard and RuPay", badge: "" },
                                            { value: "cod", title: "Cash on delivery", caption: "Pay when your order arrives", badge: "" },
                                        ].map((method) => (
                                            <RadioGroup.Item
                                                key={method.value}
                                                value={method.value}
                                                border="1px solid"
                                                borderColor={paymentMethod === method.value ? "#b64d20" : "#ded8d1"}
                                                bg={paymentMethod === method.value ? "#fff9f5" : "white"}
                                                borderRadius="14px"
                                                px="4"
                                                py="3.5"
                                                cursor="pointer"
                                            >
                                                <RadioGroup.ItemHiddenInput />
                                                <RadioGroup.ItemIndicator colorPalette="orange" />
                                                <RadioGroup.ItemText flex="1">
                                                    <HStack justify="space-between" width="full" gap="3">
                                                        <Box>
                                                            <Text fontWeight="800" color="#2a2521">{method.title}</Text>
                                                            <Text fontSize="sm" color="gray.600">{method.caption}</Text>
                                                        </Box>
                                                        {method.badge && <Text fontSize="xs" fontWeight="800" color="#a9421c" bg="#f6e5d9" borderRadius="full" px="2.5" py="1">{method.badge}</Text>}
                                                    </HStack>
                                                </RadioGroup.ItemText>
                                            </RadioGroup.Item>
                                        ))}
                                    </Stack>
                                </RadioGroup.Root>
                                <HStack color="gray.600" fontSize="sm" gap="2"><FiShield /><Text>Your payment details are encrypted and secure.</Text></HStack>
                            </Stack>
                        </Box>
                    </Stack>
                </chakra.form>

                <Box position={{ base: "static", lg: "sticky" }} top="24px">
                    <Box bg="#27221e" color="white" borderRadius="20px" overflow="hidden" boxShadow="0 20px 50px rgba(45, 35, 27, 0.16)">
                        <Stack gap="0">
                            <Box p={{ base: "5", md: "6" }}>
                                <HStack justify="space-between" mb="5">
                                    <Heading as="h2" fontSize="xl">Order summary</Heading>
                                    <Text fontSize="sm" color="#cfc5bc">{cart.totalItems} {cart.totalItems === 1 ? "item" : "items"}</Text>
                                </HStack>
                                <Stack gap="4">
                                    {cart.items.map((item) => (
                                        <HStack key={item.id} align="start" gap="3">
                                            <Box position="relative" flexShrink="0">
                                                <Image src={item.product.imageUrl} alt="" width="66px" height="66px" objectFit="cover" borderRadius="10px" bg="#eee" />
                                                <Flex position="absolute" top="-7px" right="-7px" width="22px" height="22px" borderRadius="full" bg="#d86837" align="center" justify="center" fontSize="xs" fontWeight="800">{item.quantity}</Flex>
                                            </Box>
                                            <Box flex="1" minW="0">
                                                <Text fontWeight="700" lineClamp="2" lineHeight="1.35">{item.product.name}</Text>
                                                <Text mt="1" fontSize="xs" color="#cfc5bc">{item.product.maskType}</Text>
                                            </Box>
                                            <Text fontWeight="700" whiteSpace="nowrap">₹{(item.quantity * item.product.priceInr).toLocaleString("en-IN")}</Text>
                                        </HStack>
                                    ))}
                                </Stack>
                            </Box>
                            <Separator borderColor="whiteAlpha.300" />
                            <Stack px={{ base: "5", md: "6" }} py="5" gap="3">
                                <HStack justify="space-between" color="#d8d0c9"><Text>Subtotal</Text><Text>₹{cart.totalPriceInr.toLocaleString("en-IN")}</Text></HStack>
                                <HStack justify="space-between" color="#d8d0c9"><Text>Delivery</Text><Text color={deliveryFee === 0 ? "#9dd9ab" : "inherit"}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</Text></HStack>
                                <HStack justify="space-between" pt="2"><Text fontWeight="800">Total</Text><Text fontSize="2xl" fontWeight="900">₹{orderTotal.toLocaleString("en-IN")}</Text></HStack>
                                <Text fontSize="xs" color="#aaa098" textAlign="right">Inclusive of all taxes</Text>
                            </Stack>
                            <Box p={{ base: "5", md: "6" }} pt="0">
                                <Button type="submit" form="checkout-form" width="full" size="lg" height="54px" bg="#d86837" color="white" _hover={{ bg: "#c2592c" }} loading={isSubmitting} loadingText="Placing order…">
                                    <FiLock /> Place order · ₹{orderTotal.toLocaleString("en-IN")}
                                </Button>
                                <HStack justify="center" mt="3" gap="2" color="#aaa098" fontSize="xs"><FiShield /><Text>100% secure checkout</Text></HStack>
                            </Box>
                        </Stack>
                    </Box>
                    <HStack mt="4" px="2" gap="3" color="#6e6259" align="start">
                        <FiPackage style={{ marginTop: 3, flexShrink: 0 }} />
                        <Text fontSize="sm">Carefully packed in Bengaluru and protected in transit.</Text>
                    </HStack>
                </Box>
            </Grid>
        </Box>
    );
}
