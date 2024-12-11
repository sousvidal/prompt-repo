import { ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

export async function action({ request, params }: ActionFunctionArgs) {
  const prisma = new PrismaClient();
  const body = await request.json();
  console.log(body);
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
