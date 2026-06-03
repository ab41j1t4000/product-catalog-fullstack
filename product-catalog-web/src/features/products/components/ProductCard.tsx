import { useNavigate } from "react-router-dom";
import type { Product } from "../types";

type ProductCardProps = {
    product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
    const navigate = useNavigate();

    return (
        <article
            className="product-card"
            onClick={() => navigate(`/products/${product.id}`)}
        >
            <img
                className="product-image"
                src={product.imageUrl}
                alt={product.name}
            />

            <div className="product-body">
                <div className="product-top">
                    <p className="product-type">{product.maskType}</p>
                    <p className="product-price">
                        Rs. {product.priceInr.toLocaleString("en-IN")}
                    </p>
                </div>

                <h2>{product.name}</h2>
                <p className="product-description">{product.shortDescription}</p>

                <p
                    className={
                        product.inStock ? "stock in-stock" : "stock out-of-stock"
                    }
                >
                    {product.inStock ? "In stock" : "Out of stock"}
                </p>
            </div>
        </article>
    );
}
