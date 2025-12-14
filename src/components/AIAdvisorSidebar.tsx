import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAIConversations, useDeleteConversation, useUpdateConversation } from "@/hooks/useAIConversations";
import { useSavedCourses, useSavedLabs, useSavedPrograms } from "@/hooks/useSavedItems";
import { useEmailDrafts } from "@/hooks/useEmailDrafts";
import { useLearningAgreements } from "@/hooks/useLearningAgreements";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  PanelLeftClose,
  PanelLeft,
  Plus,
  MessageSquare,
  BookOpen,
  Beaker,
  GraduationCap,
  Mail,
  FileText,
  ChevronRight,
  Trash2,
  MessageCirclePlus,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AIAdvisorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  currentConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onReferenceCourse?: (courseName: string, courseId: string) => void;
  onReferenceLab?: (labName: string, labSlug: string) => void;
}

export const AIAdvisorSidebar = ({
  isOpen,
  onToggle,
  onNewChat,
  currentConversationId,
  onSelectConversation,
  onReferenceCourse,
  onReferenceLab,
}: AIAdvisorSidebarProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["chats"]);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const { data: conversations } = useAIConversations();
  const { data: savedCourses } = useSavedCourses();
  const { data: savedLabs } = useSavedLabs();
  const { data: savedPrograms } = useSavedPrograms();
  const { data: emailDrafts } = useEmailDrafts();
  const { data: agreements } = useLearningAgreements();
  const deleteConversation = useDeleteConversation();
  const updateConversation = useUpdateConversation();

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
      <div className="p-3">
        <Button onClick={() => { onNewChat(); if (isMobile) onToggle(); }} className="w-full gap-2" variant="outline">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
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
                  {conversations?.length || 0}
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
              {conversations?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  No conversations yet
                </p>
              ) : (
                conversations?.slice(0, 10).map((conv) => (
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
                  {savedCourses?.length || 0}
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
              {savedCourses?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  No saved courses
                </p>
              ) : (
                savedCourses?.slice(0, 5).map((item) => (
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
                  {savedLabs?.length || 0}
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
              {savedLabs?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  No saved labs
                </p>
              ) : (
                savedLabs?.slice(0, 5).map((item) => (
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
                  {emailDrafts?.length || 0}
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
              {emailDrafts?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  No email drafts
                </p>
              ) : (
                emailDrafts?.slice(0, 5).map((draft) => (
                  <Link
                    key={draft.id}
                    to="/profile?tab=workbench&section=drafts"
                    className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-accent/50 transition-colors"
                  >
                    <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {draft.subject || "Untitled"}
                    </span>
                  </Link>
                ))
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
                  {agreements?.length || 0}
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
              {agreements?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  No learning agreements
                </p>
              ) : (
                agreements?.slice(0, 5).map((agreement) => (
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

      {/* Footer */}
      <div className="p-3 border-t border-border/30">
        <Link to="/profile?tab=workbench">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
            <GraduationCap className="h-4 w-4" />
            Open Full Workbench
          </Button>
        </Link>
      </div>
    </div>
  );

  // Collapsed state (desktop only)
  if (!isOpen && !isMobile) {
    return (
      <div className="h-full flex flex-col items-center py-4 px-2 border-r border-border/30 bg-card/30 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="mb-4"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="mb-4"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="flex flex-col gap-2 mt-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
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
    <div className="h-full w-72 flex flex-col border-r border-border/30 bg-card/30 backdrop-blur-sm">
      <SidebarContent />
    </div>
  );
};
