import { PrismaClient, Project } from '@prisma/client'
import { ActionFunctionArgs } from '@remix-run/node';
import { Link, redirect, useLoaderData } from '@remix-run/react';
import { ColumnDef } from '@tanstack/react-table';
import { TrashIcon } from 'lucide-react';
import CreateProjectDialog from '~/components/create-project-dialog';
import { DataTable } from '~/components/datatable';
import { Button } from '~/components/ui/button';

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/ /g, '-');
}

export async function loader(): Promise<Project[]> {
  const prisma = new PrismaClient();
  const projects = await prisma.project.findMany();
  prisma.$disconnect();
  return projects;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name');
  const description = formData.get('description');

  const prisma = new PrismaClient();
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
  prisma.$disconnect();

  return redirect('/projects');
}

export default function Projects() {
  const projects: Project[] = useLoaderData<typeof loader>();

  const columns: ColumnDef<Project>[] = [
    { header: 'Name', accessorKey: 'name', cell: ({ row }) => <Link to={`/projects/${row.original.id}`} className="hover:underline font-medium">{row.original.name}</Link> },
    { header: 'Slug', accessorKey: 'slug' },
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
    <div className="flex flex-col m-4 container mx-auto">
      <h1 className="text-2xl font-bold">Projects</h1>
      <div className="flex justify-end">
        <CreateProjectDialog />
      </div>
      <div className="py-4">
        <DataTable columns={columns} data={projects} />
      </div>
    </div>
  );
}
