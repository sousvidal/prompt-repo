import { Project } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Link, redirect, useLoaderData } from '@remix-run/react';
import { ColumnDef } from '@tanstack/react-table';
import CreateProjectDialog from '~/components/dialogs/create-project-dialog';
import { DataTable } from '~/components/datatable';
import { Breadcrumbs } from '~/components/breadcrumbs';
import { redirectToLoginIfNotAuthenticated } from '~/services/auth.server';
import DeleteDialog from '~/components/dialogs/delete-dialog';
import { createProject, deleteProject, getProjects, ProjectFormData } from '~/services/project.server';

export async function loader({ request }: LoaderFunctionArgs): Promise<Project[]> {
  await redirectToLoginIfNotAuthenticated(request);
  return getProjects();
}

export async function action({ request }: ActionFunctionArgs) {
  await redirectToLoginIfNotAuthenticated(request);

  const formData = await request.formData();
  if (request.method === 'DELETE') {
    const projectId = formData.get('itemId') as string;
    await deleteProject(projectId);
    return redirect('/projects');
  } else {
    const data = Object.fromEntries(formData) as ProjectFormData;
    const project = await createProject(data);
    return redirect(`/projects/${project.id}`);
  }
}

export default function Projects() {
  const projects: Project[] = useLoaderData<typeof loader>();

  const columns: ColumnDef<Project>[] = [
    { header: 'Name', accessorKey: 'name', cell: ({ row }) => <Link to={`/projects/${row.original.id}`} className="hover:underline font-medium">{row.original.name}</Link> },
    { header: 'Slug', accessorKey: 'slug' },
    { accessorKey: 'actions', cell: ({ row }) => (
      <div className="flex justify-end">
        <DeleteDialog itemId={row.original.id} itemName={row.original.name} itemType="Project" />
      </div>
    ),
    header: () => <div className="text-right">Actions</div>,
  }];

  return (
    <div className="flex flex-col m-4 container mx-auto">
      <Breadcrumbs />
      <div className="flex justify-end">
        <CreateProjectDialog />
      </div>
      <div className="py-4">
        <DataTable columns={columns} data={projects} />
      </div>
    </div>
  );
}
