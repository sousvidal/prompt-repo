import { APIKey, Project as PrismaProject, Prompt } from '@prisma/client';

export interface Project extends PrismaProject {
  apiKeys: APIKey[];
  prompts: Prompt[];
} 
