import type { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Prompt Repo" },
    { name: "description", content: "Prompt Repo" },
  ];
};

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
