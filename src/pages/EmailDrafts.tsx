import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailDrafts, useCreateEmailDraft, useUpdateEmailDraft, useDeleteEmailDraft } from "@/hooks/useEmailDrafts";
import { useAIEmailDraft } from "@/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Plus, Trash2, Edit2, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const EmailDrafts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: drafts, isLoading } = useEmailDrafts();
  const createDraft = useCreateEmailDraft();
  const updateDraft = useUpdateEmailDraft();
  const deleteDraft = useDeleteEmailDraft();
  const aiDraft = useAIEmailDraft();

  const [isNewDraftOpen, setIsNewDraftOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<any>(null);
  
  // New draft form
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleGenerateAIDraft = async () => {
    if (!purpose || !recipient) {
      toast.error("Please provide purpose and recipient");
      return;
    }

    try {
      const response = await aiDraft.mutateAsync({ purpose, recipient, context });
      setSubject(response.subject);
      setBody(response.body);
      toast.success("AI draft generated!");
    } catch (error) {
      toast.error("Failed to generate draft");
    }
  };

  const handleSaveDraft = async () => {
    if (!subject || !body || !recipient) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingDraft) {
        await updateDraft.mutateAsync({
          id: editingDraft.id,
          subject,
          body,
          recipient,
        });
        toast.success("Draft updated!");
        setEditingDraft(null);
      } else {
        await createDraft.mutateAsync({
          subject,
          body,
          recipient,
          aiGenerated: !!purpose,
        });
        toast.success("Draft saved!");
      }
      
      // Reset form
      setPurpose("");
      setRecipient("");
      setContext("");
      setSubject("");
      setBody("");
      setIsNewDraftOpen(false);
    } catch (error) {
      toast.error("Failed to save draft");
    }
  };

  const handleEditDraft = (draft: any) => {
    setEditingDraft(draft);
    setSubject(draft.subject || "");
    setBody(draft.body || "");
    setRecipient(draft.recipient || "");
    setIsNewDraftOpen(true);
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await deleteDraft.mutateAsync(id);
      toast.success("Draft deleted");
    } catch (error) {
      toast.error("Failed to delete draft");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Email Drafts</h1>
        <Dialog open={isNewDraftOpen} onOpenChange={setIsNewDraftOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Draft
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDraft ? "Edit Draft" : "Create New Draft"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Draft Generator
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Request professor recommendation"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-recipient">Recipient</Label>
                  <Input
                    id="ai-recipient"
                    placeholder="e.g., Professor Smith"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="context">Additional Context (Optional)</Label>
                  <Textarea
                    id="context"
                    placeholder="Any relevant details..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGenerateAIDraft}
                  disabled={aiDraft.isPending}
                  className="w-full"
                >
                  {aiDraft.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  placeholder="Email body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveDraft} className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewDraftOpen(false);
                    setEditingDraft(null);
                    setPurpose("");
                    setRecipient("");
                    setContext("");
                    setSubject("");
                    setBody("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !drafts || drafts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No email drafts yet. Create your first draft!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft: any) => (
            <Card key={draft.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{draft.subject || "Untitled Draft"}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      To: {draft.recipient}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditDraft(draft)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDraft(draft.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{draft.body?.substring(0, 200)}...</p>
                {draft.ai_generated && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Generated</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailDrafts;
