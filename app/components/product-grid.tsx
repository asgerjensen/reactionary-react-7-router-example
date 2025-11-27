import type { ProductSearchResult, Price } from "@reactionary/core";
import ProductCard, { type ProductCardProps } from "~/components/product-card";

export interface ProductGridProps {
  productPage: ProductSearchResult;
  productPrices: Price[];
}

export function ProductGrid({ productPage, productPrices }: ProductGridProps) {
  return (
    <div className="grid grid-cols-4 gap-6 px-4 mt-8 md:px-12 lg:px-6 xl:px-4 xl:gap-6 2xl:px-24 2xl:gap-6 justify-items-center md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 overflow-hidden">
      {productPage.items.map((product) => {
        const price = productPrices.find(
          price => price.identifier.variant.sku === product.variants[0].variant.sku
        )!;
        const cardData: ProductCardProps = {
          product: product,
          price: price
        };
        return <ProductCard key={product.identifier.key} {...cardData} />;
      })}
    </div>
  );
}
