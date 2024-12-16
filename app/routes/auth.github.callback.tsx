import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await authenticator.authenticate("github", request);
    if (user) {
        return redirect("/projects");
    }

    return redirect("/login");
}