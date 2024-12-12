import { PrismaClient, Prompt } from '@prisma/client'
import { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData, useNavigate, useParams, useSearchParams } from '@remix-run/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import DiscardChangesDialog from "~/components/discard-changes-dialog";
import { useCallback, useEffect, useState } from 'react';
import TestPromptDialog from '~/components/test-prompt-dialog';
import CommitDialog from '~/components/commit-dialog';
import PublishDialog from '~/components/publish-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { Badge } from '~/components/ui/badge';
import { toast } from 'sonner';
import { Circle, PlayIcon } from 'lucide-react';
import PublishedCircles from '~/components/published-circles';

export async function loader({ params }: LoaderFunctionArgs) {
  const prisma = new PrismaClient();
  const prompt = await prisma.prompt.findUnique({
    where: { id: params.promptId },
    include: {
      commits: {
        include: {
          messages: true,
          publishedCommits: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      project: true,
    }
  });
  prisma.$disconnect();
  return prompt;
}

export default function PromptDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const prompt: Prompt | null = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCommitId, setSelectedCommitId] = useState<string>(searchParams.get('commit') || 'draft');
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  const [draft, setDraft] = useState({
    role: 'system',
    content: '',
    description: '',
  });

  const [dialog, setDialog] = useState<{
    onConfirm?: () => void;
    onCancel?: () => void;
    isOpen: boolean;
  } | null>(null);

  useEffect(() => {
    if (prompt || (prompt && searchParams.get('commit'))) {
      if (searchParams.get('commit')) {
        const commit = prompt?.commits.find(commit => commit.id === searchParams.get('commit'));
        if (commit) {
          setSelectedCommitId(commit.id);
        } else {
          setSelectedCommitId('draft');
        }
      } else {
        const commits = prompt?.commits || [];
        const selectedCommitId = commits.length > 0 ? commits[0].id : 'draft';
        setSelectedCommitId(selectedCommitId);
      }
    }
  }, [prompt, searchParams]);

  const getCommit = (commitId: string) => {
    return prompt?.commits.find(commit => commit.id === commitId);
  }

  const canPublish = selectedCommitId !== 'draft' && selectedCommitId !== null;
  const canCommit = selectedCommitId === 'draft' && draft.content !== '';
  const hasDraft = draft.content !== '' || prompt?.commits.length === 0 || selectedCommitId === 'draft';
  const message = selectedCommitId === 'draft' ? draft : getCommit(selectedCommitId)?.messages[0];
  const canTest = message?.role && message?.content;

  const handleCommit = async (description: string) => {
    const response = await fetch(`/api/projects/${params.projectId}/prompts/${params.promptId}/commits`, {
      method: 'POST',
      body: JSON.stringify({
        ...draft,
        description,
      }),
    });
    const commit = await response.json();

    // empty the draft
    setDraft({
      role: 'system',
      content: '',
      description: '',
    });

    // refresh the page
    navigate({
      pathname: '.',
      search: `?commit=${commit.id}`,
    });

    // toast
    toast.success('Commit saved successfully.');
  }

  const showDialog = (onConfirm: () => void) => {
    setDialog({
      onConfirm,
      isOpen: true,
    });
  }

  const handleCommitValueChange = useCallback((value: string) => {
    setSelectedCommitId(value);
    setSearchParams({ commit: value });
  }, [setSelectedCommitId, setSearchParams]);

  const handleEditDraft = useCallback((key: string, value: string) => {
    const editDraft = () => {
      setDraft({
        ...draft,
        [key]: value
      });
      handleCommitValueChange('draft');
    }

    // if we already have a draft, we need to confirm the user wants to discard it
    if (draft.content && selectedCommitId !== 'draft') {
      showDialog(editDraft);
    } else {
      editDraft();
    }
  }, [draft, selectedCommitId, handleCommitValueChange]);

  const handleTest = () => {
    setIsTestDialogOpen(true);
  }

  const handlePublish = useCallback(async (environments: string[]) => {
    await fetch(`/api/projects/${params.projectId}/prompts/${params.promptId}/commits/${selectedCommitId}/publish`, {
      method: 'POST',
      body: JSON.stringify({
        environments,
      }),
    });

    // refresh the page
    navigate({
      pathname: '.',
      search: `?commit=${selectedCommitId}`,
    });

    // toast
    toast.success('Published successfully.');
  }, [params.projectId, params.promptId, selectedCommitId, navigate]);

  return (
    <div className="flex flex-col m-4 container mx-auto gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${params.projectId}`}>{prompt?.project.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{prompt?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>{prompt?.name}</CardTitle>
          <CardDescription>{prompt?.description}</CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-row justify-between mt-4">
        <div className="flex flex-row gap-2">
          <Select defaultValue="draft" value={selectedCommitId} onValueChange={handleCommitValueChange}>
            <SelectTrigger className="w-[350px]">
              <SelectValue placeholder="Select a commit" />
            </SelectTrigger>
            <SelectContent className="max-w-[350px]">
              <SelectGroup>
                <SelectLabel>Commits</SelectLabel>
                {hasDraft && <SelectItem value="draft">Draft</SelectItem>}
                {prompt?.commits.map((commit) => {
                  const isLatest = commit.id === prompt.commits[0].id;
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
        </div>
        <div className="flex flex-row gap-2 justify-end">
          <Button variant="outline" disabled={!canTest} onClick={handleTest}>
            <PlayIcon className="w-4 h-4" />
            Test
          </Button>
          <CommitDialog isDisabled={!canCommit} onCommit={handleCommit} />
          <PublishDialog isDisabled={!canPublish} onPublish={handlePublish} commit={getCommit(selectedCommitId)} /> 
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Select
              defaultValue={'system'}
              value={message?.role}
              onValueChange={(value) => handleEditDraft('role', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="user">User</SelectItem>
               </SelectGroup>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Message"
              className="h-[200px]"
              value={message?.content}
              onChange={(e) => handleEditDraft('content', e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <DiscardChangesDialog
        onConfirm={dialog?.onConfirm}
        onCancel={dialog?.onCancel}
        onOpenChange={(open) => setDialog({ ...dialog, isOpen: open })}
        title="Discard changes"
        description="Are you sure you want to discard the changes to your current draft?"
        isOpen={dialog?.isOpen || false}
      />
      <TestPromptDialog
        context={{
          message,
        }}
        isOpen={isTestDialogOpen}
        onClose={() => setIsTestDialogOpen(false)}
      />
      <Outlet context={{
        message,
      }} />
    </div>
  );
}
