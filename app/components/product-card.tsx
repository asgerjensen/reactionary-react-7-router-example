import { Link } from "react-router";
import type { Price, Product, ProductSearchResultItem } from "@reactionary/core";
import { formatPrice } from "../utils/prices";
import { getCloudinaryUrl } from "../utils/cloudinary";

export interface ProductCardProps {
  product: ProductSearchResultItem;
  price: Price | undefined;
  cloudinaryCloudName?: string; 
}

export default function ProductCard(data: ProductCardProps) {

  const product = data.product;
  const price = data.price;

  const variant = product.variants[0]

  // Transform image URL with Cloudinary for optimization
  const imageUrl = getCloudinaryUrl(variant.image.sourceUrl, {
    width: 320,
    height: 320,
    quality: 'auto',
    format: 'auto',
    crop: 'fill',
    gravity: 'auto'
  }, data.cloudinaryCloudName);

  return (
    <section className="overflow-hidden bg-white rounded-lg shadow:md hover:shadow-lg w-80">
      <Link to={`/products/${product.slug}`}>
        <div className="flex items-center justify-center bg-gray-100 shrink-0 aspect-square" >
          <img className="object-contain w-full h-full" src={imageUrl} alt={variant.image.altText || product.name} />
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
