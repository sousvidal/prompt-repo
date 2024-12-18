import { Badge } from '~/components/ui/badge';
import PublishedCircles from '~/components/published-circles';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Commit } from '@prisma/client';

interface CommitSelectorProps {
  selectedCommitId: string;
  onValueChange: (value: string) => void;
  hasDraft: boolean;
  commits: Commit[];
}

export default function CommitSelector({ selectedCommitId, onValueChange, hasDraft, commits }: CommitSelectorProps) {
  return (
    <Select value={selectedCommitId} onValueChange={onValueChange}>
      <SelectTrigger className="w-[350px]">
        <SelectValue placeholder="Select a commit" />
      </SelectTrigger>
      <SelectContent className="max-w-[350px]">
        <SelectGroup>
          <SelectLabel>Commits</SelectLabel>
          {hasDraft && <SelectItem value="draft">Draft</SelectItem>}
          {commits.map((commit) => {
            const isLatest = commit.id === commits[0].id;
            return (
              <SelectItem key={commit.id} value={commit.id} className="truncate">
                <div className="flex flex-row justify-between w-[300px]">
                  <div className="flex gap-2 items-center">
                    {isLatest ? <Badge variant="secondary">Latest</Badge> : ''}
                    {commit.description || commit.id}
                  </div>
                  <div className="flex justify-end items-center">
                    <PublishedCircles publishedCommits={commit.publishedCommits} />
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
} 