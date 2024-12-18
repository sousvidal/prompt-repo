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

export default function DeleteDialog({ itemId, itemName, itemType }: { itemId: string, itemName: string, itemType: string }) {
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
          <DialogTitle>Delete {itemType}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete <span className="font-bold">{itemName}</span>?
        </DialogDescription>
        <Form method="delete">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 text-sm">
              <input type="hidden" name="itemId" value={itemId} />
              Type <span className="font-bold">{itemName}</span> to confirm.
            </div>
            <Input
              id="confirm"
              name="confirm"
              placeholder="Type the item name to confirm"
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
              <Button type="submit" variant="destructive" disabled={confirm !== itemName}>Delete</Button>
            </DialogClose>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
