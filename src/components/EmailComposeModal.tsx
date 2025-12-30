import { useState, useEffect, useRef } from "react";
import { useTeachers, Teacher } from "@/hooks/useTeachers";
import { useAIEmailDraft } from "@/hooks/useAI";
import { useCreateEmailDraft } from "@/hooks/useEmailDrafts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Sparkles, 
  Send, 
  Save, 
  Loader2, 
  Mail, 
  User, 
  FileText,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailComposeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailSent?: () => void;
}

export function EmailComposeModal({ open, onOpenChange, onEmailSent }: EmailComposeModalProps) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [showProfessorSuggestions, setShowProfessorSuggestions] = useState(false);
  const [professorSearchQuery, setProfessorSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  
  const recipientInputRef = useRef<HTMLInputElement>(null);
  
  const { data: teachers } = useTeachers(professorSearchQuery);
  const generateAI = useAIEmailDraft();
  const createDraft = useCreateEmailDraft();
  
  // Filter teachers that match the search
  const matchingTeachers = teachers?.filter(t => 
    t.full_name?.toLowerCase().includes(recipient.toLowerCase()) ||
    t.name?.toLowerCase().includes(recipient.toLowerCase()) ||
    t.email?.toLowerCase().includes(recipient.toLowerCase())
  ).slice(0, 5) || [];

  // Show suggestions when typing in recipient field
  useEffect(() => {
    if (recipient.length >= 2 && matchingTeachers.length > 0) {
      setShowProfessorSuggestions(true);
    } else {
      setShowProfessorSuggestions(false);
    }
  }, [recipient, matchingTeachers.length]);

  const handleSelectProfessor = (teacher: Teacher) => {
    if (teacher.email) {
      setRecipient(teacher.email);
    } else {
      setRecipient(teacher.full_name || teacher.name || "");
    }
    setShowProfessorSuggestions(false);
  };

  const handleGenerateAI = async () => {
    if (!purpose.trim()) {
      toast.error("Please specify the purpose of the email");
      return;
    }

    try {
      const result = await generateAI.mutateAsync({
        purpose,
        recipient: recipient || "Professor",
        context: context || undefined,
      });

      if (result.subject) setSubject(result.subject);
      if (result.body) setBody(result.body);
      toast.success("Email generated successfully!");
    } catch (error) {
      toast.error("Failed to generate email");
    }
  };

  const handleSaveDraft = async () => {
    try {
      await createDraft.mutateAsync({
        recipient,
        subject,
        body,
        aiGenerated: generateAI.isSuccess,
      });
      toast.success("Draft saved!");
    } catch (error) {
      toast.error("Failed to save draft");
    }
  };

  const handleSendEmail = () => {
    if (!recipient.trim()) {
      toast.error("Please enter a recipient");
      return;
    }
    
    // Open email client with the composed email
    const mailtoLink = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    
    toast.success("Opening email client...");
    onEmailSent?.();
  };

  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Email body copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleClose = () => {
    setRecipient("");
    setSubject("");
    setBody("");
    setPurpose("");
    setContext("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Compose Email
          </DialogTitle>
          <DialogDescription>
            Write an email with AI assistance. Start typing a professor's name to auto-fill their email.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {/* AI Generation Section */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI Email Generation
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="purpose" className="text-xs text-muted-foreground">
                    What is the purpose of this email?
                  </Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Request for thesis supervision, Ask about course requirements..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="context" className="text-xs text-muted-foreground">
                    Additional context (optional)
                  </Label>
                  <Textarea
                    id="context"
                    placeholder="e.g., I'm a Master's student interested in machine learning..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="mt-1 min-h-[60px] resize-none"
                  />
                </div>
                
                <Button 
                  onClick={handleGenerateAI}
                  disabled={generateAI.isPending || !purpose.trim()}
                  className="w-full gap-2"
                  variant="outline"
                >
                  {generateAI.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Email Fields */}
            <div className="space-y-4">
              {/* Recipient with autocomplete */}
              <div className="relative">
                <Label htmlFor="recipient" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  To
                </Label>
                <Input
                  ref={recipientInputRef}
                  id="recipient"
                  placeholder="Start typing professor's name or email..."
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    setProfessorSearchQuery(e.target.value);
                  }}
                  onFocus={() => {
                    if (recipient.length >= 2 && matchingTeachers.length > 0) {
                      setShowProfessorSuggestions(true);
                    }
                  }}
                  className="mt-1"
                />
                
                {/* Professor suggestions dropdown */}
                {showProfessorSuggestions && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                    <div className="p-1.5 text-xs text-muted-foreground border-b border-border/50">
                      Professors matching "{recipient}"
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {matchingTeachers.map((teacher) => (
                        <button
                          key={teacher.id_teacher}
                          onClick={() => handleSelectProfessor(teacher)}
                          className="w-full flex items-center gap-3 p-2.5 hover:bg-accent/50 transition-colors text-left"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {teacher.full_name || teacher.name}
                            </p>
                            {teacher.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {teacher.email}
                              </p>
                            )}
                          </div>
                          {teacher.email && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              Email available
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="subject" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">Email Body</Label>
                  {body && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyBody}
                      className="h-6 text-xs gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <Textarea
                  id="body"
                  placeholder="Write your email here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1 min-h-[200px] resize-none"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={createDraft.isPending || (!subject && !body)}
            className="gap-2"
          >
            {createDraft.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>
          
          <div className="flex-1" />
          
          <Button
            onClick={handleSendEmail}
            disabled={!recipient.trim()}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Email Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
