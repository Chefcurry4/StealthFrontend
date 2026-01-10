import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAIConversations, useDeleteConversation, useUpdateConversation, useTogglePinConversation } from "@/hooks/useAIConversations";
import { useSavedCourses, useSavedLabs } from "@/hooks/useSavedItems";
import { useEmailDrafts, useDeleteEmailDraft } from "@/hooks/useEmailDrafts";
import { useUserDocuments } from "@/hooks/useUserDocuments";
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
  Mail,
  FolderOpen,
  ChevronRight,
  Trash2,
  MessageCirclePlus,
  Pencil,
  Check,
  X,
  Search,
  GripVertical,
  Pin,
  PinOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkbenchSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  onNewChat: () => void;
  onComposeEmail?: () => void;
  currentConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onReferenceCourse?: (courseName: string, courseId: string) => void;
  onReferenceLab?: (labName: string, labSlug: string) => void;
  onReferenceDocument?: (docName: string, docUrl: string) => void;
  onReferenceEmailDraft?: (subject: string, body: string) => void;
}

// Draggable item component for sidebar items
const DraggableItem = ({
  children,
  onDragStart,
  dragData,
  className,
}: {
  children: React.ReactNode;
  onDragStart?: () => void;
  dragData: { type: string; data: any };
  className?: string;
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
    onDragStart?.();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn("cursor-grab active:cursor-grabbing", className)}
    >
      {children}
    </div>
  );
};

export const WorkbenchSidebar = ({
  isOpen,
  onToggle,
  onOpen,
  onClose,
  onNewChat,
  onComposeEmail,
  currentConversationId,
  onSelectConversation,
  onReferenceCourse,
  onReferenceLab,
  onReferenceDocument,
  onReferenceEmailDraft,
}: WorkbenchSidebarProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["chats"]);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // No auto-close behavior - user must click the close button

  const { data: conversations } = useAIConversations();
  const { data: savedCourses } = useSavedCourses();
  const { data: savedLabs } = useSavedLabs();
  const { data: emailDrafts } = useEmailDrafts();
  const { data: userDocuments } = useUserDocuments();
  const deleteConversation = useDeleteConversation();
  const updateConversation = useUpdateConversation();
  const togglePinConversation = useTogglePinConversation();
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

  const handleCourseClick = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    const course = item.Courses;
    if (course && onReferenceCourse) {
      onReferenceCourse(course.name_course, course.id_course);
      if (isMobile) onToggle();
    }
  };

  const handleLabClick = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    const lab = item.Labs;
    if (lab && onReferenceLab) {
      onReferenceLab(lab.name, lab.slug);
      if (isMobile) onToggle();
    }
  };

  const handleDocumentClick = (e: React.MouseEvent, doc: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (onReferenceDocument) {
      onReferenceDocument(doc.name, doc.file_url);
      if (isMobile) onToggle();
    }
  };

  const handleEmailDraftClick = (e: React.MouseEvent, draft: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (onReferenceEmailDraft) {
      onReferenceEmailDraft(draft.subject || "Untitled", draft.body || "");
      if (isMobile) onToggle();
    }
  };

  // Filter data based on search query
  const query = searchQuery.toLowerCase().trim();
  
  const filteredConversations = query 
    ? conversations?.filter(c => (c.title || '').toLowerCase().includes(query))
    : conversations;
  
  // Group conversations by date
  const groupConversationsByDate = (convs: typeof conversations) => {
    if (!convs) return { pinned: [], today: [], yesterday: [], thisWeek: [], thisMonth: [], older: [] };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const groups = {
      pinned: [] as typeof convs,
      today: [] as typeof convs,
      yesterday: [] as typeof convs,
      thisWeek: [] as typeof convs,
      thisMonth: [] as typeof convs,
      older: [] as typeof convs,
    };
    
    convs.forEach(conv => {
      if (conv.pinned) {
        groups.pinned.push(conv);
        return;
      }
      
      const convDate = new Date(conv.updated_at);
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= thisWeekStart) {
        groups.thisWeek.push(conv);
      } else if (convDate >= thisMonthStart) {
        groups.thisMonth.push(conv);
      } else {
        groups.older.push(conv);
      }
    });
    
    return groups;
  };
  
  const groupedConversations = groupConversationsByDate(filteredConversations);
  
  // Render a single conversation item
  const renderConversation = (conv: NonNullable<typeof conversations>[0]) => (
    <div
      key={conv.id}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg text-sm transition-colors relative",
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
        <div className="flex-1 flex items-center gap-1 min-w-0">
          <Input
            ref={editInputRef}
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") cancelEditing();
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-6 text-xs px-1 flex-1 min-w-0"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={(e) => { e.stopPropagation(); saveTitle(); }}
          >
            <Check className="h-3 w-3 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={(e) => { e.stopPropagation(); cancelEditing(); }}
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <>
          <span 
            className="flex-1 truncate cursor-text min-w-0 pr-20"
            onDoubleClick={(e) => { 
              e.stopPropagation(); 
              startEditing(conv.id, conv.title); 
            }}
            title="Double-click to rename"
          >
            {conv.title && conv.title.split(' ').length > 4 
              ? conv.title.split(' ').slice(0, 4).join(' ') + '...'
              : conv.title}
          </span>
          <div className="absolute right-1 flex items-center gap-0.5 bg-inherit">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                togglePinConversation.mutate({ id: conv.id, pinned: !conv.pinned });
              }}
              title={conv.pinned ? "Unpin" : "Pin"}
            >
              {conv.pinned ? (
                <PinOff className="h-3 w-3 text-amber-500" />
              ) : (
                <Pin className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
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
          </div>
        </>
      )}
    </div>
  );
    
  const filteredCourses = query 
    ? savedCourses?.filter(item => {
        const course = item.Courses;
        return (course?.name_course || '').toLowerCase().includes(query) ||
               (course?.code || '').toLowerCase().includes(query);
      })
    : savedCourses;
    
  const filteredLabs = query 
    ? savedLabs?.filter(item => {
        const lab = item.Labs;
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

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <h2 className="font-semibold text-foreground">Workbench</h2>
        {!isMobile && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose || onToggle}
            className="gap-1.5 bg-accent/50 hover:bg-accent"
          >
            <PanelLeftClose className="h-4 w-4" />
            <span className="text-xs">Close</span>
          </Button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <Button onClick={() => { onNewChat(); if (isMobile) onToggle(); }} className="flex-1 gap-2" variant="outline">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          {onComposeEmail && (
            <Button 
              onClick={() => { onComposeEmail(); if (isMobile) onToggle(); }} 
              className="gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:from-primary/20 hover:to-accent/20" 
              variant="outline"
              title="Compose Email with AI"
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
        </div>
        
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
        
        {/* Drag hint */}
        <p className="text-[10px] text-muted-foreground text-center">
          Drag items to chat to reference them
        </p>
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
            <CollapsibleContent className="mt-1 space-y-2">
              {filteredConversations?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  {searchQuery ? "No matching chats" : "No conversations yet"}
                </p>
              ) : (
                <>
                  {/* Pinned Conversations */}
                  {groupedConversations.pinned.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground px-2 pt-1 pb-0.5 font-medium flex items-center gap-1">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </div>
                      {groupedConversations.pinned.map((conv) => renderConversation(conv))}
                    </div>
                  )}
                  
                  {/* Today */}
                  {groupedConversations.today.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground px-2 pt-1 pb-0.5 font-medium">Today</div>
                      {groupedConversations.today.map((conv) => renderConversation(conv))}
                    </div>
                  )}
                  
                  {/* Yesterday */}
                  {groupedConversations.yesterday.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground px-2 pt-1 pb-0.5 font-medium">Yesterday</div>
                      {groupedConversations.yesterday.map((conv) => renderConversation(conv))}
                    </div>
                  )}
                  
                  {/* This Week */}
                  {groupedConversations.thisWeek.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground px-2 pt-1 pb-0.5 font-medium">This Week</div>
                      {groupedConversations.thisWeek.map((conv) => renderConversation(conv))}
                    </div>
                  )}
                  
                  {/* This Month */}
                  {groupedConversations.thisMonth.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground px-2 pt-1 pb-0.5 font-medium">This Month</div>
                      {groupedConversations.thisMonth.map((conv) => renderConversation(conv))}
                    </div>
                  )}
                  
                  {/* Older */}
                  {groupedConversations.older.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground px-2 pt-1 pb-0.5 font-medium">Older</div>
                      {groupedConversations.older.map((conv) => renderConversation(conv))}
                    </div>
                  )}
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Saved Courses Section - Draggable */}
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
                filteredCourses?.slice(0, 8).map((item) => {
                  const course = item.Courses;
                  // Truncate course name to ~4 words with ellipsis
                  const courseName = course?.name_course || "Untitled Course";
                  const truncatedName = courseName.split(' ').length > 4 
                    ? courseName.split(' ').slice(0, 4).join(' ') + '...'
                    : courseName;
                  return (
                    <DraggableItem
                      key={item.id}
                      dragData={{ 
                        type: "course", 
                        data: { 
                          id: course?.id_course, 
                          name: course?.name_course,
                          code: course?.code,
                          description: course?.description,
                          ects: course?.ects,
                          professor: course?.professor_name
                        } 
                      }}
                    >
                      <button
                        onClick={(e) => handleCourseClick(e, item)}
                        className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-accent/50 transition-colors w-full text-left group"
                        title={courseName}
                      >
                        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100" />
                        <BookOpen className="h-3 w-3 shrink-0 text-blue-500" />
                        <span className="flex-1 text-foreground">
                          {course?.code && (
                            <span className="text-primary font-medium mr-1.5">{course.code}</span>
                          )}
                          <span className="text-muted-foreground">{truncatedName}</span>
                        </span>
                        <MessageCirclePlus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    </DraggableItem>
                  );
                })
              )}
              {(savedCourses?.length || 0) > 8 && (
                <Link
                  to="/profile?tab=workbench&section=saved"
                  className="block text-xs text-primary px-2 py-1 hover:underline"
                >
                  View all {savedCourses?.length} courses →
                </Link>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Saved Labs Section - Draggable */}
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
                filteredLabs?.slice(0, 8).map((item) => {
                  const lab = item.Labs;
                  // Truncate lab name to ~4 words with ellipsis
                  const labName = lab?.name || "Untitled Lab";
                  const truncatedLabName = labName.split(' ').length > 4 
                    ? labName.split(' ').slice(0, 4).join(' ') + '...'
                    : labName;
                  return (
                    <DraggableItem
                      key={item.id}
                      dragData={{ 
                        type: "lab", 
                        data: { 
                          id: lab?.id_lab, 
                          name: lab?.name,
                          slug: lab?.slug,
                          topics: lab?.topics,
                          description: lab?.description,
                          professors: lab?.professors
                        } 
                      }}
                    >
                      <button
                        onClick={(e) => handleLabClick(e, item)}
                        className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-accent/50 transition-colors w-full text-left group"
                        title={labName}
                      >
                        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100" />
                        <Beaker className="h-3 w-3 shrink-0 text-green-500" />
                        <span className="flex-1 text-foreground text-muted-foreground">
                          {truncatedLabName}
                        </span>
                        <MessageCirclePlus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    </DraggableItem>
                  );
                })
              )}
              {(savedLabs?.length || 0) > 8 && (
                <Link
                  to="/profile?tab=workbench&section=saved"
                  className="block text-xs text-primary px-2 py-1 hover:underline"
                >
                  View all {savedLabs?.length} labs →
                </Link>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Email Drafts Section - Draggable */}
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
              {filteredDrafts?.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  {searchQuery ? "No matching drafts" : "No email drafts yet"}
                </p>
              ) : (
                filteredDrafts?.slice(0, 5).map((draft) => (
                  <DraggableItem
                    key={draft.id}
                    dragData={{ 
                      type: "emailDraft", 
                      data: { 
                        id: draft.id,
                        subject: draft.subject,
                        body: draft.body,
                        recipient: draft.recipient
                      } 
                    }}
                  >
                    <div
                      className="group flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={(e) => handleEmailDraftClick(e, draft)}
                    >
                      <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100" />
                      <Mail className="h-3 w-3 shrink-0 text-orange-500" />
                      <span className="flex-1 truncate text-foreground">
                        {draft.subject || "Untitled"}
                      </span>
                      <MessageCirclePlus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  </DraggableItem>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* My Documents Section - Draggable */}
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
                filteredDocuments?.slice(0, 8).map((doc) => (
                  <DraggableItem
                    key={doc.id}
                    dragData={{ 
                      type: "document", 
                      data: { 
                        id: doc.id,
                        name: doc.name,
                        url: doc.file_url,
                        type: doc.file_type
                      } 
                    }}
                  >
                    <button
                      onClick={(e) => handleDocumentClick(e, doc)}
                      className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-accent/50 transition-colors w-full text-left group"
                    >
                      <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100" />
                      <FolderOpen className="h-3 w-3 shrink-0 text-cyan-500" />
                      <span className="flex-1 truncate text-foreground">
                        {doc.name || "Untitled Document"}
                      </span>
                      <MessageCirclePlus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </DraggableItem>
                ))
              )}
              {(userDocuments?.length || 0) > 8 && (
                <Link
                  to="/profile?tab=workbench&section=documents"
                  className="block text-xs text-primary px-2 py-1 hover:underline"
                >
                  View all {userDocuments?.length} documents →
                </Link>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );

  // Collapsed sidebar view (PC only) - shows icons and click to expand
  if (!isOpen && !isMobile) {
    return (
      <div 
        className="w-14 border-r border-border/30 bg-background/50 flex flex-col items-center py-4 gap-4"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onOpen}
          className="hover:bg-accent/50"
          title="Open Sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <div className="w-8 border-t border-border/30" />
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-accent/50"
          title={`AI Chats (${conversations?.length || 0})`}
          onClick={() => { onOpen?.(); setOpenSections(["chats"]); }}
        >
          <MessageSquare className="h-4 w-4 text-primary" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-accent/50"
          title={`Saved Courses (${savedCourses?.length || 0})`}
          onClick={() => { onOpen?.(); setOpenSections(["courses"]); }}
        >
          <BookOpen className="h-4 w-4 text-blue-500" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-accent/50"
          title={`Saved Labs (${savedLabs?.length || 0})`}
          onClick={() => { onOpen?.(); setOpenSections(["labs"]); }}
        >
          <Beaker className="h-4 w-4 text-green-500" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-accent/50"
          title={`Email Drafts (${emailDrafts?.length || 0})`}
          onClick={() => { onOpen?.(); setOpenSections(["drafts"]); }}
        >
          <Mail className="h-4 w-4 text-orange-500" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-accent/50"
          title={`My Documents (${userDocuments?.length || 0})`}
          onClick={() => { onOpen?.(); setOpenSections(["documents"]); }}
        >
          <FolderOpen className="h-4 w-4 text-cyan-500" />
        </Button>
      </div>
    );
  }

  // Mobile: Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar - wider for better readability
  return (
    <div 
      className="w-80 border-r border-border/30 bg-background/50 flex flex-col"
    >
      <SidebarContent />
    </div>
  );
};

export default WorkbenchSidebar;
