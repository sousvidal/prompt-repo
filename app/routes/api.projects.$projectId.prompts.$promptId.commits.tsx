import { ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from "~/services/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  if (!await isAuthenticated(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = new PrismaClient();
  const body = await request.json();
  const { role, content, description } = body;

  let commit = null;
  if (params.promptId && params.projectId) {
    commit = await prisma.commit.create({
      data: {
        promptId: params.promptId,
        description: description,
        messages: {
          create: {
            role,
            content,
          },
        },
      },
      include: {
        messages: true,
      },
    });
  }

  prisma.$disconnect();
  return Response.json(commit);
}
