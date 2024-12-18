import { Prompt } from '@prisma/client'
import { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigate, useParams, useSearchParams } from '@remix-run/react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import DiscardChangesDialog from "~/components/dialogs/discard-changes-dialog";
import { useCallback, useEffect, useState } from 'react';
import TestPromptDialog from '~/components/dialogs/test-prompt-dialog';
import CommitDialog from '~/components/dialogs/commit-dialog';
import PublishDialog from '~/components/dialogs/publish-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { toast } from 'sonner';
import { PlayIcon } from 'lucide-react';
import { redirectToLoginIfNotAuthenticated } from '~/services/auth.server';
import { getPrompt } from '~/services/prompt.server';
import CommitSelector from '~/components/prompts/commit-selector';
import MessageEditor from '~/components/prompts/message-editor';

export async function loader({ params, request }: LoaderFunctionArgs) {
  await redirectToLoginIfNotAuthenticated(request);
  return getPrompt(params.promptId as string);
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
    try {
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
    } catch (error) {
      return Response.json({ error: `Failed to commit. Error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
    }
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
    try {
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
    } catch (error) {
      return Response.json({ error: `Failed to publish. Error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
    }
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
          <CommitSelector
            selectedCommitId={selectedCommitId}
            onValueChange={handleCommitValueChange}
            hasDraft={hasDraft}
            commits={prompt?.commits || []}
          />
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

      <MessageEditor
        message={message}
        onRoleChange={(value) => handleEditDraft('role', value)}
        onContentChange={(value) => handleEditDraft('content', value)}
      />

      <DiscardChangesDialog
        onConfirm={dialog?.onConfirm}
        onCancel={dialog?.onCancel}
        onOpenChange={(open) => setDialog({ ...dialog, isOpen: open })}
        title="Discard changes"
        description="Are you sure you want to discard the changes to your current draft?"
        isOpen={dialog?.isOpen || false}
      />
      
      <TestPromptDialog
        context={{ message }}
        isOpen={isTestDialogOpen}
        onClose={() => setIsTestDialogOpen(false)}
      />
    </div>
  );
}
