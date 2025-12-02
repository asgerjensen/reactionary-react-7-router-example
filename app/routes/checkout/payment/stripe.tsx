import { useLoaderData, data } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import type { Checkout } from "@reactionary/core";
import { createClient, createReqContext } from "~/utils/client";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

export interface StripePaymentLoaderData {
  checkout: Checkout;
  clientSecret: string;
  stripePublishableKey: string;
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

    // Find the first pending payment instruction
    const pendingPayment = checkout.paymentInstructions.find(
      (instruction) => instruction.status === "pending"
    );

    if (!pendingPayment) {
      throw new Response("No pending payment instruction found", { status: 400 });
    }

    // Get client_secret from protocol data
    const clientSecretData = pendingPayment.protocolData.find(
      (data) => data.key === "stripe_clientSecret" || data.key === "client_secret"
    );

    if (!clientSecretData) {
      throw new Response("Client secret not found", { status: 400 });
    }

    const clientSecret = String(clientSecretData.value);
    const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || "";

    return data(
      { checkout, clientSecret, stripePublishableKey },
      await withDefaultReponseHeaders(session, reqCtx, {})
    );
  } catch (error) {
    console.error("Error loading checkout:", error);
    throw error;
  }
};

function CheckoutForm({ checkoutId }: { checkoutId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/${checkoutId}/success`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "An error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Payment Details</h2>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function StripePaymentRoute() {
  const { checkout, clientSecret, stripePublishableKey } =
    useLoaderData<StripePaymentLoaderData>();

  const stripePromise = loadStripe(stripePublishableKey);

  const options = {
    clientSecret,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Complete Payment</h1>

      <div className="max-w-2xl">
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm checkoutId={String(checkout.identifier.key)} />
        </Elements>
      </div>
    </div>
  );
}
