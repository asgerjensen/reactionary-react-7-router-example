import { data, useLoaderData } from "react-router";
import type { ProductSearchResult, Price, Category } from "@reactionary/core";
import { createClient, createReqContext } from "~/utils/client";
import { ProductGrid } from "~/components/product-grid";
import { Pagination } from "~/components/pagination";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import type { Route } from "./+types/$slug";

export interface CategoryPageLoaderData {
  category: Category;
  productPage: ProductSearchResult;
  productPrices: Price[];
  currentPage: number;
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);
  
  const url = new URL(request.url);
  const currentPage = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = 12;

  // Get category by slug
  const category = await client.category.getBySlug({ slug: params.slug || '' });
  
  if (!category) {
    throw new Response("Category Not Found", { status: 404 });
  }

  // Search for products with this category's path
  const productPageResponse = await client.productSearch.queryByTerm({
    search: {
      term: '*',
      paginationOptions: {
        pageNumber: currentPage,
        pageSize: pageSize
      },
      facets: [],
      filters: [
        `categories.key:${category.identifier.key}`
      ]
    }
  });

  // Get prices for all products
  const pricePromises = productPageResponse.items.map(async (product) => {
    if (product.variants.length === 0) {
      return null;
    }
    return client.price.getCustomerPrice({
      variant: product.variants[0].variant,
    });
  });
  const prices = (await Promise.all(pricePromises)).filter(
    (price): price is Price => price !== null
  );

  return data(
    {
      category,
      productPage: productPageResponse,
      productPrices: prices,
      currentPage: currentPage
    },
    await withDefaultReponseHeaders(session, reqCtx, {})
  );
};

export default function CategoryRoute() {
  const { category, productPage, productPrices, currentPage } = useLoaderData<CategoryPageLoaderData>();
  const totalPages = Math.ceil(productPage.totalCount / 12);

  return (
    <div className="w-full p-4 my-8">
      <div className="mb-8">
        <h1 className="text-center text-4xl font-bold">{category.name}</h1>
        {category.text && (
          <p className="text-center text-gray-600 mt-2 max-w-2xl mx-auto">
            {category.text}
          </p>
        )}
      </div>

      {productPage.items.length > 0 ? (
        <>
          <ProductGrid productPage={productPage} productPrices={productPrices} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={productPage.totalCount}
            itemsPerPage={12}
          />
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
