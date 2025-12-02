import Navbar from "./navbar";
import Footer from "./footer";
import {  data, Outlet, useLoaderData, type LoaderFunctionArgs, } from "react-router";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import { createClient, createReqContext } from "~/utils/client";
import type { Category } from "@reactionary/core";



export const loader = async ({ request }: LoaderFunctionArgs) => {

  const session = await getSession(
    request.headers.get("Cookie")
  );
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);
  const cart = await client.cart.getById({
    cart:  await client.cart.getActiveCartId()
  });
  const isLoggedIn = session.has("isLoggedIn") && session.get("isLoggedIn") === true;

  // Fetch categories - using empty array as fallback for now
  // TODO: Implement proper category fetching when API method is available
  const categories: Category[] = (await client.category.findTopCategories({paginationOptions: { pageNumber: 1, pageSize: 5 }})).items;


  return data({ cartCount: cart.items.length, isLoggedIn, categories  }, await withDefaultReponseHeaders(session, reqCtx, {}) );
}

export default function Layout() {
  const { cartCount, isLoggedIn, categories } = useLoaderData() as { cartCount: number, isLoggedIn: boolean, categories: Category[] };
  return (
    <>
      <header className="border-b">
        <Navbar cartCount={cartCount} isLoggedIn={isLoggedIn} categories={categories} />
      </header>
      <main className="container flex justify-center flex-grow mx-auto">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
