import { ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

export async function loader({ request, params }: ActionFunctionArgs) {
  const prisma = new PrismaClient();
  const bearerToken = await request.headers.get('Authorization');
  const apiKey = bearerToken?.split(' ')[1];
  const environment = request.headers.get('X-Environment');
  const verbose = request.headers.get('X-Verbose') === 'true';
  
  // start a performance timer
  const start = performance.now();

  if (apiKey && environment && params.promptId) {
    const project = await prisma.project.findFirst({
      where: { apiKeys: { some: { key: apiKey } } },
      include: {
        prompts: {
          where: {
            OR: [
              { id: params.promptId },
              { slug: params.promptId },
            ],
          },
          include: {
            commits: {
              where: {
                publishedCommits: {
                  some: { environment: environment || 'production' },
                },
              },
              include: {
                messages: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!project) {
      return Response.json({ error: 'Incorrect API key.' }, { status: 401 });
    }

    if (!project.prompts || project.prompts.length === 0) {
      return Response.json({ error: 'Could not find the prompt.' }, { status: 404 });
    }

    if (!project.prompts[0].commits || project.prompts[0].commits.length === 0) {
      return Response.json({ error: 'Could not find the commit.' }, { status: 404 });
    }

    const commit = project.prompts[0].commits[0];
    const messages = commit.messages.map(message => ({ role: message.role, content: message.content }));

    if (verbose) {
      return Response.json({ messages, info: {
        prompt: {
          id: project.prompts[0].id,
          name: project.prompts[0].name,
          slug: project.prompts[0].slug,
          description: project.prompts[0].description,
        },
        commit: {
          id: commit.id,
          description: commit.description,
        },
        environment,
        duration: performance.now() - start,
      } });
    }

    return Response.json({ messages });
  }

  prisma.$disconnect();
  return Response.json({ error: 'Invalid API key' }, { status: 401 });
}

