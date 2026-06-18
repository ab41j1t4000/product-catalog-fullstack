import type { Product } from "../types";

export default function ProductInfo({ product }: { product: Product }) {
    console.log(product);
    return (
        <div>
            <h2>{product.name}</h2>
            <p>{product.shortDescription}</p>
            <p>Price: Rs. {product.priceInr.toLocaleString("en-IN")}</p>
            <p>Mask Type: {product.maskType}</p>
            <p>{product.inStock ? "In stock" : "Out of stock"}</p>
        </div>
    )

}