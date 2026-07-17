import { Box, Button, Grid, Heading, Input, Stack, Text } from "@chakra-ui/react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import type { Product } from "../../products/types";
import type { ProductPayload } from "../api/adminApi";

type ProductFormProps = {
    formValues: ProductPayload;
    isSubmitting: boolean;
    mode: "create" | "edit";
    selectedProduct: Product | null;
    error: string;
    successMessage: string;
    onChange: (field: keyof ProductPayload, value: string | number | boolean) => void;
    onSubmit: () => Promise<void>;
    onReset: () => void;
};

export default function ProductForm({
    formValues,
    isSubmitting,
    mode,
    selectedProduct,
    error,
    successMessage,
    onChange,
    onSubmit,
    onReset,
}: ProductFormProps) {
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await onSubmit();
    };

    const handleTextChange =
        (field: keyof ProductPayload) => (event: ChangeEvent<HTMLInputElement>) => {
            onChange(field, event.target.value);
        };

    return (
        <form
            onSubmit={(event) => {
                void handleSubmit(event);
            }}
        >
            <Box
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="2xl"
                bg="white"
                p={{ base: "5", md: "6" }}
                boxShadow="sm"
            >
                <Stack gap="5">
                    <Box>
                        <Text
                            mb="2"
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            color="orange.700"
                        >
                            {mode === "create" ? "Create Product" : "Edit Product"}
                        </Text>
                        <Heading as="h2" size="lg">
                            {mode === "create"
                                ? "Add a new catalog entry"
                                : `Update ${selectedProduct?.name ?? "selected product"}`}
                        </Heading>
                    </Box>

                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="4">
                        <FieldLabel label="Product name">
                            <Input
                                value={formValues.name}
                                onChange={handleTextChange("name")}
                                placeholder="Oni Collector Mask"
                            />
                        </FieldLabel>

                        <FieldLabel label="Slug">
                            <Input
                                value={formValues.slug}
                                onChange={handleTextChange("slug")}
                                placeholder="oni-collector-mask"
                            />
                        </FieldLabel>

                        <FieldLabel label="Price (INR)">
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                value={String(formValues.priceInr)}
                                onChange={(event) => {
                                    onChange("priceInr", Number(event.target.value));
                                }}
                                placeholder="3499"
                            />
                        </FieldLabel>

                        <FieldLabel label="Mask type">
                            <Input
                                value={formValues.maskType}
                                onChange={handleTextChange("maskType")}
                                placeholder="Oni"
                            />
                        </FieldLabel>
                    </Grid>

                    <FieldLabel label="Short description">
                        <Input
                            value={formValues.shortDescription}
                            onChange={handleTextChange("shortDescription")}
                            placeholder="Describe the material, style, or use case."
                        />
                    </FieldLabel>

                    <FieldLabel label="Image URL">
                        <Input
                            value={formValues.imageUrl}
                            onChange={handleTextChange("imageUrl")}
                            placeholder="https://images.example.com/mask.jpg"
                        />
                    </FieldLabel>

                    <Box>
                        <Text mb="2" fontSize="sm" fontWeight="600" color="gray.700">
                            Inventory state
                        </Text>
                        <Button
                            type="button"
                            variant="outline"
                            colorPalette={formValues.inStock ? "green" : "gray"}
                            onClick={() => {
                                onChange("inStock", !formValues.inStock);
                            }}
                        >
                            {formValues.inStock ? "In stock" : "Out of stock"}
                        </Button>
                    </Box>

                    {error && (
                        <Box borderWidth="1px" borderColor="red.200" bg="red.50" borderRadius="xl" p="3">
                            <Text color="red.700">{error}</Text>
                        </Box>
                    )}

                    {successMessage && (
                        <Box
                            borderWidth="1px"
                            borderColor="green.200"
                            bg="green.50"
                            borderRadius="xl"
                            p="3"
                        >
                            <Text color="green.700">{successMessage}</Text>
                        </Box>
                    )}

                    <Stack direction={{ base: "column", sm: "row" }} gap="3">
                        <Button type="submit" colorPalette="orange" loading={isSubmitting}>
                            {mode === "create" ? "Create product" : "Save changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={onReset} disabled={isSubmitting}>
                            {mode === "create" ? "Clear form" : "Cancel edit"}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </form>
    );
}

type FieldLabelProps = {
    label: string;
    children: ReactNode;
};

function FieldLabel({ label, children }: FieldLabelProps) {
    return (
        <Box>
            <Text mb="2" fontSize="sm" fontWeight="600" color="gray.700">
                {label}
            </Text>
            {children}
        </Box>
    );
}
