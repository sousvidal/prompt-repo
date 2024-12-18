import { Prompt, Project } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";
import { DataTable } from "~/components/datatable";
import DeleteDialog from "~/components/dialogs/delete-dialog";
import CreatePromptDialog from "~/components/dialogs/create-prompt-dialog";

interface PromptsTableProps {
  project: Project;
  prompts: Prompt[];
}

export default function PromptsTable({ project, prompts }: PromptsTableProps) {
  const columns: ColumnDef<Prompt>[] = [
    { 
      header: 'Name', 
      accessorKey: 'name', 
      cell: ({ row }) => (
        <Link 
          to={`/projects/${project.id}/prompts/${row.original.id}`} 
          className="hover:underline font-medium"
        >
          {row.original.name}
        </Link>
      ) 
    },
    { header: 'Slug', accessorKey: 'slug' },
    { header: 'Description', accessorKey: 'description' },
    { 
      accessorKey: 'actions', 
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DeleteDialog 
            itemId={row.original.id} 
            itemName={row.original.name} 
            itemType="Prompt" 
          />
        </div>
      ),
      header: () => <div className="text-right">Actions</div>,
    }
  ];

  return (
    <>
      <div className="flex flex-row justify-between items-center mt-4">
        <div className="text-2xl font-bold">
          Prompts
        </div>
        <div className="flex justify-end">
          <CreatePromptDialog />
        </div>
      </div>
      <div className="py-4">
        <DataTable columns={columns} data={prompts} />
      </div>
    </>
  );
} 