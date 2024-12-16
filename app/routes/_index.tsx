import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import { redirect, useNavigate } from "@remix-run/react";
import { isAuthenticated } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Prompt Repo" },
    { name: "description", content: "Prompt Repo" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  if (await isAuthenticated(request)) {
    throw redirect("/projects");
  }

  throw redirect("/login");
}

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/projects");
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      &nbsp;
    </div>
  );
}
