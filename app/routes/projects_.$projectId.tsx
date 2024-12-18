import { Project, PrismaClient, Prompt } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Link, redirect, useActionData, useLoaderData } from '@remix-run/react';
import { CopyIcon } from 'lucide-react';
import { DataTable } from '~/components/datatable';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import CreatePromptDialog from '~/components/dialogs/create-prompt-dialog';
import { generateSlug } from '~/lib/slug';
import { ColumnDef } from '@tanstack/react-table';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { redirectToLoginIfNotAuthenticated } from '~/services/auth.server';
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import DeleteDialog from '~/components/dialogs/delete-dialog';

type PromptFormData = {
  name: string;
  description: string;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  await redirectToLoginIfNotAuthenticated(request); 

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
  try {
    const prisma = new PrismaClient();
    const formData = await request.formData();
    let promptId: string | null = null;

    if (request.method === 'DELETE') {
      promptId = formData.get('promptId') as string;
      // TODO: implement cascade delete
    } else {
      const data = Object.fromEntries(formData) as PromptFormData;
      const prompt = await prisma.prompt.create({
        data: {
          name: data.name,
          description: data.description,
          slug: generateSlug(data.name),
          projectId: params.projectId as string,
        },
      });
      promptId = prompt.id;
    }
    prisma.$disconnect();
    return redirect(`/projects/${params.projectId}/prompts/${promptId}`);
  } catch (error) {
    return Response.json({ error: `Failed to create prompt. Error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export default function ProjectDetails() {
  const project: Project | null = useLoaderData<typeof loader>();
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  useEffect(() => {
    if (copiedText) {
      toast.success('Copied to clipboard');
    }
  }, [copiedText]);

  const columns: ColumnDef<Prompt>[] = [
    { header: 'Name', accessorKey: 'name', cell: ({ row }) => <Link to={`/projects/${project?.id}/prompts/${row.original.id}`} className="hover:underline font-medium">{row.original.name}</Link> },
    { header: 'Slug', accessorKey: 'slug' },
    { header: 'Description', accessorKey: 'description' },
    { accessorKey: 'actions', cell: ({ row }) => (
      <div className="flex justify-end">
        <DeleteDialog itemId={row.original.id} itemName={row.original.name} itemType="Prompt" />
      </div>
    ),
    header: () => <div className="text-right">Actions</div>,
  }];

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
  }, [copyToClipboard]);

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
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(apiKey.key)}>
                      <CopyIcon />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
      </Card>
      <div className="flex flex-row justify-between items-center mt-4">
        <div className="text-2xl font-bold">
          Prompts
        </div>
        <div className="flex justify-end">
          <CreatePromptDialog />
        </div>
      </div>
      <div className="py-4">
        <DataTable columns={columns} data={project?.prompts ?? []} />
      </div>
    </div>
  );
}
