import Navbar from "./navbar";
import Footer from "./footer";
import {  data, Outlet, useLoaderData, type LoaderFunctionArgs, } from "react-router";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import { createClient, createReqContext } from "~/utils/client";



export const loader = async ({ request }: LoaderFunctionArgs) => {

  const session = await getSession(
    request.headers.get("Cookie")
  );
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);
  const cart = await client.cart.getById({
    cart:  await client.cart.getActiveCartId()
  });
  let isLoggedIn = false;

  try {
    const me = await client.identity.getSelf({});
    isLoggedIn =  me.type === 'Registered';
  } catch (error) {
    isLoggedIn = false;
  }

  return data({ cartCount: cart.items.length, isLoggedIn  }, await withDefaultReponseHeaders(session, reqCtx, {}) );
}

export default function Layout() {
  const { cartCount, isLoggedIn } = useLoaderData() as { cartCount: number, isLoggedIn: boolean };
  return (
    <>
      <header className="border-b">
        <Navbar cartCount={cartCount} isLoggedIn={isLoggedIn} />
      </header>
      <main className="container flex justify-center flex-grow mx-auto">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
