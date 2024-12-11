import { ActionFunctionArgs } from "@remix-run/node";
import OpenAI from "openai";

export async function action({ request }: ActionFunctionArgs) {
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
