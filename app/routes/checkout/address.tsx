import type { Address } from "@reactionary/core";
import { Form, redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { createClient, createReqContext } from "~/utils/client";
import { getSession } from "~/utils/sessions.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const checkoutId = params.checkoutId;
  const formData = await request.formData();

  // Address data is available in formData if needed:
   const address = {
     firstName: formData.get("firstName") as string,
     lastName: formData.get("lastName") as string,
     streetAddress: formData.get("streetAddress") as string,
     streetNumber: formData.get("streetNumber") as string,
     city: formData.get("city") as string,
     postalCode: formData.get("postalCode") as string,
     region: '',
     countryCode: formData.get("countryCode") as string,
   } satisfies Omit<Address, 'meta' | 'identifier' >;

   const email = formData.get("email") as string;
   const phone = formData.get("phone") as string;

  const session = await getSession(request.headers.get("Cookie"));
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);
   const cartId = await client.cart.getActiveCartId();
   const cart = await client.cart.getById({ cart: cartId });

  const checkout = await client.checkout.initiateCheckoutForCart({
    cart: cart,
    billingAddress: address,
    notificationEmail: email,
    notificationPhone: phone,
  });

  return redirect(`/checkout/${checkout.identifier.key}/shipping`);
};

export default function AddressRoute() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shipping Address</h1>

      <div className="max-w-2xl">
        <Form method="post" className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Street Address */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="streetAddress"
                  name="streetAddress"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="streetNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Number *
                </label>
                <input
                  type="text"
                  id="streetNumber"
                  name="streetNumber"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* City, Postal Code */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                id="countryCode"
                name="countryCode"
                required
                defaultValue="US"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Email and Phone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
              >
                Continue to Shipping
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}