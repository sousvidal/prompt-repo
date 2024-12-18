import { Button } from "~/components/ui/button";
import { CopyIcon } from "lucide-react";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { APIKey } from "@prisma/client";

interface ApiKeysProps {
  apiKeys: APIKey[];
}

export default function ApiKeys({ apiKeys }: ApiKeysProps) {
  const [copiedText, copyToClipboard] = useCopyToClipboard();

  useEffect(() => {
    if (copiedText) {
      toast.success('Copied to clipboard');
    }
  }, [copiedText]);

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
  }, [copyToClipboard]);

  return (
    <div className="flex gap-2">
      {apiKeys.map((apiKey) => (
        <div key={apiKey.id}>
          <div className='text-sm font-medium leading-none'>API Key</div>
          <div className='text-sm leading-none text-muted-foreground'>
            {apiKey.key}
            <Button variant="ghost" size="icon" onClick={() => handleCopy(apiKey.key)}>
              <CopyIcon />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 