import { Form, redirect, useLoaderData, data } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type {
  Checkout,
  MonetaryAmount,
  ShippingInstruction,
  ShippingMethod,
} from "@reactionary/core";
import { useState } from "react";
import { createClient, createReqContext } from "~/utils/client";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import { CheckoutSummary } from "~/components/checkout-summary";

export interface ShippingLoaderData {
  shippingMethods: Array<ShippingMethod>;
  checkout: Checkout;
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
    const shippingMethods = await client.checkout.getAvailableShippingMethods({
      checkout: { key: checkoutId || "" },
    });

    return data(
      { shippingMethods, checkout },
      await withDefaultReponseHeaders(session, reqCtx, {}),
    );
  } catch (error) {
    console.error("Error loading checkout:", error);
    throw error;
  }
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const checkoutId = params.checkoutId;
  const formData = await request.formData();

  const selectedMethod = formData.get("shippingMethod") as string;
  const shippingInstructions = formData.get("shippingInstructions") as string;
  const allowUnattendedDelivery =
    formData.get("allowUnattendedDelivery") === "on";

  const session = await getSession(request.headers.get("Cookie"));
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);

  const checkout = await client.checkout.getById({ identifier: { key: checkoutId || "" } });
  if (!checkout) {
      throw new Response("Checkout Not Found", { status: 404 });
  }

  const shippingInstruction: ShippingInstruction = {
      shippingMethod: { key: selectedMethod },
      instructions: shippingInstructions,
      pickupPoint: "",
      consentForUnattendedDelivery: allowUnattendedDelivery,
      meta: {
        cache: {
            hit: false,
            key: 'si-'+Date.now()
        },
        placeholder: false
      }
  }
  console.log('Selected shipping method in action:', shippingInstruction);
  const updatedCheckout = await client.checkout.setShippingInstruction({
    checkout: checkout?.identifier,
    shippingInstruction: shippingInstruction,
  });

  // TODO: Save shipping method, instructions, and delivery preference
  console.log("Selected shipping method:", selectedMethod);
  console.log("Shipping instructions:", shippingInstructions);
  console.log("Allow unattended delivery:", allowUnattendedDelivery);

  return redirect(`/checkout/${checkoutId}/payment`);
};

export default function ShippingRoute() {
  const { shippingMethods, checkout } = useLoaderData<ShippingLoaderData>();
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const formatPrice = (price: MonetaryAmount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currency,
    }).format(price.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Shipping Method</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
        <Form method="post" className="space-y-6">
          {/* Shipping Methods */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Select Shipping Method
            </h2>
            <div className="space-y-3">
              {shippingMethods.map((method) => (
                <label
                  key={method.identifier.key}
                  className={`flex cursor-pointer items-center justify-between
                  rounded-lg border-2 p-4 transition-colors ${
                  selectedMethod === method.identifier.key
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.identifier.key}
                      checked={selectedMethod === method.identifier.key}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      required
                      className="h-4 w-4 text-emerald-600
                        focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-semibold">{method.name}</div>
                      <div className="text-sm text-gray-600">
                        {method.description}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-emerald-600">
                    {method.price.value === 0
                      ? "FREE"
                      : formatPrice(method.price)}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Shipping Instructions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Delivery Preferences</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="shippingInstructions"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Shipping Instructions (Optional)
                </label>
                <textarea
                  id="shippingInstructions"
                  name="shippingInstructions"
                  rows={3}
                  placeholder="e.g., Leave package at front door, Call upon arrival, etc."
                  className="w-full rounded-md border border-gray-300 px-4 py-2
                    focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="allowUnattendedDelivery"
                  name="allowUnattendedDelivery"
                  className="mt-1 h-4 w-4 rounded text-emerald-600
                    focus:ring-emerald-500"
                />
                <label
                  htmlFor="allowUnattendedDelivery"
                  className="cursor-pointer text-sm text-gray-700"
                >
                  <span className="font-medium">Allow Unattended Delivery</span>
                  <p className="mt-1 text-gray-600">
                    The carrier can leave the package without requiring a
                    signature
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-emerald-600 px-6 py-3
                font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Continue to Payment
            </button>
          </div>
        </Form>
        </div>

        {/* Checkout Summary */}
        <div className="lg:col-span-1">
          <CheckoutSummary
            itemCount={checkout.items.length}
            subtotal={checkout.price.totalProductPrice}
            shipping={checkout.price.totalShipping}
            tax={checkout.price.totalTax}
            discount={checkout.price.totalDiscount}
            total={checkout.price.grandTotal}
          />
        </div>
      </div>
    </div>
  );
}
