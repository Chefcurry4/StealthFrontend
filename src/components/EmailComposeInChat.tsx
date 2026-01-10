import { useState } from "react";
import { Teacher } from "@/hooks/useTeachers";
import { useSavedCourses } from "@/hooks/useSavedItems";
import { useSavedLabs } from "@/hooks/useSavedItems";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { useTeacherAutocomplete } from "@/hooks/useTeacherAutocomplete";
import { useItemSelections } from "@/hooks/useItemSelections";
import { getSelectedCoursesData, getSelectedLabsData, getSelectedDocsData } from "@/lib/emailComposeUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  X, 
  User, 
  Search,
  BookOpen,
  FlaskConical,
  File,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EmailComposeInChatProps {
  onSubmit: (data: EmailComposeData) => void;
  onCancel: () => void;
}

export interface EmailComposeData {
  purpose: string;
  context: string;
  recipient: string;
  recipientName: string;
  selectedCourses: unknown[];
  selectedLabs: unknown[];
  selectedDocs: unknown[];
  teacherInfo?: Teacher;
}

export function EmailComposeInChat({ onSubmit, onCancel }: EmailComposeInChatProps) {
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const teacherAutocomplete = useTeacherAutocomplete();
  const itemSelections = useItemSelections();
  
  const { data: savedCourses } = useSavedCourses();
  const { data: savedLabs } = useSavedLabs();
  const { data: userDocuments } = useUserDocuments();

  const handleSubmit = () => {
    if (!purpose.trim()) return;

    const coursesData = getSelectedCoursesData(savedCourses, itemSelections.selectedCourses);
    const labsData = getSelectedLabsData(savedLabs, itemSelections.selectedLabs);
    const docsData = getSelectedDocsData(userDocuments, itemSelections.selectedDocs);

    onSubmit({
      purpose,
      context,
      recipient: teacherAutocomplete.selectedProfessor?.email || "",
      recipientName: teacherAutocomplete.selectedProfessor?.full_name || 
                     teacherAutocomplete.selectedProfessor?.name || 
                     teacherAutocomplete.recipientSearch || "Professor",
      selectedCourses: coursesData,
      selectedLabs: labsData,
      selectedDocs: docsData,
      teacherInfo: teacherAutocomplete.selectedProfessor || undefined,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 p-4 md:p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Compose Email with AI</h3>
              <p className="text-xs text-muted-foreground">I'll generate a professional email for you</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Purpose - Required */}
          <div>
            <Label htmlFor="purpose" className="text-sm font-medium text-foreground">
              What is this email about? *
            </Label>
            <Input
              id="purpose"
              placeholder="e.g., Request for thesis supervision in machine learning"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1.5"
              autoFocus
            />
          </div>

          {/* Recipient with autocomplete */}
          <div className="relative">
            <Label htmlFor="recipient-search" className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Who is this for?
            </Label>
            <div className="relative mt-1.5">
              {teacherAutocomplete.selectedProfessor ? (
                <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {teacherAutocomplete.selectedProfessor.full_name || teacherAutocomplete.selectedProfessor.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {teacherAutocomplete.selectedProfessor.email || "No email available"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={teacherAutocomplete.handleClearProfessor}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={teacherAutocomplete.recipientInputRef}
                    id="recipient-search"
                    placeholder="Start typing professor's name..."
                    value={teacherAutocomplete.recipientSearch}
                    onChange={(e) => teacherAutocomplete.setRecipientSearch(e.target.value)}
                    onFocus={() => {
                      if (teacherAutocomplete.recipientSearch.length >= 2 && teacherAutocomplete.matchingTeachers.length > 0) {
                        teacherAutocomplete.setShowSuggestions(true);
                      }
                    }}
                    className="pl-9"
                  />
                </>
              )}
              
              {teacherAutocomplete.showSuggestions && (
                <div 
                  ref={teacherAutocomplete.suggestionsRef}
                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
                >
                  <div className="p-2 text-xs text-muted-foreground border-b border-border/50 bg-muted/30 flex items-center justify-between">
                    <span>Professors matching "{teacherAutocomplete.recipientSearch}"</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {teacherAutocomplete.matchingTeachers.length} found
                    </Badge>
                  </div>
                  <ScrollArea className="max-h-48">
                    {teacherAutocomplete.matchingTeachers.map((teacher) => (
                      <button
                        key={teacher.id_teacher}
                        onClick={() => teacherAutocomplete.handleSelectProfessor(teacher)}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-accent/50 transition-colors text-left group"
                      >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
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

          {/* Additional context */}
          <div>
            <Label htmlFor="context" className="text-sm font-medium text-foreground">
              Additional context (optional)
            </Label>
            <Textarea
              id="context"
              placeholder="e.g., I'm a Master's student interested in machine learning research..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="mt-1.5 min-h-[60px] resize-none"
            />
          </div>

          {/* Advanced Options - Collapsible */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Include context from saved items
            </button>
            
            {showAdvanced && (
              <div className="mt-3 p-3 rounded-lg border border-border/50 bg-background/50">
                <Tabs defaultValue="courses" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-8">
                    <TabsTrigger value="courses" className="text-xs gap-1">
                      <BookOpen className="h-3 w-3" />
                      Courses {itemSelections.selectedCourses.length > 0 && `(${itemSelections.selectedCourses.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="labs" className="text-xs gap-1">
                      <FlaskConical className="h-3 w-3" />
                      Labs {itemSelections.selectedLabs.length > 0 && `(${itemSelections.selectedLabs.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="docs" className="text-xs gap-1">
                      <File className="h-3 w-3" />
                      Docs {itemSelections.selectedDocs.length > 0 && `(${itemSelections.selectedDocs.length})`}
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">Include your CV or resume to extract your name, background, interests and skills for a personalized email</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="courses" className="mt-2">
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {savedCourses?.slice(0, 10).map((item) => {
                          const course = item.Courses;
                          if (!course) return null;
                          return (
                            <label
                              key={item.id}
                              className="flex items-center gap-2 p-1.5 rounded hover:bg-accent/30 cursor-pointer text-sm"
                            >
                              <Checkbox
                                checked={itemSelections.selectedCourses.includes(item.course_id || '')}
                                onCheckedChange={() => itemSelections.toggleCourse(item.course_id || '')}
                              />
                              <span className="text-primary font-medium">{course.code}</span>
                              <span className="truncate text-muted-foreground">{course.name_course}</span>
                            </label>
                          );
                        })}
                        {(!savedCourses || savedCourses.length === 0) && (
                          <p className="text-xs text-muted-foreground py-2">No saved courses</p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="labs" className="mt-2">
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {savedLabs?.slice(0, 10).map((item) => {
                          const lab = item.Labs;
                          if (!lab) return null;
                          return (
                            <label
                              key={item.id}
                              className="flex items-center gap-2 p-1.5 rounded hover:bg-accent/30 cursor-pointer text-sm"
                            >
                              <Checkbox
                                checked={itemSelections.selectedLabs.includes(item.lab_id || '')}
                                onCheckedChange={() => itemSelections.toggleLab(item.lab_id || '')}
                              />
                              <span className="truncate">{lab.name}</span>
                            </label>
                          );
                        })}
                        {(!savedLabs || savedLabs.length === 0) && (
                          <p className="text-xs text-muted-foreground py-2">No saved labs</p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="docs" className="mt-2">
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {userDocuments?.slice(0, 10).map((doc) => (
                          <label
                            key={doc.id}
                            className="flex items-center gap-2 p-1.5 rounded hover:bg-accent/30 cursor-pointer text-sm"
                          >
                            <Checkbox
                              checked={itemSelections.selectedDocs.includes(doc.id)}
                              onCheckedChange={() => itemSelections.toggleDoc(doc.id)}
                            />
                            <span className="truncate">{doc.name}</span>
                          </label>
                        ))}
                        {(!userDocuments || userDocuments.length === 0) && (
                          <p className="text-xs text-muted-foreground py-2">No documents uploaded</p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!purpose.trim()}
              className="flex-1 gap-2 shadow-lg border border-border/50 bg-primary/95 backdrop-blur-md hover:bg-primary/80"
            >
              <Send className="h-4 w-4" />
              Generate Email
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailComposeInChat;
