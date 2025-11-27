import { Link } from "react-router";
import type { Price, Product, ProductSearchResultItem } from "@reactionary/core";
import { formatPrice } from "../utils/prices";
export interface ProductCardProps {
  product: ProductSearchResultItem;
  price: Price | undefined;
}

export default function ProductCard(data: ProductCardProps) {

  const product = data.product;
  const price = data.price;

  const variant = product.variants[0]



  return (
    <section className="overflow-hidden bg-white rounded-lg shadow:md hover:shadow-lg w-80">
      <Link to={`/products/${product.slug}`}>
        <div className="flex items-center justify-center bg-gray-100 shrink-0 aspect-square" >
          <img className="object-contain w-full h-full" src={variant.image.sourceUrl} alt={variant.image.altText || product.name} />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-700 hover:underline">
            {product.name}
          </h3>
          <p className="font-semibold text-teal-600">{formatPrice(price)}</p>
        </div>
      </Link>
    </section>
  );
}
