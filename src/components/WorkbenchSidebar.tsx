import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAIConversations, useDeleteConversation, useUpdateConversation } from "@/hooks/useAIConversations";
import { useSavedCourses, useSavedLabs, useSavedPrograms } from "@/hooks/useSavedItems";
import { useEmailDrafts, useCreateEmailDraft, useDeleteEmailDraft } from "@/hooks/useEmailDrafts";
import { useLearningAgreements } from "@/hooks/useLearningAgreements";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  PanelLeftClose,
  Plus,
  MessageSquare,
  BookOpen,
  Beaker,
  GraduationCap,
  Mail,
  FileText,
  FolderOpen,
  ChevronRight,
  Trash2,
  MessageCirclePlus,
  Pencil,
  Check,
  X,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkbenchSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  currentConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onReferenceCourse?: (courseName: string, courseId: string) => void;
  onReferenceLab?: (labName: string, labSlug: string) => void;
  onReferenceDocument?: (docName: string, docUrl: string) => void;
}

export const WorkbenchSidebar = ({
  isOpen,
  onToggle,
  onNewChat,
  currentConversationId,
  onSelectConversation,
  onReferenceCourse,
  onReferenceLab,
  onReferenceDocument,
}: WorkbenchSidebarProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["chats"]);
  const [showDraftForm, setShowDraftForm] = useState(false);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftRecipient, setDraftRecipient] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const { data: conversations } = useAIConversations();
  const { data: savedCourses } = useSavedCourses();
  const { data: savedLabs } = useSavedLabs();
  const { data: savedPrograms } = useSavedPrograms();
  const { data: emailDrafts } = useEmailDrafts();
  const { data: agreements } = useLearningAgreements();
  const { data: userDocuments } = useUserDocuments();
  const deleteConversation = useDeleteConversation();
  const updateConversation = useUpdateConversation();
  const createEmailDraft = useCreateEmailDraft();
  const deleteEmailDraft = useDeleteEmailDraft();

  // Focus input when editing starts
  useEffect(() => {
    if (editingConvId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingConvId]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const startEditing = (convId: string, currentTitle: string) => {
    setEditingConvId(convId);
    setEditingTitle(currentTitle || "");
  };

  const cancelEditing = () => {
    setEditingConvId(null);
    setEditingTitle("");
  };

  const saveTitle = async () => {
    if (editingConvId && editingTitle.trim()) {
      await updateConversation.mutateAsync({ id: editingConvId, title: editingTitle.trim() });
    }
    cancelEditing();
  };

  const handleCourseClick = (item: any) => {
    const course = item["Courses(C)"];
    if (course && onReferenceCourse) {
      onReferenceCourse(course.name_course, course.id_course);
      if (isMobile) onToggle();
    }
  };

  const handleLabClick = (item: any) => {
    const lab = item["Labs(L)"];
    if (lab && onReferenceLab) {
      onReferenceLab(lab.name, lab.slug);
      if (isMobile) onToggle();
    }
  };

  const handleDocumentClick = (doc: any) => {
    if (onReferenceDocument) {
      onReferenceDocument(doc.name, doc.file_url);
      if (isMobile) onToggle();
    }
  };

  // Filter data based on search query
  const query = searchQuery.toLowerCase().trim();
  
  const filteredConversations = query 
    ? conversations?.filter(c => (c.title || '').toLowerCase().includes(query))
    : conversations;
    
  const filteredCourses = query 
    ? savedCourses?.filter(item => {
        const course = item["Courses(C)"];
        return (course?.name_course || '').toLowerCase().includes(query) ||
               (course?.code || '').toLowerCase().includes(query);
      })
    : savedCourses;
    
  const filteredLabs = query 
    ? savedLabs?.filter(item => {
        const lab = item["Labs(L)"];
        return (lab?.name || '').toLowerCase().includes(query) ||
               (lab?.topics || '').toLowerCase().includes(query);
      })
    : savedLabs;
    
  const filteredDrafts = query 
    ? emailDrafts?.filter(d => 
        (d.subject || '').toLowerCase().includes(query) ||
        (d.recipient || '').toLowerCase().includes(query)
      )
    : emailDrafts;
    
  const filteredDocuments = query 
    ? userDocuments?.filter(d => (d.name || '').toLowerCase().includes(query))
    : userDocuments;
    
  const filteredAgreements = query 
    ? agreements?.filter(a => 
        (a.title || '').toLowerCase().includes(query) ||
        (a.agreement_type || '').toLowerCase().includes(query)
      )
    : agreements;

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <h2 className="font-semibold text-foreground">Workbench</h2>
        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3 space-y-2">
        <Button onClick={() => { onNewChat(); if (isMobile) onToggle(); }} className="w-full gap-2" variant="outline">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* AI Chats Section */}
          <Collapsible
            open={openSections.includes("chats")}
            onOpenChange={() => toggleSection("chats")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Chats</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredConversations?.length || 0}
                </Badge>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    openSections.includes("chats") && "rotate-90"
                  )}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {filteredConversations?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  {searchQuery ? "No matching chats" : "No conversations yet"}
                </p>
              ) : (
                filteredConversations?.slice(0, 10).map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-lg text-sm transition-colors",
                      editingConvId === conv.id ? "" : "cursor-pointer",
                      currentConversationId === conv.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => {
                      if (editingConvId !== conv.id) {
                        onSelectConversation?.(conv.id);
                        if (isMobile) onToggle();
                      }
                    }}
                  >
                    <MessageSquare className="h-3 w-3 shrink-0" />
                    
                    {editingConvId === conv.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <Input
                          ref={editInputRef}
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle();
                            if (e.key === "Escape") cancelEditing();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-6 text-xs px-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => { e.stopPropagation(); saveTitle(); }}
                        >
                          <Check className="h-3 w-3 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => { e.stopPropagation(); cancelEditing(); }}
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span 
                          className="flex-1 truncate cursor-text"
                          onDoubleClick={(e) => { 
                            e.stopPropagation(); 
                            startEditing(conv.id, conv.title); 
                          }}
                          title="Double-click to rename"
                        >
                          {conv.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(conv.id, conv.title);
                          }}
                        >
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation.mutate(conv.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Saved Courses Section - Click to reference in chat */}
          <Collapsible
            open={openSections.includes("courses")}
            onOpenChange={() => toggleSection("courses")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Saved Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredCourses?.length || 0}
                </Badge>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    openSections.includes("courses") && "rotate-90"
                  )}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {filteredCourses?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  {searchQuery ? "No matching courses" : "No saved courses"}
                </p>
              ) : (
                filteredCourses?.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleCourseClick(item)}
                    className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-accent/50 transition-colors w-full text-left group"
                  >
                    <BookOpen className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {item["Courses(C)"]?.name_course}
                    </span>
                    <MessageCirclePlus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
              {(savedCourses?.length || 0) > 5 && (
                <Link
                  to="/profile?tab=workbench&section=saved"
                  className="block text-xs text-primary px-2 py-1 hover:underline"
                >
                  View all {savedCourses?.length} courses →
                </Link>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Saved Labs Section - Click to reference in chat */}
          <Collapsible
            open={openSections.includes("labs")}
            onOpenChange={() => toggleSection("labs")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <Beaker className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Saved Labs</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredLabs?.length || 0}
                </Badge>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    openSections.includes("labs") && "rotate-90"
                  )}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {filteredLabs?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  {searchQuery ? "No matching labs" : "No saved labs"}
                </p>
              ) : (
                filteredLabs?.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleLabClick(item)}
                    className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-accent/50 transition-colors w-full text-left group"
                  >
                    <Beaker className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {item["Labs(L)"]?.name}
                    </span>
                    <MessageCirclePlus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Email Drafts Section */}
          <Collapsible
            open={openSections.includes("drafts")}
            onOpenChange={() => toggleSection("drafts")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Email Drafts</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredDrafts?.length || 0}
                </Badge>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    openSections.includes("drafts") && "rotate-90"
                  )}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {/* New Draft Button / Form */}
              {showDraftForm ? (
                <div className="p-2 space-y-2 bg-accent/30 rounded-lg">
                  <Input
                    placeholder="Recipient email"
                    value={draftRecipient}
                    onChange={(e) => setDraftRecipient(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Subject"
                    value={draftSubject}
                    onChange={(e) => setDraftSubject(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Textarea
                    placeholder="Email body..."
                    value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                    className="text-xs min-h-[60px] resize-none"
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={async () => {
                        if (draftSubject.trim() || draftBody.trim()) {
                          await createEmailDraft.mutateAsync({
                            subject: draftSubject,
                            body: draftBody,
                            recipient: draftRecipient,
                          });
                          setDraftSubject("");
                          setDraftBody("");
                          setDraftRecipient("");
                          setShowDraftForm(false);
                        }
                      }}
                      disabled={createEmailDraft.isPending}
                    >
                      {createEmailDraft.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setShowDraftForm(false);
                        setDraftSubject("");
                        setDraftBody("");
                        setDraftRecipient("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowDraftForm(true)}
                >
                  <Plus className="h-3 w-3" />
                  New Email Draft
                </Button>
              )}
              
              {filteredDrafts?.length === 0 && !showDraftForm ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  {searchQuery ? "No matching drafts" : "No email drafts"}
                </p>
              ) : (
                filteredDrafts?.slice(0, 5).map((draft) => (
                  <div
                    key={draft.id}
                    className="group flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-accent/50 transition-colors"
                  >
                    <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <Link
                      to="/profile?tab=workbench&section=drafts"
                      className="flex-1 truncate"
                    >
                      {draft.subject || "Untitled"}
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEmailDraft.mutate(draft.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* My Documents Section - Click to add to AI context */}
          <Collapsible
            open={openSections.includes("documents")}
            onOpenChange={() => toggleSection("documents")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-medium">My Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredDocuments?.length || 0}
                </Badge>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    openSections.includes("documents") && "rotate-90"
                  )}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {filteredDocuments?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  {searchQuery ? "No matching documents" : "No documents uploaded"}
                </p>
              ) : (
                filteredDocuments?.slice(0, 5).map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDocumentClick(doc)}
                    className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-accent/50 transition-colors w-full text-left group"
                  >
                    <FolderOpen className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {doc.name}
                    </span>
                    <MessageCirclePlus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
              {(userDocuments?.length || 0) > 5 && (
                <Link
                  to="/profile?tab=workbench&section=documents"
                  className="block text-xs text-primary px-2 py-1 hover:underline"
                >
                  View all {userDocuments?.length} documents →
                </Link>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Learning Agreements Section */}
          <Collapsible
            open={openSections.includes("agreements")}
            onOpenChange={() => toggleSection("agreements")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Agreements</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredAgreements?.length || 0}
                </Badge>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    openSections.includes("agreements") && "rotate-90"
                  )}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {filteredAgreements?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  {searchQuery ? "No matching agreements" : "No learning agreements"}
                </p>
              ) : (
                filteredAgreements?.slice(0, 5).map((agreement) => (
                  <Link
                    key={agreement.id}
                    to={`/learning-agreements/${agreement.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-accent/50 transition-colors"
                  >
                    <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {agreement.title || "Untitled Agreement"}
                    </span>
                    <Badge
                      variant={
                        agreement.status === "approved"
                          ? "default"
                          : "secondary"
                      }
                      className="text-[10px] px-1"
                    >
                      {agreement.status}
                    </Badge>
                  </Link>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );

  // Helper to open sidebar and jump to section
  const openToSection = (section: string) => {
    if (!openSections.includes(section)) {
      setOpenSections(prev => [...prev, section]);
    }
    onToggle();
  };

  // Collapsed state (desktop only)
  if (!isOpen && !isMobile) {
    return (
      <div className="h-full flex flex-col items-center py-4 px-2 border-r border-border/30 bg-card/30 backdrop-blur-sm w-14">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="mb-2"
          title="New Chat"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="flex flex-col gap-1 mt-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary hover:bg-primary/10"
            onClick={() => openToSection("chats")}
            title="AI Chats"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-blue-500 hover:bg-blue-500/10"
            onClick={() => openToSection("courses")}
            title="Saved Courses"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-green-500 hover:bg-green-500/10"
            onClick={() => openToSection("labs")}
            title="Saved Labs"
          >
            <Beaker className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-orange-500 hover:bg-orange-500/10"
            onClick={() => openToSection("drafts")}
            title="Email Drafts"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-cyan-500 hover:bg-cyan-500/10"
            onClick={() => openToSection("documents")}
            title="My Documents"
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-purple-500 hover:bg-purple-500/10"
            onClick={() => openToSection("agreements")}
            title="Learning Agreements"
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Mobile drawer
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent side="left" className="w-80 p-0 bg-card/95 backdrop-blur-md">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop expanded sidebar
  return (
    <div className="h-full w-72 flex flex-col border-r border-border/30 bg-card/30 backdrop-blur-sm relative">
      <SidebarContent />
      {/* Resize Handle */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/30 transition-colors group"
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const sidebar = e.currentTarget.parentElement;
          if (!sidebar) return;
          const startWidth = sidebar.offsetWidth;
          
          const onMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.max(200, Math.min(400, startWidth + moveEvent.clientX - startX));
            sidebar.style.width = `${newWidth}px`;
          };
          
          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };
          
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-border/50 group-hover:bg-primary/50 transition-colors" />
      </div>
    </div>
  );
};
