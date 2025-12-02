import { data, useLoaderData } from "react-router";
import type { ProductSearchResult, Price } from "@reactionary/core";
import { createClient, createReqContext } from "~/utils/client";
import { ProductGrid } from "~/components/product-grid";
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
      term: "new",
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
    productPrices: prices,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || undefined,
  }, await withDefaultReponseHeaders(session, reqCtx, {}) );
};



export default function ProductsIndexRoute({ loaderData }: Route.ComponentProps ) {
  const data = loaderData;
  const productPage = data.productPage;
  const productPrices = data.productPrices;
  const cloudinaryCloudName = data.cloudinaryCloudName;


  return (
    <div className="w-full p-4 my-8">
      <h1 className="text-center">Latest Arrivals</h1>
      <ProductGrid productPage={productPage} productPrices={productPrices} cloudinaryCloudName={cloudinaryCloudName} />
    </div>
  );
}
