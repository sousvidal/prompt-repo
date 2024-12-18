import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface DiscardChangesDialogProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  title: string;
  description: string;
  text?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DiscardChangesDialog({ onConfirm, onCancel, title, description, text, isOpen, onOpenChange }: DiscardChangesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {description}
        </DialogDescription>
        {text && <div className="text-sm text-gray-500">
          {text}
        </div>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={onConfirm}>Discard</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
