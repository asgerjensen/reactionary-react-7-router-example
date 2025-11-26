import { data, useLoaderData } from "react-router";
import type { ProductSearchResult, Price } from "@reactionary/core";
import { createClient, createReqContext } from "~/utils/client";
import ProductCard, { type ProductCardProps } from "~/components/product-card";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import type { Route } from "./+types";

export interface ProductsIndexLoaderData {
  productPage: ProductSearchResult;
  productPrices: Price[];
}
export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);
  const productPageResponse = await client.productSearch.queryByTerm({
    search: {
      term: "*",
      paginationOptions: {
        pageNumber: 1,
        pageSize: 12
      },
      facets: [],
      filters: []
    }
  });

  const pricePromises = productPageResponse.items.map(async (product) => {
    if (product.variants.length === 0) {
      //skip
      return null;
    }
    return client.price.getCustomerPrice({
      variant: product.variants[0].variant,
    });
  });
  const prices = (await Promise.all(pricePromises)).filter((price): price is Price => price !== null);
  return data({
    productPage: productPageResponse,
    productPrices: prices
  }, await withDefaultReponseHeaders(session, reqCtx, {}) );
};



export default function ProductsIndexRoute() {
  const data: ProductsIndexLoaderData = useLoaderData();
  const productPage = data.productPage;
  const productPrices = data.productPrices;


  return (
    <div className="w-full p-4 my-8">
      <h1 className="text-center">Latest Arrivals</h1>
      <div className="grid grid-cols-4 gap-6 px-4 mt-8 md:px-12 lg:px-6 xl:px-4 xl:gap-6 2xl:px-24 2xl:gap-6 justify-items-center md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 overflow-hidden">
        {productPage.items.map((product) =>  {
          const price = productPrices.find(price => price.identifier.variant.sku === product.variants[0].variant.sku)!;
            const cardData: ProductCardProps = {
              product: product,
              price: price
            };
          return <ProductCard key={product.identifier.key} {...cardData} />
        }
        )}
      </div>
    </div>
  );
}
