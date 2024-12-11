import { ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

export async function action({ request, params }: ActionFunctionArgs) {
  const prisma = new PrismaClient();
  const body = await request.json();
  const { environments } = body;

  let commit = null;
  if (params.commitId && params.promptId && params.projectId) {
    commit = await prisma.commit.findUnique({
      where: { id: params.commitId, promptId: params.promptId },
      include: {
        publishedCommits: true,
      },
    });
  }

  prisma.$disconnect();
  return Response.json({});
}