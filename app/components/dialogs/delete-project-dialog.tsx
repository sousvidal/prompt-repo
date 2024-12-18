import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { TrashIcon } from "lucide-react";
import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input";
import { useState } from "react";

export default function DeleteProjectDialog({ projectId, projectName }: { projectId: string, projectName: string }) {
  const [confirm, setConfirm] = useState('');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <TrashIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete <span className="font-bold">{projectName}</span>?
        </DialogDescription>
        <Form method="delete">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 text-sm">
              <input type="hidden" name="projectId" value={projectId} />
              Type <span className="font-bold">{projectName}</span> to confirm.
            </div>
            <Input
              id="confirm"
              name="confirm"
              placeholder="Type the project name to confirm"
              className="col-span-3"
              required
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" variant="destructive" disabled={confirm !== projectName}>Delete</Button>
            </DialogClose>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
