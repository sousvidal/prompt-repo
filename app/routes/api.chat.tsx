import { ActionFunctionArgs } from "@remix-run/node";
import OpenAI from "openai";
import { isAuthenticated } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  if (!await isAuthenticated(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openai = new OpenAI();
  const body = await request.json();
  const { messages } = body;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
  });

  return Response.json({
    message: response.choices[0].message,
    timestamp: Date.now(),
  });
}

