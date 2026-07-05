import { Badge } from "@chakra-ui/react";
import { useCart } from "../context/CartContext";

export default function CartBadge() {
    const { cart } = useCart();
    const totalItems = cart?.totalItems ?? 0;

    return (
        <Badge
            colorPalette="orange"
            borderRadius="full"
            px="2.5"
            py="1"
            fontSize="0.75rem"
        >
            {totalItems}
        </Badge>
    );
}