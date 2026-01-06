import { useState, useEffect, useRef, useMemo } from "react";
import { useTeachers, Teacher } from "@/hooks/useTeachers";
import { useAIEmailDraft } from "@/hooks/useAI";
import { useCreateEmailDraft } from "@/hooks/useEmailDrafts";
import { useSavedCourses } from "@/hooks/useSavedItems";
import { useSavedLabs } from "@/hooks/useSavedItems";
import { useUserDocuments } from "@/hooks/useUserDocuments";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Sparkles, 
  Save, 
  Loader2, 
  Mail, 
  User, 
  FileText,
  ExternalLink,
  Copy,
  Check,
  Search,
  X,
  BookOpen,
  FlaskConical,
  File,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailComposeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailSent?: () => void;
}

const AI_MODELS = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast & efficient" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "High quality" },
  { id: "openai/gpt-4.1-mini", name: "GPT-4.1 Mini", description: "Balanced" },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", description: "Creative" },
];

export function EmailComposeModal({ open, onOpenChange, onEmailSent }: EmailComposeModalProps) {
  const [recipient, setRecipient] = useState("");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<Teacher | null>(null);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  
  const recipientInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { data: allTeachers, isLoading: isLoadingTeachers } = useTeachers();
  const { data: savedCourses } = useSavedCourses();
  const { data: savedLabs } = useSavedLabs();
  const { data: userDocuments } = useUserDocuments();
  const generateAI = useAIEmailDraft();
  const createDraft = useCreateEmailDraft();

  // Smart matching - search through all teachers client-side
  const matchingTeachers = useMemo(() => {
    if (!allTeachers || recipientSearch.length < 2) return [];
    
    const searchLower = recipientSearch.toLowerCase();
    
    return allTeachers
      .filter(t => 
        t.full_name?.toLowerCase().includes(searchLower) ||
        t.name?.toLowerCase().includes(searchLower) ||
        t.email?.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => {
        const aName = (a.full_name || a.name || "").toLowerCase();
        const bName = (b.full_name || b.name || "").toLowerCase();
        const aStarts = aName.startsWith(searchLower);
        const bStarts = bName.startsWith(searchLower);
        if (aStarts && !bStarts) return -1;
        if (bStarts && !aStarts) return 1;
        return aName.localeCompare(bName);
      })
      .slice(0, 8);
  }, [allTeachers, recipientSearch]);

  useEffect(() => {
    if (recipientSearch.length >= 2 && matchingTeachers.length > 0 && !selectedProfessor) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [recipientSearch, matchingTeachers.length, selectedProfessor]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          recipientInputRef.current && !recipientInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProfessor = (teacher: Teacher) => {
    setSelectedProfessor(teacher);
    setRecipient(teacher.email || "");
    setRecipientSearch(teacher.full_name || teacher.name || "");
    setShowSuggestions(false);
  };

  const handleClearProfessor = () => {
    setSelectedProfessor(null);
    setRecipient("");
    setRecipientSearch("");
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const toggleLab = (labId: string) => {
    setSelectedLabs(prev => 
      prev.includes(labId) ? prev.filter(id => id !== labId) : [...prev, labId]
    );
  };

  const toggleDoc = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleGenerateAI = async () => {
    if (!purpose.trim()) {
      toast.error("Please specify the purpose of the email");
      return;
    }

    try {
      const recipientName = selectedProfessor?.full_name || selectedProfessor?.name || recipient || "Professor";
      
      // Get selected items data - savedCourses/Labs have nested Courses/Labs objects
      const coursesData = savedCourses?.filter(c => selectedCourses.includes(c.course_id || '')).map(c => c.Courses) || [];
      const labsData = savedLabs?.filter(l => selectedLabs.includes(l.lab_id || '')).map(l => l.Labs) || [];
      const docsData = userDocuments?.filter(d => selectedDocs.includes(d.id)) || [];
      
      const result = await generateAI.mutateAsync({
        purpose,
        recipient: recipientName,
        context: context || undefined,
        model: selectedModel,
        savedCourses: coursesData.length > 0 ? coursesData : undefined,
        savedLabs: labsData.length > 0 ? labsData : undefined,
        documents: docsData.length > 0 ? docsData : undefined,
        teacherInfo: selectedProfessor || undefined,
      });

      if (result.subject) setSubject(result.subject);
      if (result.body) setBody(result.body);
      toast.success("Email generated successfully!");
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to generate email";
      toast.error(errorMsg);
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
    setRecipientSearch("");
    setSubject("");
    setBody("");
    setPurpose("");
    setContext("");
    setSelectedProfessor(null);
    setSelectedCourses([]);
    setSelectedLabs([]);
    setSelectedDocs([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 md:px-6 md:pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
            </div>
            Compose Email
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Write an email with AI assistance. Include your courses, labs, and documents for context.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 md:px-6">
          <div className="space-y-4 md:space-y-6 pb-4">
            {/* AI Generation Section */}
            <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/20 space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  AI Email Generation
                </div>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span>{model.name}</span>
                          <span className="text-[10px] text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="purpose" className="text-xs text-muted-foreground">
                    What is the purpose of this email? *
                  </Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Request for thesis supervision..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="mt-1 h-9 md:h-10 text-sm"
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
                    className="mt-1 min-h-[50px] md:min-h-[60px] resize-none text-sm"
                  />
                </div>

                {/* Recipient with autocomplete */}
                <div className="relative">
                  <Label htmlFor="recipient-search" className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Recipient
                  </Label>
                  <div className="relative mt-1">
                    {selectedProfessor ? (
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/30 bg-primary/5">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {selectedProfessor.full_name || selectedProfessor.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {selectedProfessor.email || "No email available"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={handleClearProfessor}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={recipientInputRef}
                          id="recipient-search"
                          placeholder="Start typing professor's name..."
                          value={recipientSearch}
                          onChange={(e) => setRecipientSearch(e.target.value)}
                          onFocus={() => {
                            if (recipientSearch.length >= 2 && matchingTeachers.length > 0) {
                              setShowSuggestions(true);
                            }
                          }}
                          className="pl-9 h-9 md:h-10 text-sm"
                        />
                      </>
                    )}
                    
                    {showSuggestions && (
                      <div 
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
                      >
                        <div className="p-2 text-xs text-muted-foreground border-b border-border/50 bg-muted/30 flex items-center justify-between">
                          <span>Professors matching "{recipientSearch}"</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {matchingTeachers.length} found
                          </Badge>
                        </div>
                        <ScrollArea className="max-h-48">
                          {matchingTeachers.map((teacher) => (
                            <button
                              key={teacher.id_teacher}
                              onClick={() => handleSelectProfessor(teacher)}
                              className="w-full flex items-center gap-3 p-2.5 hover:bg-accent/50 transition-colors text-left group"
                            >
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                  {teacher.full_name || teacher.name}
                                </p>
                                {teacher.email ? (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {teacher.email}
                                  </p>
                                ) : (
                                  <p className="text-xs text-muted-foreground/50 italic">
                                    No email available
                                  </p>
                                )}
                              </div>
                              {teacher.email && (
                                <Badge variant="outline" className="text-[10px] shrink-0 border-primary/30 text-primary">
                                  ✓ Email
                                </Badge>
                              )}
                            </button>
                          ))}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>

                {/* Context Tabs - Courses, Labs, Documents */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Include context from your saved items (optional)
                  </Label>
                  <Tabs defaultValue="courses" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-8">
                      <TabsTrigger value="courses" className="text-xs gap-1">
                        <BookOpen className="h-3 w-3" />
                        Courses {selectedCourses.length > 0 && `(${selectedCourses.length})`}
                      </TabsTrigger>
                      <TabsTrigger value="labs" className="text-xs gap-1">
                        <FlaskConical className="h-3 w-3" />
                        Labs {selectedLabs.length > 0 && `(${selectedLabs.length})`}
                      </TabsTrigger>
                      <TabsTrigger value="docs" className="text-xs gap-1">
                        <File className="h-3 w-3" />
                        Docs {selectedDocs.length > 0 && `(${selectedDocs.length})`}
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="courses" className="mt-2">
                      <ScrollArea className="h-[100px] border rounded-lg p-2">
                        {savedCourses && savedCourses.length > 0 ? (
                          <div className="space-y-1">
                            {savedCourses.map((item) => (
                              <label
                                key={item.course_id}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-accent/50 cursor-pointer"
                              >
                                <Checkbox
                                  checked={selectedCourses.includes(item.course_id || '')}
                                  onCheckedChange={() => toggleCourse(item.course_id || '')}
                                />
                                <span className="text-xs truncate flex-1">{item.Courses?.name_course}</span>
                                <span className="text-[10px] text-muted-foreground">{item.Courses?.code}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-4">No saved courses</p>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="labs" className="mt-2">
                      <ScrollArea className="h-[100px] border rounded-lg p-2">
                        {savedLabs && savedLabs.length > 0 ? (
                          <div className="space-y-1">
                            {savedLabs.map((item) => (
                              <label
                                key={item.lab_id}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-accent/50 cursor-pointer"
                              >
                                <Checkbox
                                  checked={selectedLabs.includes(item.lab_id || '')}
                                  onCheckedChange={() => toggleLab(item.lab_id || '')}
                                />
                                <span className="text-xs truncate flex-1">{item.Labs?.name}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-4">No saved labs</p>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="docs" className="mt-2">
                      <ScrollArea className="h-[100px] border rounded-lg p-2">
                        {userDocuments && userDocuments.length > 0 ? (
                          <div className="space-y-1">
                            {userDocuments.map((doc) => (
                              <label
                                key={doc.id}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-accent/50 cursor-pointer"
                              >
                                <Checkbox
                                  checked={selectedDocs.includes(doc.id)}
                                  onCheckedChange={() => toggleDoc(doc.id)}
                                />
                                <span className="text-xs truncate flex-1">{doc.name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {doc.file_type?.split('/')[1] || 'file'}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-4">No uploaded documents</p>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
                
                <Button 
                  onClick={handleGenerateAI}
                  disabled={generateAI.isPending || !purpose.trim()}
                  className="w-full gap-2 h-10 md:h-11"
                  variant="default"
                >
                  {generateAI.isPending ? (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                        </div>
                      </div>
                      <span className="animate-pulse">Generating email...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Email
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Generated Email Preview */}
            {(subject || body) && (
              <div className="space-y-3 md:space-y-4 p-3 md:p-4 rounded-xl border border-border bg-card/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Generated Email</span>
                  {body && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyBody}
                      className="h-7 text-xs gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-green-500" />
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

                <div>
                  <Label htmlFor="subject" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 h-9 md:h-10 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="body" className="text-xs text-muted-foreground">Email Body</Label>
                  <Textarea
                    id="body"
                    placeholder="Your email will appear here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="mt-1 min-h-[120px] md:min-h-[160px] resize-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-4 md:p-6 pt-4 border-t border-border bg-muted/20">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={createDraft.isPending || (!subject && !body)}
            className="gap-2 h-10 order-2 sm:order-1"
          >
            {createDraft.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>
          
          <div className="flex-1 hidden sm:block" />
          
          <Button
            onClick={handleSendEmail}
            disabled={!recipient || (!subject && !body)}
            className="gap-2 h-10 order-1 sm:order-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Email Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
