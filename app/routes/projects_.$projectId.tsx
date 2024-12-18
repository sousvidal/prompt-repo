import { Project, Prompt } from '@prisma/client'
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
import { ColumnDef } from '@tanstack/react-table';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { redirectToLoginIfNotAuthenticated } from '~/services/auth.server';
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import DeleteDialog from '~/components/dialogs/delete-dialog';
import { createPrompt, deletePrompt, PromptFormData } from '~/services/prompt.server';
import { getProject } from '~/services/project.server';

export async function loader({ params, request }: LoaderFunctionArgs) {
  await redirectToLoginIfNotAuthenticated(request); 
  return getProject(params.projectId as string);
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    if (request.method === 'DELETE') {
      const promptId = formData.get('itemId') as string;
      await deletePrompt(promptId);
      return redirect(`/projects/${params.projectId}`);
    } else {
      const data = Object.fromEntries(formData) as PromptFormData;
      const prompt = await createPrompt(data, params.projectId as string);
      return redirect(`/projects/${params.projectId}/prompts/${prompt.id}`);
    }
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
