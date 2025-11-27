import { redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { createReqContext, createClient } from "~/utils/client";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // TODO: Implement actual sign-out logic (clear session, cookies, etc.)
  console.log("User signed out");
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const reqCtx = await createReqContext(request,session);
  const client = await createClient(reqCtx);
  const me = await client.identity.logout({});

  return redirect("/", await withDefaultReponseHeaders(session, reqCtx, {}) );
};

// This route only handles the action, no component needed for display
export default function SignOutRoute() {
  return <> </>;
}
