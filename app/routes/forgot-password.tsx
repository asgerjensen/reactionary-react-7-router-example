import { Form, Link, redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  // TODO: Implement actual password reset logic
  console.log("Password reset requested for:", email);

  // For now, just redirect to sign-in
  return redirect("/sign-in");
};

export default function ForgotPasswordRoute() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-4 text-3xl font-bold text-center">Forgot Password</h1>
        <p className="mb-8 text-center text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

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

          <button
            type="submit"
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            Send Reset Link
          </button>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/sign-in" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign In
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
