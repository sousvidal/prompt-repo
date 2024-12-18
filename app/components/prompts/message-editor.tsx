import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface MessageEditorProps {
  message: {
    role?: string;
    content?: string;
  };
  onRoleChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export default function MessageEditor({ message, onRoleChange, onContentChange }: MessageEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Message</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Select
            value={message?.role}
            onValueChange={onRoleChange}>
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
            className="h-[300px]"
            value={message?.content}
            onChange={(e) => onContentChange(e.target.value)} />
        </div>
      </CardContent>
    </Card>
  );
} 