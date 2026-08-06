import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Grid, Heading, Stack, Text } from "@chakra-ui/react";
import { createAdminProduct, type ProductPayload, updateAdminProduct } from "../api/adminApi";
import ProductForm from "../components/ProductForm";
import ProductInventoryList from "../components/ProductInventoryList";
import { productKeys, productsQueryOptions } from "../../products/api/productQueries";
import type { Product } from "../../products/types";

const emptyProductForm: ProductPayload = {
    slug: "",
    name: "",
    priceInr: 0,
    shortDescription: "",
    imageUrl: "",
    maskType: "",
    inStock: true,
};

function AdminPage() {
    const queryClient = useQueryClient();
    const productsQuery = useQuery(productsQueryOptions());
    const [formValues, setFormValues] = useState<ProductPayload>(emptyProductForm);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const products = productsQuery.data ?? [];

    const createProductMutation = useMutation({
        mutationFn: createAdminProduct,
        onSuccess: (response) => {
            queryClient.setQueryData<Product[]>(productKeys.lists(), (currentProducts = []) => [
                ...currentProducts,
                response.item,
            ]);
            queryClient.setQueryData(productKeys.detail(response.item.id), response.item);
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ productId, input }: { productId: string; input: ProductPayload }) =>
            updateAdminProduct(productId, input),
        onSuccess: (response) => {
            queryClient.setQueryData<Product[]>(productKeys.lists(), (currentProducts = []) =>
                currentProducts.map((product) =>
                    product.id === response.item.id ? response.item : product,
                ),
            );
            queryClient.setQueryData(productKeys.detail(response.item.id), response.item);
        },
    });

    const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

    const handleFormChange = (field: keyof ProductPayload, value: string | number | boolean) => {
        setFormValues((currentValues) => ({
            ...currentValues,
            [field]: value,
        }));
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setFormValues({
            slug: product.slug,
            name: product.name,
            priceInr: product.priceInr,
            shortDescription: product.shortDescription,
            imageUrl: product.imageUrl,
            maskType: product.maskType,
            inStock: product.inStock,
        });
        setError("");
        setSuccessMessage("");
    };

    const resetForm = () => {
        setSelectedProduct(null);
        setFormValues(emptyProductForm);
        setError("");
        setSuccessMessage("");
    };

    const handleSubmit = async () => {
        setError("");
        setSuccessMessage("");

        try {
            if (selectedProduct) {
                const response = await updateProductMutation.mutateAsync({
                    productId: selectedProduct.id,
                    input: formValues,
                });
                setSelectedProduct(response.item);
                setSuccessMessage("Product changes saved.");
                return;
            }

            await createProductMutation.mutateAsync(formValues);
            setSuccessMessage("Product created successfully.");
            setFormValues(emptyProductForm);
        } catch (submitError) {
            const nextError =
                submitError instanceof Error ? submitError.message : "Unknown error";
            setError(nextError);
        }
    };

    return (
        <Box
            as="main"
            width="min(1200px, calc(100% - 32px))"
            mx="auto"
            py={{ base: "12", md: "16" }}
        >
            <Box mb="8">
                <Text
                    mb="2"
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    color="orange.700"
                >
                    Admin Portal
                </Text>
                <Heading as="h1" mb="3" fontSize="clamp(2rem, 5vw, 3.5rem)">
                    Manage catalog products
                </Heading>
                <Text maxW="760px" color="gray.600">
                    Add new products, revise pricing, and update stock visibility from one
                    operational view.
                </Text>
            </Box>

            <Grid templateColumns={{ base: "1fr", xl: "420px 1fr" }} gap="6" alignItems="start">
                <ProductForm
                    formValues={formValues}
                    isSubmitting={isSubmitting}
                    mode={selectedProduct ? "edit" : "create"}
                    selectedProduct={selectedProduct}
                    error={error}
                    successMessage={successMessage}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                    onReset={resetForm}
                />

                <Stack gap="4">
                    <Box>
                        <Text
                            mb="2"
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            color="orange.700"
                        >
                            Product Inventory
                        </Text>
                        <Heading as="h2" size="lg" mb="2">
                            Current catalog
                        </Heading>
                        <Text color="gray.600">
                            Select any product to load it into the editor.
                        </Text>
                    </Box>

                    {productsQuery.isPending && (
                        <Box
                            px="4"
                            py="4"
                            borderRadius="xl"
                            bg="white"
                            borderWidth="1px"
                            borderColor="gray.200"
                        >
                            <Text>Loading products...</Text>
                        </Box>
                    )}

                    {!productsQuery.isPending && productsQuery.error && products.length === 0 && (
                        <Box
                            px="4"
                            py="4"
                            borderRadius="xl"
                            bg="red.50"
                            borderWidth="1px"
                            borderColor="red.200"
                        >
                            <Text color="red.700">Error: {productsQuery.error.message}</Text>
                        </Box>
                    )}

                    {!productsQuery.isPending && !productsQuery.error && products.length === 0 && (
                        <Box
                            px="4"
                            py="4"
                            borderRadius="xl"
                            bg="white"
                            borderWidth="1px"
                            borderColor="gray.200"
                        >
                            <Text>No products found.</Text>
                        </Box>
                    )}

                    {!productsQuery.isPending && products.length > 0 && (
                        <ProductInventoryList
                            products={products}
                            selectedProductId={selectedProduct?.id ?? ""}
                            onSelect={handleSelectProduct}
                        />
                    )}
                </Stack>
            </Grid>
        </Box>
    );
}

export default AdminPage;
