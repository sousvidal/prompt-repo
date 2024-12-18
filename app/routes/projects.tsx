import { PrismaClient, Project } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Link, redirect, useLoaderData } from '@remix-run/react';
import { ColumnDef } from '@tanstack/react-table';
import CreateProjectDialog from '~/components/dialogs/create-project-dialog';
import { DataTable } from '~/components/datatable';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { redirectToLoginIfNotAuthenticated } from '~/services/auth.server';
import DeleteDialog from '~/components/dialogs/delete-dialog';

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/ /g, '-');
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Project[]> {
  await redirectToLoginIfNotAuthenticated(request);

  const prisma = new PrismaClient();
  const projects = await prisma.project.findMany();
  prisma.$disconnect();
  return projects;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const prisma = new PrismaClient();

  if (request.method === 'DELETE') {
    // TODO: implement cascade delete
    const projectId = formData.get('itemId') as string;
    console.log('delete projectId', projectId);
  } else {
    const name = formData.get('name');
    const description = formData.get('description');
    await prisma.project.create({
      data: {
        name: name as string,
        description: description as string,
        slug: generateSlug(name as string),
        apiKeys: {
          create: {
            key: crypto.randomUUID(),
          },
        },
      },
    });
  }

  prisma.$disconnect();
  return redirect('/projects');
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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex justify-end">
        <CreateProjectDialog />
      </div>
      <div className="py-4">
        <DataTable columns={columns} data={projects} />
      </div>
    </div>
  );
}
