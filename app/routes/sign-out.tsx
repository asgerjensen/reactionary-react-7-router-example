import { redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { createReqContext, createClient } from "~/utils/client";
import { getSession, destroySession } from "~/utils/sessions.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);
  try {
    // Sign out from reactionary
    await client.identity.logout({});
  } catch(error) {
    console.error("Error during logout:", error);
  }
  
  // Destroy the session
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

// This route only handles the action, no component needed for display
export default function SignOutRoute() {
  return <> </>;
}
