import { PrismaClient, Project } from "@prisma/client";
import { generateSlug } from "~/lib/slug";

export type ProjectFormData = {
  name: string;
  description: string;
}

export async function getProjects(): Promise<Project[]> {
  const prisma = new PrismaClient();
  const projects = await prisma.project.findMany();
  prisma.$disconnect();
  return projects;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const prisma = new PrismaClient();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      prompts: true,
      apiKeys: true,
    },
  });
  prisma.$disconnect();
  return project;
} 

export async function deleteProject(projectId: string) {
  const prisma = new PrismaClient();
  // TODO: implement cascade delete
  console.log('delete projectId', projectId);
  prisma.$disconnect();
}

export async function createProject(data: ProjectFormData): Promise<Project> {
  const prisma = new PrismaClient();
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      slug: generateSlug(data.name),
      apiKeys: {
        create: {
          key: crypto.randomUUID(),
        },
      },
    },
  });

  prisma.$disconnect();
  return project;
}