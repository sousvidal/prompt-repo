import { generateSlug } from "~/lib/slug";
import { PrismaClient, Prompt } from "@prisma/client";

export type PromptFormData = {
  name: string;
  description: string;
  projectId: string;
};

export async function createPrompt(
  data: PromptFormData,
  projectId: string
): Promise<Prompt> {
  const prisma = new PrismaClient();
  const prompt = await prisma.prompt.create({
    data: {
      name: data.name,
      description: data.description,
      slug: generateSlug(data.name),
      projectId: projectId,
    },
  });
  prisma.$disconnect();
  return prompt;
}

export async function deletePrompt(promptId: string) {
  const prisma = new PrismaClient();
  // TODO: implement cascade delete
  console.log("delete promptId", promptId);
  prisma.$disconnect();
}

export async function getPrompt(promptId: string): Promise<Prompt | null> {
  const prisma = new PrismaClient();
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    include: {
      commits: {
        include: {
          messages: true,
          publishedCommits: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      project: true,
    },
  });
  prisma.$disconnect();
  return prompt;
}
