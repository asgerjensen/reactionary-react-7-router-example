import { data, Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import type { Cart, CartItem, MonetaryAmount, Product } from "@reactionary/core";
import { createClient, createReqContext } from "~/utils/client";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import { CartItemComponent } from "~/components/cart-item";

export interface CartLoaderData {
  cart: Cart | null;
  products: Product[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);

  try {
    const cartId = await client.cart.getActiveCartId();
    const cart = await client.cart.getById({ cart: cartId });
    
    const products = await Promise.all(
      cart.items.map((item) => {
        return client.product.getBySKU({ variant: item.variant });
      })
    );


    return data(
      { cart, products },
      await withDefaultReponseHeaders(session, reqCtx, {})
    );
  } catch (error) {
    console.error("Error loading cart:", error);
    return data(
      { cart: null },
      await withDefaultReponseHeaders(session, reqCtx, {})
    );
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);

  try {
    const formData = await request.formData();
    const actionType = formData.get("actionType") as string;
    const cartId = await client.cart.getActiveCartId();

    if (actionType === "remove") {
      const lineItemId = formData.get("lineItemId") as string;
      await client.cart.remove({
        cart: cartId,
        item: { key: lineItemId },
      });
    } else if (actionType === "updateQuantity") {
      const lineItemId = formData.get("lineItemId") as string;
      const quantity = parseInt(formData.get("quantity") as string, 10);
      await client.cart.changeQuantity({
        cart: cartId,
        item: { key: lineItemId },
        quantity: quantity,
      });
    }

    return data(
      { success: true },
      await withDefaultReponseHeaders(session, reqCtx, {})
    );
  } catch (error) {
    console.error("Error updating cart:", error);
    return data(
      { success: false },
      await withDefaultReponseHeaders(session, reqCtx, {})
    );
  }
};

export default function CartRoute() {
  const { cart, products } = useLoaderData<CartLoaderData>();

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }


  const formatCartPrice = (money: MonetaryAmount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
    }).format(money.value);
  };

    const productLookup = (item: CartItem) => {
        return products.find(x => x.mainVariant.identifier.sku === item.variant.sku);
    };

  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItemComponent 
              key={item.identifier.key}
              item={item}
              product={productLookup(item)}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">
                  {formatCartPrice(cart.price.totalProductPrice)}
                </span>
              </div>
              {cart.price.totalShipping && cart.price.totalShipping.value > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {formatCartPrice(cart.price.totalShipping)}
                  </span>
                </div>
              )}
              {cart.price.totalTax && cart.price.totalTax.value > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">
                    {formatCartPrice(cart.price.totalTax)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-300 pt-3 mb-6">
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-emerald-600">
                  {formatCartPrice(cart.price.grandTotal)}
                </span>
              </div>
            </div>

            <Link
              to={`/checkout/address`}
              className="block w-full text-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              className="block w-full text-center px-6 py-3 mt-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
