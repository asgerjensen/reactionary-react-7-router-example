import type { Component } from "react";
import type { Route } from "./+types/sign-in";

import { data, Form, Link, redirect } from "react-router";
import { createClient, createReqContext } from "~/utils/client";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    if (session.has('isLoggedIn') && session.get('isLoggedIn') === true) {
        return redirect("/" );
    }
    if (session.has("error")) {
        const error = session.get("error");
        return data( { error }, await withDefaultReponseHeaders(session, await createReqContext(request, session), {}));
    }
    return data( {}, await withDefaultReponseHeaders(session, await createReqContext(request, session), {}));
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const session = await getSession(
    request.headers.get("Cookie")
  );
  const reqCtx = await createReqContext(request,session);
  const client = await createClient(reqCtx);

  try {
    const me = await client.identity.login({
        username: email,
        password: password,
    });
    if (me.type === 'Registered') {
        session.set("isLoggedIn", true);
        session.set('userId', me.id.userId );
    }
    return data({ me}, await withDefaultReponseHeaders(session, reqCtx, {}));
  } catch(err) {
    session.flash("error", "Invalid email or password " + err);
    return redirect("/sign-in", await withDefaultReponseHeaders(session, reqCtx, {}));
  }
};

export default function SignInRoute({
  loaderData,
}: Route.ComponentProps) {

  const { error } = loaderData;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-3xl font-bold text-center">Sign In</h1>
        { error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
            { error}
          </div>
        ) }
        <Form method="post" className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link to="/sign-up" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
