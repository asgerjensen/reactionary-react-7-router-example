import { data, useLoaderData } from "react-router";
import type { ProductSearchResult, Price, ProductSearchResultFacet, FacetValueIdentifier } from "@reactionary/core";
import { createClient, createReqContext } from "~/utils/client";
import { ProductGrid } from "~/components/product-grid";
import { Pagination } from "~/components/pagination";
import { Facets } from "~/components/facets";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import type { Route } from "./+types/plp";

export interface ProductsIndexLoaderData {
  productPage: ProductSearchResult;
  productPrices: Price[];
  currentPage: number;
}
export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);
  
  const url = new URL(request.url);
  const currentPage = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = 12;

  // Extract filters from URL query parameters
  // Format: filter_<facetKey>=value1&filter_<facetKey>=value2
  const facetSelections: Array<FacetValueIdentifier> = [];
  
  for (const [paramKey, paramValue] of url.searchParams.entries()) {
    if (paramKey.startsWith('filter_')) {
      const facetKey = paramKey.replace('filter_', '');
      facetSelections.push({
        facet: { key: facetKey },
        key: paramValue
      } satisfies FacetValueIdentifier);
    }
  }

   const productPageResponse = await client.productSearch.queryByTerm({
    search: {
      term: params.term || '*',
      paginationOptions: {
        pageNumber: currentPage,
        pageSize: pageSize
      },
      facets: [...facetSelections],
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
    currentPage: currentPage
  }, await withDefaultReponseHeaders(session, reqCtx, {}) );
};



export default function ProductsIndexRoute() {
  const data: ProductsIndexLoaderData = useLoaderData();
  const productPage = data.productPage;
  const productPrices = data.productPrices;
  const currentPage = data.currentPage;

  const totalPages = Math.ceil(productPage.totalCount / 12);

  return (
    <div className="w-full p-4 my-8">
      <h1 className="text-center mb-8">Search results</h1>
      
      <div className="flex gap-8">
        {/* Facets Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <Facets productPage={productPage} />
        </aside>
        
        {/* Main Content */}
        <div className="flex-1">
          <ProductGrid productPage={productPage} productPrices={productPrices} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={productPage.totalCount}
            itemsPerPage={12}
          />
        </div>
      </div>
    </div>
  );
}
