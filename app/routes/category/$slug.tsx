import { data, useLoaderData } from "react-router";
import type { ProductSearchResult, Price, Category, FacetValueIdentifier } from "@reactionary/core";
import { createClient, createReqContext } from "~/utils/client";
import { ProductGrid } from "~/components/product-grid";
import { Pagination } from "~/components/pagination";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import type { Route } from "./+types/$slug";
import { Facets } from "~/components/facets";


export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);
  
  const url = new URL(request.url);
  const currentPage = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = 12;

  // Extract filters from URL query parameters
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

  // Get category by slug
  const category = await client.category.getBySlug({ slug: params.slug || '' });
  
  if (!category) {
    throw new Response("Category Not Found", { status: 404 });
  }
  const breadcrumbs = await client.category.getBreadcrumbPathToCategory({
    id: category.identifier,
  }); 

  const categoryFilter = await client.productSearch.createCategoryNavigationFilter({
    categoryPath: breadcrumbs
  })

  // Request facets to be included in the search results
  const productPageResponse = await client.productSearch.queryByTerm({
    search: {
      term: '*',
      paginationOptions: {
        pageNumber: currentPage,
        pageSize: pageSize
      },
      facets: [...facetSelections],
      filters: [],
      categoryFilter,
    }
  });

  console.log("Product Page Response:", productPageResponse);
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
      currentPage: currentPage,
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || undefined
    },
    await withDefaultReponseHeaders(session, reqCtx, {})
  );
};

export default function CategoryRoute( { loaderData }: Route.ComponentProps ) {
  const { category, productPage, productPrices, currentPage, cloudinaryCloudName } = loaderData;
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
        <div className="flex gap-8">
          {/* Facets Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <Facets productPage={productPage} />
          </aside>
          
          {/* Main Content */}
          <div className="flex-1">
            <ProductGrid productPage={productPage} productPrices={productPrices} cloudinaryCloudName={cloudinaryCloudName} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={productPage.totalCount}
              itemsPerPage={12}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
