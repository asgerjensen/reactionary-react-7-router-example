import { useLoaderData, data, Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import type { Checkout, CheckoutItem, MonetaryAmount, Product } from "@reactionary/core";
import { createClient, createReqContext } from "~/utils/client";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import { BiCheckCircle } from "react-icons/bi";

export interface SuccessLoaderData {
  checkout: Checkout;
  products: Product[];
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);

  try {
    const checkoutId = params.checkoutId;
    const checkout = await client.checkout.getById({
      identifier: { key: checkoutId || "" },
    });

    if (!checkout) {
      throw new Response("Checkout Not Found", { status: 404 });
    }

    // Get products for all checkout items
    const products = await Promise.all(
      checkout.items.map((item) => {
        return client.product.getBySKU({ variant: item.variant });
      })
    );

    return data(
      { checkout, products },
      await withDefaultReponseHeaders(session, reqCtx, {})
    );
  } catch (error) {
    console.error("Error loading checkout:", error);
    throw error;
  }
};

export default function SuccessRoute() {
  const { checkout, products } = useLoaderData<SuccessLoaderData>();

  const formatPrice = (money: MonetaryAmount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
    }).format(money.value);
  };

  const productLookup = (item: CheckoutItem) => {
    return products.find((x) => x.mainVariant.identifier.sku === item.variant.sku);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <BiCheckCircle className="mx-auto mb-4 text-6xl text-emerald-600" />
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{String(checkout.identifier.key)}</span>
            </div>
            {checkout.billingAddress && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">
                    {checkout.billingAddress.firstName} {checkout.billingAddress.lastName}
                  </span>
                </div>
                {checkout.billingAddress.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{String(checkout.billingAddress.email)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        {checkout.shippingAddress && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
            <div className="text-sm text-gray-700">
              <p className="font-medium">
                {checkout.shippingAddress.firstName} {checkout.shippingAddress.lastName}
              </p>
              <p>
                {String(checkout.shippingAddress.streetAddress)} {String(checkout.shippingAddress.streetNumber)}
              </p>
        
              <p>
                {String(checkout.shippingAddress.city)}, {String(checkout.shippingAddress.region)}{" "}
                {String(checkout.shippingAddress.postalCode)}
              </p>
              <p>{String(checkout.shippingAddress.countryCode)}</p>
      
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
          <div className="space-y-4">
            {checkout.items.map((item) => {
              const product = productLookup(item);
              return (
                <div
                  key={String(item.identifier.key)}
                  className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  {/* Product Image */}
                  <div className="h-20 w-20 flex-shrink-0">
                    {product?.mainVariant?.images && product.mainVariant.images.length > 0 ? (
                      <img
                        src={product.mainVariant.images[0].sourceUrl}
                        alt={product.mainVariant.images[0].altText || "Product"}
                        className="h-full w-full rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded bg-gray-200">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 justify-between">
                    <div>
                      <h3 className="font-semibold">{String(product?.mainVariant?.name || product?.name )}</h3>
                      {item.variant?.sku && (
                        <p className="text-sm text-gray-500">SKU: {item.variant.sku}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.price.totalPrice)}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price.unitPrice)} each
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(checkout.price.totalProductPrice)}</span>
            </div>
            {checkout.price.totalShipping && checkout.price.totalShipping.value > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{formatPrice(checkout.price.totalShipping)}</span>
              </div>
            )}
            {checkout.price.totalTax && checkout.price.totalTax.value > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatPrice(checkout.price.totalTax)}</span>
              </div>
            )}
            {checkout.price.totalDiscount && checkout.price.totalDiscount.value > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-emerald-600">
                  -{formatPrice(checkout.price.totalDiscount)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2">
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-emerald-600">
                  {formatPrice(checkout.price.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {checkout.paymentInstructions && checkout.paymentInstructions.length > 0 && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Payment Information</h2>
            <div className="space-y-2">
              {checkout.paymentInstructions.map((instruction, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {String(instruction.paymentMethod.name || "Payment")}
                  </span>
                  <span className="font-medium capitalize">{String(instruction.status)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            to="/"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
          <Link
            to="/products"
            className="flex-1 rounded-lg bg-emerald-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}