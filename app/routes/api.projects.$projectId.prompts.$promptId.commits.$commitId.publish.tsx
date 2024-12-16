import { ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from "~/services/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  if (!await isAuthenticated(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = new PrismaClient();
  const body = await request.json();
  const { environments } = body;

  if (params.commitId && params.promptId && params.projectId) {
    const commit = await prisma.commit.findUnique({
      where: { id: params.commitId, promptId: params.promptId },
      include: {
        publishedCommits: true,
      },
    });

    if (commit) {
      // remove all published commits for this commit
      // NOTE: this is a lazy way to do this, but I don't care.
      await prisma.publishedCommit.deleteMany({
        where: { commitId: commit.id },
      });

      // create new published commits
      await prisma.publishedCommit.createMany({ 
        data: environments.map((environment: string) => ({
          commitId: commit.id,
          environment,
        })),
      });
    }
  }

  prisma.$disconnect();
  return Response.json({});
}