import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/sessions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.authenticate("github", request);
  if (user) {
    const session = await getSession(request.headers.get("cookie"));
    session.set("user", user);

    throw redirect("/projects", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  throw redirect("/login");
}
