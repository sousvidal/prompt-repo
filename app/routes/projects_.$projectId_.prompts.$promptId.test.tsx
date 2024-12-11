import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { useNavigate, useParams, useOutletContext, useFetcher, useActionData } from "@remix-run/react";
import { Input } from "~/components/ui/input";
import { SendIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionFunctionArgs } from "@remix-run/node";
import OpenAI from 'openai';

export async function action({ request }: ActionFunctionArgs) {
  const { messages } = await request.json();
  const openai = new OpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
  });

  return Response.json({
    message: response.choices[0].message,
    timestamp: Date.now(),
  });
}

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export default function PromptTest() {
  const context = useOutletContext();
  const params = useParams(); 
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const fetcher = useFetcher();
  const lastDataTimestamp = useRef(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      navigate(`/projects/${params.projectId}/prompts/${params.promptId}`);
    }
  }

  const renderSystemMessage = (message: Message, index: number) => {
    return (
      <div key={index} className="flex flex-col border border-gray-200 rounded-md p-2 bg-gray-100">
        <p className="text-sm text-gray-500">System</p>
        <p>{message.content}</p>
      </div>
    );
  }

  const renderUserMessage = (message: Message, index: number) => {
    return (
      <div key={index} className="flex flex-col border border-gray-200 rounded-md p-2">
        <p className="text-sm text-gray-500 text-right">User</p>
        <p className="text-right">{message.content}</p>
      </div>
    );
  }

  const renderAssistantMessage = (message: Message, index: number) => {
    return (
      <div key={index} className="flex flex-col border border-gray-200 rounded-md p-2 bg-gray-100">
        <p className="text-sm text-gray-500">Assistant</p>
        <p>{message.content}</p>
      </div>
    );
  }

  const renderMessages = (ms: Message[]) => {
    return ms.map((m, index) => {
      switch (m.role) {
        case 'system':
          return renderSystemMessage(m, index);
        case 'user':
          return renderUserMessage(m, index);
        case 'assistant':
          return renderAssistantMessage(m, index);
      }
    });
  }

  const handleSendMessage = useCallback(async () => {
    const newMessages = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    setMessage('');

    fetcher.submit({
      messages: newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }, {
      method: 'POST',
      encType: 'application/json',
    });
  }, [message, messages, fetcher]);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (lastDataTimestamp.current !== fetcher.data.timestamp) {
        console.log(fetcher.data.message);
        setMessages([...messages, fetcher.data.message as Message]);
        lastDataTimestamp.current = fetcher.data.timestamp;
      }
    }
  }, [fetcher.state, fetcher.data, messages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!lastDataTimestamp.current) {
      setMessages([context.message]);
    }
  }, [context.message]);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Prompt</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-4">
          {renderMessages(messages)}
          <div ref={messagesContainerRef}>&nbsp;</div>
        </div>
        <DialogFooter>
          <Input
            type="text"
            placeholder="Enter a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!message}>
            <SendIcon className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
