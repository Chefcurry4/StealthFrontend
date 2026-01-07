import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Copy, 
  ExternalLink, 
  Check, 
  Edit3, 
  Save, 
  X,
  Mail
} from "lucide-react";
import { toast } from "sonner";

interface EmailResultActionsProps {
  subject: string;
  body: string;
  recipientEmail?: string;
  onUpdate?: (subject: string, body: string) => void;
}

export const EmailResultActions = ({
  subject: initialSubject,
  body: initialBody,
  recipientEmail,
  onUpdate,
}: EmailResultActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState(initialSubject);
  const [editBody, setEditBody] = useState(initialBody);

  const handleCopy = async () => {
    try {
      // Copy only the email content (subject + body)
      const emailContent = `Subject: ${initialSubject}\n\n${initialBody}`;
      await navigator.clipboard.writeText(emailContent);
      setCopied(true);
      toast.success("Email copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy email");
    }
  };

  const handleOpenInEmailClient = () => {
    // Create mailto link with subject and body
    const mailtoSubject = encodeURIComponent(initialSubject);
    const mailtoBody = encodeURIComponent(initialBody);
    const recipient = recipientEmail ? encodeURIComponent(recipientEmail) : "";
    
    const mailtoLink = `mailto:${recipient}?subject=${mailtoSubject}&body=${mailtoBody}`;
    window.open(mailtoLink, "_blank");
  };

  const handleSaveEdit = () => {
    onUpdate?.(editSubject, editBody);
    setIsEditing(false);
    toast.success("Email updated!");
  };

  const handleCancelEdit = () => {
    setEditSubject(initialSubject);
    setEditBody(initialBody);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              Edit Email
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="h-8"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Body</label>
            <Textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="min-h-[200px] bg-background/50 resize-y"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-500" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy Email
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenInEmailClient}
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        Open in Email Client
        <ExternalLink className="h-3 w-3" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2"
      >
        <Edit3 className="h-4 w-4" />
        Edit Email
      </Button>
    </div>
  );
};
