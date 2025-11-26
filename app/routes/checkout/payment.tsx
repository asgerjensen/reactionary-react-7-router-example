import { Form, redirect, useLoaderData, data } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { PaymentMethod, Checkout } from "@reactionary/core";
import { useState } from "react";
import { createClient, createReqContext } from "~/utils/client";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import { CheckoutSummary } from "~/components/checkout-summary";

export interface PaymentLoaderData {
  paymentMethods: Array<PaymentMethod>;
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
    const paymentMethods = await client.checkout.getAvailablePaymentMethods({
      checkout: { key: checkoutId || "" },
    });
    return data(
      { paymentMethods, checkout },
      await withDefaultReponseHeaders(session, reqCtx, {})
    );
  } catch (error) {
    console.error("Error loading payment methods:", error);
    throw error;
  }
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const checkoutId = params.checkoutId;
  const formData = await request.formData();

  const selectedMethod = formData.get("paymentMethod") as string;

  const session = await getSession(request.headers.get("Cookie"));
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);

    const checkout = await client.checkout.getById({ identifier: { key: checkoutId || "" } });
    if (!checkout) {
        throw new Response("Checkout Not Found", { status: 404 });
    }
  const paymentMethods = await client.checkout.getAvailablePaymentMethods({
    checkout: checkout?.identifier,
  });

  const paymentMethod = paymentMethods.find(
    (method) => String(method.identifier.key) === selectedMethod
  );
  if (!paymentMethod) {
    throw new Response("Invalid Payment Method", { status: 400 });
  }


  const updatedCheckout = await client.checkout.addPaymentInstruction({
    checkout: checkout?.identifier,
    paymentInstruction: {
      paymentMethod: paymentMethod.identifier,
      amount: checkout.price.grandTotal,
      protocolData: [],
    },  
  });

  if (updatedCheckout.paymentInstructions[0].status === 'pending') {
    return redirect(`/checkout/${checkoutId}/payment/stripe`);
  }

  // TODO: Save selected payment method to checkout
  console.log("Selected payment method:", selectedMethod);

  return redirect(`/checkout/${checkoutId}/success`);
};

export default function PaymentRoute() {
  const { paymentMethods, checkout } = useLoaderData<PaymentLoaderData>();
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Payment Method</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
        <Form method="post" className="space-y-6">
          {/* Payment Methods */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Select Payment Method
            </h2>
            
            {paymentMethods.length === 0 ? (
              <p className="text-gray-600">No payment methods available.</p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={String(method.identifier.key)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-colors ${
                      selectedMethod === String(method.identifier.key)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={String(method.identifier.key)}
                        checked={selectedMethod === String(method.identifier.key)}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        required
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-semibold">{String(method.name)}</div>
                        {method.description && (
                          <div className="text-sm text-gray-600">
                            {String(method.description)}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Complete Order Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={paymentMethods.length === 0}
              className="flex-1 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Pay Now
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