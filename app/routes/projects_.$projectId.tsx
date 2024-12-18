import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { redirect, useActionData, useLoaderData } from '@remix-run/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { redirectToLoginIfNotAuthenticated } from '~/services/auth.server';
import { toast } from 'sonner';
import { createPrompt, deletePrompt, PromptFormData } from '~/services/prompt.server';
import { getProject } from '~/services/project.server';
import ApiKeys from "~/components/projects/api-keys";
import PromptsTable from "~/components/projects/prompts-table";
import { useEffect } from 'react';
import { Breadcrumbs } from '~/components/breadcrumbs';

export async function loader({ params, request }: LoaderFunctionArgs) {
  await redirectToLoginIfNotAuthenticated(request); 
  return getProject(params.projectId as string);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await redirectToLoginIfNotAuthenticated(request);
  const projectId = params.projectId!;

  try {
    const formData = await request.formData();
    if (request.method === 'DELETE') {
      const promptId = formData.get('itemId') as string;
      await deletePrompt(promptId);
      return redirect(`/projects/${projectId}`);
    } else {
      const data = Object.fromEntries(formData) as PromptFormData;
      const prompt = await createPrompt(data, projectId as string);
      return redirect(`/projects/${projectId}/prompts/${prompt.id}`);
    }
  } catch (error) {
    return Response.json({ error: `Failed to create prompt. Error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export default function ProjectDetails() {
  const project = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="flex flex-col m-4 container mx-auto gap-4">
      <Breadcrumbs replace={{
        [project!.id]: project!.name,
      }} />
      <Card>
        <CardHeader>
          <CardTitle>{project?.name}</CardTitle>
          <CardDescription>{project?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeys apiKeys={project?.apiKeys ?? []} />
        </CardContent>
      </Card>

      <PromptsTable project={project!} prompts={project?.prompts ?? []} />
    </div>
  );
}
