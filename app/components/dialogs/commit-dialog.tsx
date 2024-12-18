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
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { CheckIcon } from "lucide-react";

export default function CommitDialog({ isDisabled, onCommit }: { isDisabled: boolean, onCommit: (description: string) => void }) {
  const [description, setDescription] = useState('');

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDescription('');
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isDisabled}>
          <CheckIcon className="w-4 h-4" />
          Commit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex flex-row gap-2 items-center">
            <CheckIcon className="w-4 h-4" />
            Commit
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Commit your changes to the repository.
        </DialogDescription>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="A short description of your changes"
              className="col-span-3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={() => onCommit(description)} disabled={!description || description.length === 0}>Commit</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
