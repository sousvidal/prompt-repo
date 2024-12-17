import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  return new Response("OK", { status: 200 });
};
