import { Button } from "~/components/ui/button";
import { GitGraphIcon } from "lucide-react";
import { useNavigate } from "@remix-run/react";

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