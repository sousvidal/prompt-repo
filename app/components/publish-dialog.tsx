import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";


export default function PublishDialog({ isDisabled, onPublish }: { isDisabled: boolean, onPublish: (environments: string[]) => void }) {
  const [environments, setEnvironments] = useState<string[]>([]);
  
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEnvironments([]);
    }
  }

  const handleCheckboxChange = (environment: string) => {
    setEnvironments(prevEnvironments => {
      if (prevEnvironments.includes(environment)) {
        return prevEnvironments.filter(env => env !== environment);
      }
      return [...prevEnvironments, environment];
    });
  }

  const renderCheckbox = (environment: string) => {
    return (
      <div className="flex flex-row gap-2">
        <Checkbox
          id={environment}
          value={environment}
          checked={environments.includes(environment)}
          onCheckedChange={() => handleCheckboxChange(environment)}
        />
        <label htmlFor={environment} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {`${environment.charAt(0).toUpperCase()}${environment.slice(1)}`}
        </label>
      </div>
    )
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isDisabled}>
          Publish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Publish this commit to an environment.
        </DialogDescription>
        <div className="grid gap-4 py-4">
          {renderCheckbox('local')}
          {renderCheckbox('acceptance')}
          {renderCheckbox('production')}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={environments.length === 0}
              onClick={() => onPublish(environments)}
            >
              Publish
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
