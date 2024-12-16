import { Button } from "~/components/ui/button";
import { GitGraphIcon } from "lucide-react";
import { redirect, useNavigate } from "@remix-run/react";
import { isAuthenticated } from "~/services/auth.server";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  if (await isAuthenticated(request)) {
    throw redirect("/projects");
  }

  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const handleGithubLogin = () => {
    navigate("/auth/github");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Login</h1>
      <div className="flex flex-col gap-2 mt-8">
        <Button onClick={handleGithubLogin}>
          <GitGraphIcon className="w-4 h-4" />
          Login with Github
        </Button>
      </div>
    </div>
  );
}