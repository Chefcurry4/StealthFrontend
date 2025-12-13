import { useState } from "react";
import { useEmailDrafts, useCreateEmailDraft, useUpdateEmailDraft, useDeleteEmailDraft } from "@/hooks/useEmailDrafts";
import { useAIEmailDraft } from "@/hooks/useAI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Plus, 
  Trash2, 
  Edit, 
  Sparkles, 
  Copy,
  Check
} from "lucide-react";
import { Loader } from "@/components/Loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const WorkbenchEmailDrafts = () => {
  const { data: drafts, isLoading } = useEmailDrafts();
  const createDraft = useCreateEmailDraft();
  const updateDraft = useUpdateEmailDraft();
  const deleteDraft = useDeleteEmailDraft();
  const aiEmailDraft = useAIEmailDraft();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    recipient: "",
    body: "",
    purpose: "",
    context: "",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerateAI = async () => {
    if (!formData.purpose || !formData.recipient) {
      toast.error("Please enter purpose and recipient for AI generation");
      return;
    }
    
    const result = await aiEmailDraft.mutateAsync({
      purpose: formData.purpose,
      recipient: formData.recipient,
      context: formData.context,
    });

    if (result.subject && result.body) {
      setFormData(prev => ({
        ...prev,
        subject: result.subject,
        body: result.body,
      }));
      toast.success("AI generated email draft!");
    }
  };

  const handleSave = async () => {
    if (!formData.subject || !formData.body) {
      toast.error("Please fill in subject and body");
      return;
    }

    if (editingId) {
      await updateDraft.mutateAsync({
        id: editingId,
        subject: formData.subject,
        recipient: formData.recipient,
        body: formData.body,
      });
    } else {
      await createDraft.mutateAsync({
        subject: formData.subject,
        recipient: formData.recipient,
        body: formData.body,
        aiGenerated: aiEmailDraft.isSuccess,
      });
    }

    setFormData({ subject: "", recipient: "", body: "", purpose: "", context: "" });
    setEditingId(null);
    setIsOpen(false);
    toast.success(editingId ? "Draft updated!" : "Draft saved!");
  };

  const handleEdit = (draft: any) => {
    setEditingId(draft.id);
    setFormData({
      subject: draft.subject || "",
      recipient: draft.recipient || "",
      body: draft.body || "",
      purpose: "",
      context: "",
    });
    setIsOpen(true);
  };

  const handleCopy = async (draft: any) => {
    const text = `Subject: ${draft.subject}\nTo: ${draft.recipient}\n\n${draft.body}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(draft.id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Email Drafts</h3>
        <Badge variant="secondary">{drafts?.length || 0} drafts</Badge>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" onClick={() => {
            setEditingId(null);
            setFormData({ subject: "", recipient: "", body: "", purpose: "", context: "" });
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Draft
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Draft" : "Create Email Draft"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* AI Generation Section */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">AI Generation</span>
                </div>
                <div className="grid gap-3">
                  <div>
                    <Label>Purpose</Label>
                    <Input
                      placeholder="e.g., Request a meeting with professor"
                      value={formData.purpose}
                      onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Additional Context (optional)</Label>
                    <Input
                      placeholder="e.g., About research opportunities in AI"
                      value={formData.context}
                      onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                    />
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={handleGenerateAI}
                    disabled={aiEmailDraft.isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {aiEmailDraft.isPending ? "Generating..." : "Generate with AI"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manual Fields */}
            <div className="space-y-3">
              <div>
                <Label>Recipient</Label>
                <Input
                  placeholder="professor@university.edu"
                  value={formData.recipient}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div>
                <Label>Body</Label>
                <Textarea
                  placeholder="Email content..."
                  rows={8}
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSave}
              disabled={createDraft.isPending || updateDraft.isPending}
            >
              {editingId ? "Update Draft" : "Save Draft"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drafts List */}
      {drafts?.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No drafts yet</p>
      ) : (
        <div className="grid gap-3">
          {drafts?.map((draft) => (
            <Card key={draft.id} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{draft.subject || "No subject"}</h4>
                      {draft.ai_generated && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      To: {draft.recipient || "No recipient"}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {draft.body}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(draft)}>
                      {copiedId === draft.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(draft)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete draft?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this email draft.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteDraft.mutate(draft.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
