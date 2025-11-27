import { data, Form, Link, redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import type { Route } from "./+types/sign-up";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import  { createClient, createReqContext } from "~/utils/client";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    if (session.has("error")) {
        const error = session.get("error");
        return data( { error }, await withDefaultReponseHeaders(session, await createReqContext(request, session), {}));
    }
    return data( {}, await withDefaultReponseHeaders(session, await createReqContext(request, session), {}));
};


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;


  const session = await getSession(
    request.headers.get("Cookie")
  );
  const reqCtx = await createReqContext(request,session);
  const client = await createClient(reqCtx);

  // TODO: Implement actual sign-up logic
  console.log("Sign up:", { email, password, firstName, lastName });

  try {
    const me = await client.identity.register({
        username: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
    });
    console.log("Registered user:", me);
  } catch(err) {
    session.flash("error", "Error creating account: " + err);
    return redirect("/sign-up", await withDefaultReponseHeaders(session, reqCtx, {}));
  }

  // For now, just redirect to sign-in
  return redirect("/");
};

export default function SignUpRoute({ loaderData }: Route.ComponentProps) {
  const { error } = loaderData;
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-3xl font-bold text-center">Create Account</h1>
        { error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
            { error}
          </div>
        ) }
        <Form method="post" className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            Create Account
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign In
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
