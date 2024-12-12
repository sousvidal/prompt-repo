import { Project, PrismaClient, Prompt } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Link, redirect, useLoaderData } from '@remix-run/react';
import { CopyIcon, TrashIcon } from 'lucide-react';
import { DataTable } from '~/components/datatable';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import CreatePromptDialog from '~/components/create-prompt-dialog';
import { generateSlug } from '~/lib/slug';
import { ColumnDef } from '@tanstack/react-table';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';

type PromptFormData = {
  name: string;
  description: string;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const prisma = new PrismaClient();
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      prompts: true,
      apiKeys: true,
    },
  });
  prisma.$disconnect();
  return project;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const prisma = new PrismaClient();
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as PromptFormData;
  const prompt = await prisma.prompt.create({
    data: {
      name: data.name,
      description: data.description,
      slug: generateSlug(data.name),
      projectId: params.projectId as string,
    },
  });
  prisma.$disconnect();
  return redirect(`/projects/${params.projectId}/prompts/${prompt.id}`);
}

export default function ProjectDetails() {
  const project: Project | null = useLoaderData<typeof loader>();

  const columns: ColumnDef<Prompt>[] = [
    { header: 'Name', accessorKey: 'name', cell: ({ row }) => <Link to={`/projects/${project?.id}/prompts/${row.original.id}`} className="hover:underline font-medium">{row.original.name}</Link> },
    { header: 'Slug', accessorKey: 'slug' },
    { header: 'Description', accessorKey: 'description' },
    { accessorKey: 'actions', cell: () => (
      <div className="flex justify-end">
        <Button variant="destructive" size="sm" >
          <TrashIcon />
        </Button>
      </div>
    ),
    header: () => <div className="text-right">Actions</div>,
  }];

  return (
  <div className="flex flex-col m-4 container mx-auto gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>{project?.name}</CardTitle>
          <CardDescription>{project?.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex gap-2">
              {project?.apiKeys.map((apiKey) => (
                <div key={apiKey.id}>
                  <div className='text-sm font-medium leading-none'>API Key</div>
                  <div className='text-sm leading-none text-muted-foreground'>
                    {apiKey.key}
                    <Button variant="ghost" size="icon">
                      <CopyIcon />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
      </Card>
      <h1 className="text-2xl font-bold">Prompts</h1>
      <div className="flex justify-end">
        <CreatePromptDialog />
      </div>
      <div className="py-4">
        <DataTable columns={columns} data={project?.prompts ?? []} />
      </div>
    </div>
  );
}
