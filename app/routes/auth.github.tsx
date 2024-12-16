import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticator, isAuthenticated } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  if (await isAuthenticated(request)) {
    throw redirect("/projects");
  }

  return await authenticator.authenticate("github", request);
}