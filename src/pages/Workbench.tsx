import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { streamAIStudyAdvisor } from "@/hooks/useAI";
import { extractPdfTextFromFile } from "@/lib/pdfText";
import { extractTextFromImage } from "@/lib/imageOcr";
import { useSavedCourses, useSavedLabs, useSavedPrograms } from "@/hooks/useSavedItems";
import { useLearningAgreements } from "@/hooks/useLearningAgreements";
import { useEmailDrafts, useCreateEmailDraft } from "@/hooks/useEmailDrafts";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { useUserProfile } from "@/hooks/useUserProfile";
import { 
  useAIMessages, 
  useCreateConversation, 
  useSaveMessage, 
  useUpdateConversation,
  useAIConversations,
  useMessageFeedback,
  type AIMessageAttachment,
  type AIMessageReferencedItem
} from "@/hooks/useAIConversations";
import { useConversationSearch } from "@/hooks/useConversationSearch";
import { useWorkbenchSemesterPlan } from "@/hooks/useWorkbenchSemesterPlan";
import { 
  useSemesterPlans, 
  useCreateSemesterPlan, 
  useDeleteSemesterPlan, 
  useUpdateSemesterPlan,
  useSaveAIPlan 
} from "@/hooks/useSemesterPlans";
import { supabase } from "@/integrations/supabase/client";
import { exportConversation } from "@/utils/exportConversation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WorkbenchSidebar } from "@/components/WorkbenchSidebar";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AIResultCards } from "@/components/AIResultCard";
import { KeyboardShortcutsHelp, useKeyboardShortcuts } from "@/components/KeyboardShortcutsHelp";
import { ConversationSearchBar } from "@/components/ConversationSearchBar";
import { MentionPopup } from "@/components/MentionPopup";
import { EmailComposeInChat, EmailComposeData } from "@/components/EmailComposeInChat";
import { WorkbenchDiary } from "@/components/workbench/WorkbenchDiary";
import { ThinkingIndicator, ThoughtDurationBadge } from "@/components/workbench/ThinkingIndicator";
import { ThinkingHistory, ThinkingStep } from "@/components/workbench/ThinkingHistory";
import { AttachmentPreview } from "@/components/workbench/AttachmentPreview";
import { EditableMessage } from "@/components/workbench/EditableMessage";
import { PandaIcon } from "@/components/icons/PandaIcon";
import { PandaIconSimple } from "@/components/icons/PandaIconSimple";
import { 
  Send, 
  Loader2, 
  ArrowLeft, 
  Copy, 
  Check, 
  Paperclip, 
  X, 
  ChevronDown,
  Sparkles,
  Zap,
  Brain,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  PanelLeft,
  Database,
  Search,
  Download,
  FileText,
  FileJson,
  FileDown,
  FileType,
  Square,
  Mail,
  BookOpen,
  Beaker,
  ExternalLink,
  Edit3,
  Image,
  ArrowDown,
  CalendarDays
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Attachment {
  id: string;
  name: string;
  type: string;
  content: string;
}

interface ReferencedItem {
  type: 'course' | 'lab';
  data: {
    id: string;
    name: string;
    code?: string;
    ects?: number;
    description?: string;
    professor?: string;
    topics?: string;
    link?: string;
  };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  referencedItems?: ReferencedItem[];
  timestamp: Date;
  feedback?: "positive" | "negative" | null;
  /** Duration in seconds the AI took to think (for assistant messages) */
  thoughtDurationSeconds?: number;
  /** Thinking steps (tools used) for this message */
  thinkingSteps?: ThinkingStep[];
}

type ModelType = "gemini-flash" | "gemini-pro" | "gpt-5" | "gpt-5-mini" | "sonar" | "sonar-pro" | "sonar-reasoning";

type ProviderType = "gemini" | "openai" | "perplexity";

type AIState = 'idle' | 'thinking' | 'searching' | 'planning' | 'streaming';

interface ModelInfo {
  id: ModelType;
  name: string;
  description: string;
  icon: React.ReactNode;
  provider: ProviderType;
}

const models: ModelInfo[] = [
  // Gemini Models
  { 
    id: "gemini-flash", 
    name: "Gemini Flash", 
    description: "Fast, balanced responses (default)",
    icon: <Zap className="h-4 w-4" />,
    provider: "gemini"
  },
  { 
    id: "gemini-pro", 
    name: "Gemini Pro", 
    description: "Advanced reasoning for complex questions",
    icon: <Brain className="h-4 w-4" />,
    provider: "gemini"
  },
  // OpenAI Models
  { 
    id: "gpt-5", 
    name: "GPT-5", 
    description: "OpenAI's most powerful model",
    icon: <Sparkles className="h-4 w-4" />,
    provider: "openai"
  },
  { 
    id: "gpt-5-mini", 
    name: "GPT-5 Mini", 
    description: "Fast and cost-effective OpenAI model",
    icon: <Zap className="h-4 w-4" />,
    provider: "openai"
  },
  // Perplexity Models
  { 
    id: "sonar", 
    name: "Sonar", 
    description: "Web-grounded search answers",
    icon: <Search className="h-4 w-4" />,
    provider: "perplexity"
  },
  { 
    id: "sonar-pro", 
    name: "Sonar Pro", 
    description: "Multi-step reasoning with citations",
    icon: <Brain className="h-4 w-4" />,
    provider: "perplexity"
  },
  { 
    id: "sonar-reasoning", 
    name: "Sonar Reasoning", 
    description: "Deep reasoning with real-time search",
    icon: <Sparkles className="h-4 w-4" />,
    provider: "perplexity"
  },
];

import perplexityLogo from "@/assets/perplexity-logo.svg";

// Provider logos and labels
const providerInfo: Record<ProviderType, { name: string; logo: string }> = {
  gemini: {
    name: "Google Gemini",
    logo: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg"
  },
  openai: {
    name: "OpenAI",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
  },
  perplexity: {
    name: "Perplexity",
    logo: perplexityLogo
  }
};

// Models to display in UI (show OpenAI and Perplexity, filter out Gemini for now)
const displayModels = models.filter(m => m.provider === "perplexity" || m.provider === "openai");

// Helper to format tool names for display
const formatToolName = (toolName: string): string => {
  const toolLabels: Record<string, string> = {
    'search_courses': 'courses',
    'search_labs': 'labs',
    'search_teachers': 'teachers',
    'search_universities': 'universities',
    'get_courses_by_teacher': 'teacher courses',
    'get_labs_by_university': 'university labs',
    'get_programs_by_university': 'programs',
  };
  return toolLabels[toolName] || toolName.replace(/_/g, ' ');
};

const Workbench = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelType>("sonar");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiState, setAiState] = useState<AIState>('idle');
  const [activeSearchTools, setActiveSearchTools] = useState<string[]>([]);
  const [referencedItems, setReferencedItems] = useState<Array<{ type: 'course' | 'lab'; data: any }>>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");
  const [mentionCursorPosition, setMentionCursorPosition] = useState(0);
  const [showEmailCompose, setShowEmailCompose] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
  const [currentThinkingSteps, setCurrentThinkingSteps] = useState<ThinkingStep[]>([]);
  const toolStepTimesRef = useRef<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { showHelp, setShowHelp } = useKeyboardShortcuts();
  
  // Semester planner hooks
  const {
    tempPlan,
    isPlannerOpen,
    togglePlanner,
    clearTempPlan,
    parseSemesterPlanFromResponse,
    setTempSemesterPlan
  } = useWorkbenchSemesterPlan();
  
  // Persistent semester plans
  const { data: savedSemesterPlans = [] } = useSemesterPlans();
  const createSemesterPlan = useCreateSemesterPlan();
  const deleteSemesterPlan = useDeleteSemesterPlan();
  const updateSemesterPlan = useUpdateSemesterPlan();
  const saveAIPlan = useSaveAIPlan();
  
  // Conversation search hook
  const {
    searchQuery: convSearchQuery,
    setSearchQuery: setConvSearchQuery,
    isSearchOpen,
    openSearch,
    closeSearch,
    searchResults,
    activeResultIndex,
    activeResult,
    goToNextResult,
    goToPrevResult,
  } = useConversationSearch(messages);
  
  // Scroll to message when search result changes
  const scrollToMessage = useCallback((messageIndex: number) => {
    const messageElements = document.querySelectorAll('[data-message-index]');
    const targetElement = messageElements[messageIndex];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        targetElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
  }, []);
  
  // Keyboard shortcuts for workbench
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N for new chat
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        handleNewChat();
      }
      // Ctrl+F for search in conversation
      if ((e.ctrlKey || e.metaKey) && e.key === "f" && messages.length > 0) {
        e.preventDefault();
        openSearch();
      }
      // Escape to close sidebar or search
      if (e.key === "Escape") {
        if (isSearchOpen) {
          closeSearch();
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, messages.length, isSearchOpen, openSearch, closeSearch]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      // Max 6 lines (roughly 150px)
      const maxHeight = 150;
      inputRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);
  
  // Handle paste events for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            toast.info("Processing pasted image...");
            try {
              const text = await extractTextFromImage(file);
              const newAttachment: Attachment = {
                id: crypto.randomUUID(),
                name: `Pasted Image ${new Date().toLocaleTimeString()}`,
                type: 'image',
                content: text,
              };
              setAttachments(prev => [...prev, newAttachment]);
              toast.success("Image pasted and processed");
            } catch (error) {
              console.error("Error processing pasted image:", error);
              toast.error("Failed to process pasted image");
            }
          }
        }
      }
    };
    
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('paste', handlePaste as any);
      return () => inputElement.removeEventListener('paste', handlePaste as any);
    }
  }, []);
  
  // Data hooks for comprehensive AI context
  const { data: savedCourses } = useSavedCourses();
  const { data: savedLabs } = useSavedLabs();
  const { data: savedPrograms } = useSavedPrograms();
  const { data: agreements } = useLearningAgreements();
  const { data: emailDrafts } = useEmailDrafts();
  const createEmailDraft = useCreateEmailDraft();
  const { data: documents } = useUserDocuments();
  const { data: userProfile } = useUserProfile();
  const { data: recentConversations } = useAIConversations();
  
  // Conversation persistence hooks
  const createConversation = useCreateConversation();
  const saveMessage = useSaveMessage();
  const updateConversation = useUpdateConversation();
  const { data: loadedMessages } = useAIMessages(currentConversationId || null);
  const messageFeedback = useMessageFeedback();

  // Track if user explicitly started a new chat - default to true so we always start fresh
  const [isNewChatMode, setIsNewChatMode] = useState(true);

  // Persist and restore conversation state when navigating away and back
  useEffect(() => {
    // Restore conversation ID from sessionStorage when mounting
    const savedConversationId = sessionStorage.getItem('workbench-current-conversation');
    const savedMode = sessionStorage.getItem('workbench-is-new-chat');
    
    if (savedConversationId && savedConversationId !== 'undefined') {
      setCurrentConversationId(savedConversationId);
      setIsNewChatMode(false);
    } else if (savedMode === 'false') {
      // Had a conversation but ID wasn't saved - stay in new chat mode
      setIsNewChatMode(true);
    }
  }, []);

  // Save conversation state when it changes
  useEffect(() => {
    if (currentConversationId) {
      sessionStorage.setItem('workbench-current-conversation', currentConversationId);
      sessionStorage.setItem('workbench-is-new-chat', 'false');
    } else if (!isNewChatMode) {
      sessionStorage.removeItem('workbench-current-conversation');
      sessionStorage.setItem('workbench-is-new-chat', 'true');
    }
  }, [currentConversationId, isNewChatMode]);

  // Track if this is a restored session (to prevent scroll animation)
  const isRestoringSession = useRef(false);

  // Load messages when switching conversations (including attachments & references)
  useEffect(() => {
    if (loadedMessages && loadedMessages.length > 0) {
      // Check if this is a session restore (messages loaded on mount)
      const isInitialLoad = messages.length === 0;
      if (isInitialLoad) {
        isRestoringSession.current = true;
      }
      
      setMessages(loadedMessages.map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        attachments: m.attachments as Attachment[] | undefined,
        referencedItems: m.referenced_items as ReferencedItem[] | undefined,
        timestamp: new Date(m.created_at)
      })));
      
      // Scroll to bottom instantly on restore (no animation)
      if (isInitialLoad) {
        requestAnimationFrame(() => {
          scrollToBottom("auto");
          // Clear the flag after scroll
          setTimeout(() => {
            isRestoringSession.current = false;
          }, 100);
        });
      }
    }
  }, [loadedMessages]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(undefined);
    setIsNewChatMode(true);
    setInput("");
    setAttachments([]);
    setReferencedItems([]);
    setShowEmailCompose(false);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setIsNewChatMode(false);
    setInput("");
    setAttachments([]);
    setReferencedItems([]);
    setShowEmailCompose(false);
  };

  // Drag and drop handlers for referenced items
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const jsonData = e.dataTransfer.getData("application/json");
      if (jsonData) {
        const { type, data } = JSON.parse(jsonData);
        if (type === "course" || type === "lab") {
          // Check if already added
          const exists = referencedItems.some(
            item => item.type === type && item.data.id === data.id
          );
          if (!exists) {
            setReferencedItems(prev => [...prev, { type, data }]);
            toast.success(`${type === "course" ? "Course" : "Lab"} added to context`);
          } else {
            toast.info("Already added to context");
          }
        }
      }
    } catch (err) {
      console.error("Failed to parse drop data:", err);
    }
  };

  const removeReferencedItem = (index: number) => {
    setReferencedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Handle @ mentions in input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = (e.target as HTMLInputElement).selectionStart || 0;
    setInput(value);
    
    // Check if user typed @ and extract search query after @
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show popup if @ is at word boundary (start or after space)
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      
      if ((charBeforeAt === ' ' || lastAtIndex === 0) && !textAfterAt.includes(' ')) {
        setShowMentionPopup(true);
        setMentionSearchQuery(textAfterAt);
        setMentionCursorPosition(lastAtIndex);
        return;
      }
    }
    
    setShowMentionPopup(false);
  };

  // Handle mention selection - look up full metadata from saved data
  const handleMentionSelect = (item: { id: string; type: 'course' | 'lab'; name: string; code?: string }) => {
    // Remove the @ and search query from input
    const beforeAt = input.slice(0, mentionCursorPosition);
    const afterCursor = input.slice(mentionCursorPosition + 1 + mentionSearchQuery.length);
    setInput(beforeAt + afterCursor);
    
    // Add item to referenced items with full metadata
    const exists = referencedItems.some(
      r => r.type === item.type && r.data.id === item.id
    );
    
    if (!exists) {
      // Look up full metadata from saved items
      if (item.type === 'course') {
        const savedCourse = savedCourses?.find(c => c.Courses?.id_course === item.id);
        const courseData = savedCourse?.Courses;
        setReferencedItems(prev => [...prev, { 
          type: 'course', 
          data: { 
            id: item.id, 
            name: courseData?.name_course || item.name,
            code: courseData?.code || item.code,
            ects: courseData?.ects || undefined,
            description: courseData?.description || undefined,
            professor: courseData?.professor_name || undefined,
          } 
        }]);
      } else {
        const savedLab = savedLabs?.find(l => l.Labs?.id_lab === item.id);
        const labData = savedLab?.Labs;
        setReferencedItems(prev => [...prev, { 
          type: 'lab', 
          data: { 
            id: item.id, 
            name: labData?.name || item.name,
            topics: labData?.topics || undefined,
            description: labData?.description || undefined,
            link: labData?.link || undefined,
          } 
        }]);
      }
      toast.success(`${item.type === 'course' ? 'Course' : 'Lab'} added to context`);
    }
    
    setShowMentionPopup(false);
    inputRef.current?.focus();
  };

  // Build mention items from saved data (basic info for popup, full info added on select)
  const mentionCourses = savedCourses?.map(c => ({
    id: c.Courses?.id_course || '',
    type: 'course' as const,
    name: c.Courses?.name_course || '',
    code: c.Courses?.code || undefined,
  })).filter(c => c.name) || [];

  const mentionLabs = savedLabs?.map(l => ({
    id: l.Labs?.id_lab || '',
    type: 'lab' as const,
    name: l.Labs?.name || '',
  })).filter(l => l.name) || [];

  const handleReferenceCourse = (courseName: string, courseId: string) => {
    setInput(prev => prev + (prev ? " " : "") + `Tell me about the course "${courseName}"`);
  };

  const handleReferenceLab = (labName: string, labSlug: string) => {
    setInput(prev => prev + (prev ? " " : "") + `Tell me about the lab "${labName}"`);
  };

  const handleReferenceDocument = async (docName: string, docUrl: string) => {
    // Fetch document content if it's a text-based file
    try {
      const response = await fetch(docUrl);
      const text = await response.text();
      const truncatedContent = text.substring(0, 10000);
      
      setAttachments(prev => [...prev, {
        id: generateId(),
        name: docName,
        type: "text/plain",
        content: truncatedContent
      }]);
      
      setInput(prev => prev + (prev ? " " : "") + `Based on my document "${docName}", `);
      toast.success(`Document "${docName}" added to context`);
    } catch {
      toast.error(`Failed to load document "${docName}"`);
    }
  };

  // Stop ongoing AI response
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setAiState('idle');
      setActiveSearchTools([]);
      toast.info("Response stopped");
    }
  };

  const shouldAutoScrollRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const root = scrollRef.current as unknown as HTMLElement | null;
    const viewport = (root?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null) || root;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior });
  }, []);

  // Track whether user scrolled up (so we don't yank them to the bottom)
  useEffect(() => {
    const root = scrollRef.current as unknown as HTMLElement | null;
    const viewport = (root?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null) || root;
    if (!viewport) return;

    const onScroll = () => {
      const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom < 120;
      // Show scroll button if scrolled up more than 300px from bottom
      setShowScrollButton(distanceFromBottom > 300);
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll when new messages arrive (only if user is already near bottom)
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      // during streaming, keep it snappy
      scrollToBottom(isStreaming ? "auto" : "smooth");
    }
  }, [messages, isStreaming, scrollToBottom]);

  // Handle text selection for refinement - MUST be before early return

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Supported file types
    const supportedExtensions = [
      ".txt",
      ".md",
      ".json",
      ".csv",
      ".pdf",
      ".docx",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
    ];
    const supportedMimeTypes = [
      "text/",
      "application/json",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];

    for (const file of Array.from(files)) {
      const extension = "." + (file.name.split(".").pop()?.toLowerCase() || "");
      const isSupported =
        supportedExtensions.includes(extension) ||
        supportedMimeTypes.some((mime) => file.type.startsWith(mime));

      if (!isSupported) {
        toast.error(
          `${file.name}: Unsupported file type. Supported: txt, md, json, csv, pdf, docx, png, jpg, gif, webp`,
        );
        continue;
      }

      // Align with platform limit (20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name}: File too large (max 20MB)`);
        continue;
      }

      try {
        let content = "";

        if (file.type.startsWith("image/")) {
          // Try OCR extraction for images
          setIsProcessingOcr(true);
          toast.info(`Processing image with OCR: ${file.name}...`);
          const ocrText = await extractTextFromImage(file, 12000);
          setIsProcessingOcr(false);
          
          if (ocrText && ocrText.length > 20) {
            content = `[Image: ${file.name}]\n\nExtracted text (OCR):\n${ocrText}`;
            toast.success(`OCR completed for ${file.name}`);
          } else {
            content = `[Image: ${file.name}]\n\n(No readable text found in this image. The AI will not be able to analyze visual content.)`;
            toast.info(`No text found in ${file.name}`);
          }
        } else if (file.type === "application/json") {
          const text = await file.text();
          try {
            const parsed = JSON.parse(text);
            content = JSON.stringify(parsed, null, 2).substring(0, 10000);
          } catch {
            content = text.substring(0, 10000);
          }
        } else if (file.name.toLowerCase().endsWith(".pdf")) {
          const extracted = await extractPdfTextFromFile(file, 12000);
          content = extracted
            ? `[PDF: ${file.name}]\n\n${extracted}`
            : `[PDF: ${file.name}]\n\n(No text could be extracted from this PDF. If it's scanned, please upload a text-based version.)`;
        } else if (file.name.toLowerCase().endsWith(".docx")) {
          // DOCX parsing not supported client-side yet
          content = `[DOCX: ${file.name}] (DOCX parsing not supported yet. Please export to PDF or TXT for best results.)`;
        } else {
          content = (await file.text()).substring(0, 10000);
        }

        setAttachments((prev) => [
          ...prev,
          {
            id: generateId(),
            name: file.name,
            type: file.type || extension,
            content,
          },
        ]);
      } catch {
        toast.error(`Failed to read ${file.name}`);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleCopy = async (content: string, messageId: string) => {
    try {
      // Strip HTML comments (metadata like <!--COURSES:[...]-->) before copying
      const cleanContent = content.replace(/<!--[\s\S]*?-->/g, '').trim();
      await navigator.clipboard.writeText(cleanContent);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleRegenerate = async (messageIndex: number) => {
    if (isStreaming) return;
    
    const messagesUpToIndex = messages.slice(0, messageIndex);
    const lastUserMessageIndex = messagesUpToIndex.map(m => m.role).lastIndexOf("user");
    
    if (lastUserMessageIndex === -1) return;

    const messagesToSend = messages.slice(0, lastUserMessageIndex + 1);
    setMessages(messagesToSend);
    setIsStreaming(true);
    setAiState('thinking');
    setThinkingStartTime(Date.now());
    setCurrentThinkingSteps([]);
    toolStepTimesRef.current = {};
    
    try {
      // Build comprehensive user context for AI
      const userContext = {
        savedCourses: savedCourses?.map(c => ({
          name: c.Courses?.name_course,
          code: c.Courses?.code,
          ects: c.Courses?.ects,
          level: c.Courses?.ba_ma
        })).filter(c => c.name) || [],
        savedLabs: savedLabs?.map(l => ({
          name: l.Labs?.name,
          topics: l.Labs?.topics
        })).filter(l => l.name) || [],
        savedPrograms: [],
        learningAgreements: [],
        emailDrafts: emailDrafts?.map(d => ({
          subject: d.subject,
          recipient: d.recipient
        })) || [],
        documents: documents?.map(d => d.name) || [],
        recentConversations: recentConversations?.slice(0, 5).map(c => ({
          title: c.title
        })) || [],
        profile: userProfile ? {
          country: userProfile.country,
          language: userProfile.language_preference,
        } : null,
        model: selectedModel,
      };

      const assistantMessageId = generateId();
      let assistantContent = "";
      const startTime = Date.now();

      // Add empty assistant message for streaming
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant" as const,
        content: "",
        timestamp: new Date()
      }]);

      await streamAIStudyAdvisor({
        messages: messagesToSend.map(m => ({ role: m.role, content: m.content })),
        userContext,
        model: selectedModel,
        onDelta: (() => {
          // Token buffer for word-by-word streaming
          let tokenBuffer = "";
          let displayedContent = "";
          let flushTimeout: ReturnType<typeof setTimeout> | null = null;
          
          const flushBuffer = () => {
            if (tokenBuffer.length > 0) {
              displayedContent += tokenBuffer;
              tokenBuffer = "";
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId ? { ...m, content: displayedContent } : m
              ));
            }
            flushTimeout = null;
          };
          
          return (delta: string) => {
            if (aiState !== 'streaming') setAiState('streaming');
            assistantContent += delta;
            tokenBuffer += delta;
            
            const shouldFlush = /[\s.,!?;:\n]$/.test(tokenBuffer) || tokenBuffer.length > 8;
            
            if (shouldFlush) {
              if (flushTimeout) clearTimeout(flushTimeout);
              flushBuffer();
            } else if (!flushTimeout) {
              flushTimeout = setTimeout(flushBuffer, 50);
            }
          };
        })(),
        onDone: () => {
          const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
          
          // Finalize any pending tool times
          const now = Date.now();
          const finalSteps: ThinkingStep[] = [];
          for (const [tool, toolStartTime] of Object.entries(toolStepTimesRef.current)) {
            finalSteps.push({
              tool,
              durationMs: now - toolStartTime
            });
          }
          
          setIsStreaming(false);
          setAiState('idle');
          setActiveSearchTools([]);
          setThinkingStartTime(null);
          setCurrentThinkingSteps([]);
          toolStepTimesRef.current = {};
          
          // Update assistant message with duration and steps
          setMessages(prev => prev.map(m => 
            m.id === assistantMessageId 
              ? { 
                  ...m, 
                  thoughtDurationSeconds: durationSeconds,
                  thinkingSteps: finalSteps.length > 0 ? finalSteps : undefined
                } 
              : m
          ));
        },
        onSearchingDatabase: (searching) => {
          if (searching) setAiState('searching');
        },
        onToolsUsed: (tools: string[]) => {
          setActiveSearchTools(tools);
          const now = Date.now();
          for (const tool of tools) {
            if (!toolStepTimesRef.current[tool]) {
              toolStepTimesRef.current[tool] = now;
            }
          }
        },
        onDeepPlanning: (planning) => {
          if (planning) setAiState('planning');
        }
      });
    } catch {
      setIsStreaming(false);
      setAiState('idle');
      setThinkingStartTime(null);
      toast.error("Failed to regenerate response");
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;

    const userMessageContent = input;
    const userMessage: Message = { 
      id: generateId(),
      role: "user", 
      content: userMessageContent, 
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      referencedItems: referencedItems.length > 0 ? [...referencedItems] : undefined,
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setAttachments([]);
    const currentReferencedItems = [...referencedItems]; // Capture before clearing
    setReferencedItems([]);
    setIsStreaming(true);
    setAiState('thinking');
    setThinkingStartTime(Date.now());
    setCurrentThinkingSteps([]);
    toolStepTimesRef.current = {};
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Create conversation on first message if none exists
      let conversationId = currentConversationId;
      if (!conversationId) {
        const title = userMessageContent.slice(0, 50) + (userMessageContent.length > 50 ? "..." : "");
        const conv = await createConversation.mutateAsync(title);
        conversationId = conv.id;
        setCurrentConversationId(conversationId);
        setIsNewChatMode(false); // Reset after creating conversation
      }

      // Save user message to database with attachments and references
      await saveMessage.mutateAsync({
        conversationId,
        role: "user",
        content: userMessageContent,
        attachments: userMessage.attachments as AIMessageAttachment[] | undefined,
        referencedItems: userMessage.referencedItems as AIMessageReferencedItem[] | undefined,
      });

      // Build comprehensive user context for AI with FULL details
      const userContext = {
        // Referenced items from drag-and-drop (prioritized context)
        referencedItems: currentReferencedItems.map(item => ({
          type: item.type,
          ...(item.type === 'course' ? {
            name: item.data.name,
            code: item.data.code,
            ects: item.data.ects,
            description: item.data.description,
            professor: item.data.professor
          } : {
            name: item.data.name,
            description: item.data.description,
            topics: item.data.topics
          })
        })),
        savedCourses: savedCourses?.map(c => ({
          name: c.Courses?.name_course,
          code: c.Courses?.code,
          ects: c.Courses?.ects,
          level: c.Courses?.ba_ma,
          description: c.Courses?.description,
          topics: c.Courses?.topics,
          professor: c.Courses?.professor_name
        })).filter(c => c.name) || [],
        savedLabs: savedLabs?.map(l => ({
          name: l.Labs?.name,
          topics: l.Labs?.topics,
          description: l.Labs?.description,
          professors: l.Labs?.professors,
          facultyMatch: l.Labs?.faculty_match,
          link: l.Labs?.link
        })).filter(l => l.name) || [],
        savedPrograms: [],
        emailDrafts: emailDrafts?.map(d => ({
          subject: d.subject,
          recipient: d.recipient,
          body: d.body
        })) || [],
        documents: documents?.map(d => ({
          name: d.name,
          url: d.file_url
        })) || [],
        recentConversations: recentConversations?.slice(0, 5).map(c => ({
          title: c.title
        })) || [],
        semesterPlans: savedSemesterPlans.map(plan => ({
          name: plan.name,
          semester_type: plan.semester_type,
          total_ects: plan.total_ects,
          courses: plan.courses
        })),
        profile: userProfile ? {
          country: userProfile.country,
          language: userProfile.language_preference,
        } : null,
        model: selectedModel,
      };

      const messagesForAI = newMessages.map(m => {
        let content = m.content;
        
        // Add referenced courses/labs metadata to the prompt
        if (m.referencedItems && m.referencedItems.length > 0) {
          content += "\n\n--- Referenced Items (User Context) ---\n";
          m.referencedItems.forEach(item => {
            if (item.type === 'course') {
              content += `\n[Course: ${item.data.code || item.data.name}]`;
              content += `\nName: ${item.data.name}`;
              if (item.data.code) content += `\nCode: ${item.data.code}`;
              if (item.data.ects) content += `\nECTS: ${item.data.ects}`;
              if (item.data.professor) content += `\nProfessor: ${item.data.professor}`;
              if (item.data.description) content += `\nDescription: ${item.data.description}`;
              content += '\n';
            } else {
              content += `\n[Lab: ${item.data.name}]`;
              content += `\nName: ${item.data.name}`;
              if (item.data.topics) content += `\nTopics: ${item.data.topics}`;
              if (item.data.description) content += `\nDescription: ${item.data.description}`;
              if (item.data.link) content += `\nWebsite: ${item.data.link}`;
              content += '\n';
            }
          });
        }
        
        // Add file attachments
        if (m.attachments && m.attachments.length > 0) {
          content += "\n\n--- Attached Files ---\n";
          m.attachments.forEach(a => {
            content += `\n[${a.name}]\n${a.content}\n`;
          });
        }
        
        return { role: m.role, content };
      });

      const assistantMessageId = generateId();
      let assistantContent = "";

      // Add empty assistant message for streaming
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant" as const,
        content: "",
        timestamp: new Date()
      }]);

      await streamAIStudyAdvisor({
        messages: messagesForAI,
        userContext,
        model: selectedModel,
        signal: abortControllerRef.current?.signal,
        onDelta: (() => {
          // Token buffer for word-by-word streaming
          let tokenBuffer = "";
          let displayedContent = "";
          let flushTimeout: ReturnType<typeof setTimeout> | null = null;
          
          const flushBuffer = () => {
            if (tokenBuffer.length > 0) {
              displayedContent += tokenBuffer;
              tokenBuffer = "";
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId ? { ...m, content: displayedContent } : m
              ));
            }
            flushTimeout = null;
          };
          
          return (delta: string) => {
            if (aiState !== 'streaming') setAiState('streaming');
            assistantContent += delta;
            tokenBuffer += delta;
            
            // Flush on word boundaries (space, newline, punctuation) or buffer limit
            const shouldFlush = /[\s.,!?;:\n]$/.test(tokenBuffer) || tokenBuffer.length > 8;
            
            if (shouldFlush) {
              if (flushTimeout) clearTimeout(flushTimeout);
              flushBuffer();
            } else if (!flushTimeout) {
              // Ensure we flush within 50ms even without word boundary
              flushTimeout = setTimeout(flushBuffer, 50);
            }
          };
        })(),
        onDone: async () => {
          // Calculate thought duration
          const durationSeconds = thinkingStartTime 
            ? Math.floor((Date.now() - thinkingStartTime) / 1000)
            : 0;
          
          // Finalize any pending tool times
          const now = Date.now();
          const finalSteps: ThinkingStep[] = [];
          for (const [tool, startTime] of Object.entries(toolStepTimesRef.current)) {
            finalSteps.push({
              tool,
              durationMs: now - startTime
            });
          }
          
          setIsStreaming(false);
          setAiState('idle');
          setActiveSearchTools([]);
          setThinkingStartTime(null);
          setCurrentThinkingSteps([]);
          toolStepTimesRef.current = {};
          abortControllerRef.current = null;
          
          // Update assistant message with duration and thinking steps
          setMessages(prev => prev.map(m => 
            m.id === assistantMessageId 
              ? { 
                  ...m, 
                  thoughtDurationSeconds: durationSeconds,
                  thinkingSteps: finalSteps.length > 0 ? finalSteps : undefined
                } 
              : m
          ));
          
          // Check for semester plan in response
          const parsedPlan = parseSemesterPlanFromResponse(assistantContent);
          if (parsedPlan) {
            setTempSemesterPlan(parsedPlan);
            toast.success("Semester plan generated! View it in the panel on the right.");
          }
          
          // Save assistant message to database after streaming is done
          if (conversationId && assistantContent) {
            await saveMessage.mutateAsync({
              conversationId,
              role: "assistant",
              content: assistantContent
            });
          }
        },
        onSearchingDatabase: (searching) => {
          if (searching) setAiState('searching');
        },
        onToolsUsed: (tools: string[]) => {
          setActiveSearchTools(tools);
          // Track timing for each tool
          const now = Date.now();
          for (const tool of tools) {
            if (!toolStepTimesRef.current[tool]) {
              toolStepTimesRef.current[tool] = now;
            }
          }
        },
        onDeepPlanning: (planning) => {
          if (planning) setAiState('planning');
        }
      });
    } catch (err) {
      setIsStreaming(false);
      setAiState('idle');
      setThinkingStartTime(null);
      abortControllerRef.current = null;
      if (err instanceof Error && err.name === 'AbortError') {
        // User stopped the request, don't show error
        return;
      }
      toast.error("Failed to get response from hubAI");
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    // Find the message and its index
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Update the message content
    const updatedMessages = messages.map((m, idx) => 
      idx === messageIndex ? { ...m, content: newContent } : m
    );
    
    // Remove all messages after the edited one (they'll be regenerated)
    const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);
    setMessages(messagesToKeep);
    setEditingMessageId(null);
    
    // If it's a user message, regenerate the response
    if (messages[messageIndex].role === "user") {
      toast.success("Message edited. Regenerating response...");
      await handleRegenerate(messageIndex);
    } else {
      toast.success("Message updated");
    }
  };

  const handleContinue = async () => {
    if (isStreaming || messages.length === 0) return;
    
    // Add a user message asking to continue
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: "Please continue your previous response.",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Then send it like a normal message
    setTimeout(() => handleSend(), 100);
  };

  const selectedModelData = models.find(m => m.id === selectedModel)!;


  // Handle export
  const handleExport = (format: 'markdown' | 'text' | 'json' | 'pdf') => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }
    const title = recentConversations?.find(c => c.id === currentConversationId)?.title;
    exportConversation(messages, format, title || undefined);
    toast.success(`Conversation exported as ${format.toUpperCase()}`);
  };

  // Handle email compose submission - generates email via AI in chat
  const handleEmailComposeSubmit = async (data: EmailComposeData) => {
    setShowEmailCompose(false);
    
    // Build the email generation prompt
    let prompt = `Generate a professional email for me.\n\n`;
    prompt += `**Purpose:** ${data.purpose}\n`;
    prompt += `**Recipient:** ${data.recipientName}\n`;
    
    if (data.context) {
      prompt += `**Additional context:** ${data.context}\n`;
    }
    
    // Documents: don't try to fetch PDFs on the client (binary). Instead, instruct the AI to use its
    // get_document_content tool (implemented in the ai-study-advisor function).
    if (data.selectedDocs.length > 0) {
      prompt += `\n**My documents (IMPORTANT):**\n`;
      prompt += `Use the tool get_document_content for EACH document below (by name) and extract my name, background, interests, and skills.\n`;
      data.selectedDocs.forEach((doc) => {
        prompt += `- ${doc.name}\n`;
      });
    }
    
    if (data.selectedCourses.length > 0) {
      prompt += `\n**Relevant courses I'm taking:**\n`;
      data.selectedCourses.forEach(c => {
        prompt += `- ${c?.code || ''} ${c?.name_course || ''}${c?.ects ? ` (${c.ects} ECTS)` : ''}\n`;
      });
    }
    
    if (data.selectedLabs.length > 0) {
      prompt += `\n**Labs I'm interested in:**\n`;
      data.selectedLabs.forEach(l => {
        prompt += `- ${l?.name || ''}${l?.slug ? ` (${l.slug})` : ''}\n`;
      });
    }
    
    if (data.teacherInfo) {
      prompt += `\n**About the recipient:**\n`;
      if (data.teacherInfo.topics && data.teacherInfo.topics.length > 0) {
        prompt += `Research topics: ${data.teacherInfo.topics.join(', ')}\n`;
      }
    }
    
    prompt += `\nPlease write the complete email with subject line and body. Format it clearly with "**Subject:**" on the first line, then a blank line, then the email body.`;
    prompt += `\n\nAfter generating the email, I'll be able to:
- Copy it to clipboard
- Open it in my email client (Gmail, Outlook, etc.)
- Edit it directly
- Select any part to refine with AI`;
    
    // Set the input and send
    setInput(prompt);
    
    // Trigger send after a brief delay to ensure state is updated
    setTimeout(() => {
      const sendButton = document.querySelector('[data-send-button]') as HTMLButtonElement;
      if (sendButton) sendButton.click();
    }, 100);
  };


  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <WorkbenchSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onComposeEmail={() => {
          handleNewChat();
          setShowEmailCompose(true);
        }}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onReferenceCourse={handleReferenceCourse}
        onReferenceLab={handleReferenceLab}
        onReferenceDocument={handleReferenceDocument}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar - Thin, transparent like Gemini */}
        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-background/40 backdrop-blur-sm z-10">
          {/* Left side - Panda AI branding + model selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent/50"
                onClick={() => setSidebarOpen(true)}
                data-tour="sidebar-toggle"
              >
                <PanelLeft className="h-4 w-4 text-foreground/70" />
              </Button>
            )}
            
            {/* Panda AI Logo + Name */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <PandaIconSimple size={isMobile ? 22 : 26} className="text-primary" />
              <span className="font-semibold text-sm sm:text-base text-foreground/90 hidden sm:inline">pandanAI</span>
            </div>

            {/* Model Selector - minimal liquid glass style */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="gap-1 sm:gap-1.5 bg-accent/30 hover:bg-accent/50 backdrop-blur-md rounded-full px-2 sm:px-3 h-7 sm:h-8 border-0 shadow-sm"
                  data-tour="model-selector"
                >
                  <span className="text-primary">{selectedModelData.icon}</span>
                  <span className="text-xs sm:text-sm text-foreground/70">{selectedModelData.name}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-card/95 backdrop-blur-md border-border/50">
                {/* Perplexity Models Only */}
                <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                  <img src={providerInfo.perplexity.logo} alt="Perplexity" className="h-3.5 w-3.5" />
                  {providerInfo.perplexity.name}
                </DropdownMenuLabel>
                {displayModels.map(model => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className="flex items-center gap-2 p-2 cursor-pointer"
                  >
                    <div className="text-primary">{model.icon}</div>
                    <div className="flex-1">
                      <span className="text-sm">{model.name}</span>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                    {selectedModel === model.id && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side - action buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Semester Planner Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-accent/30"
              onClick={togglePlanner}
              title={isPlannerOpen ? "Hide Semester Planner" : "Show Semester Planner"}
            >
              <CalendarDays className={`h-4 w-4 sm:h-5 sm:w-5 ${isPlannerOpen ? 'text-primary' : 'text-foreground/50'}`} />
            </Button>
          
            {/* Search button - hide on mobile */}
            {messages.length > 0 && !isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
                onClick={openSearch}
                title="Search in conversation (Ctrl+F)"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
            
            {/* Compose Email Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:from-primary/20 hover:to-accent/20 h-8 sm:h-9 px-2 sm:px-4"
              onClick={() => {
                handleNewChat();
                setShowEmailCompose(true);
              }}
              data-tour="compose-email-btn"
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-sm">Compose</span>
            </Button>
            
            {/* Document Context Indicator - hide on mobile */}
            {attachments.length > 0 && !isMobile && (
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <Paperclip className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-500" />
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium hidden sm:inline">
                  {attachments.length} doc{attachments.length > 1 ? 's' : ''} attached
                </span>
              </div>
            )}
          </div>
        </div>
      
      {/* Conversation Search Bar */}
      <ConversationSearchBar
        isOpen={isSearchOpen}
        searchQuery={convSearchQuery}
        onSearchChange={setConvSearchQuery}
        onClose={closeSearch}
        results={searchResults}
        activeResultIndex={activeResultIndex}
        onNextResult={goToNextResult}
        onPrevResult={goToPrevResult}
        onResultClick={scrollToMessage}
      />

      {/* Chat Area - Only this scrolls, centered content like ChatGPT */}
      <ScrollArea className="flex-1 min-h-0 relative [&>div>div]:!block" ref={scrollRef}>
        <div className="py-6 sm:py-10 space-y-6 mx-auto w-full max-w-3xl px-4 sm:px-6">
          {/* Email Compose Form - shows when composing email */}
          {showEmailCompose && messages.length === 0 && (
            <EmailComposeInChat
              onSubmit={handleEmailComposeSubmit}
              onCancel={() => setShowEmailCompose(false)}
            />
          )}
          
          
          {messages.length === 0 && !showEmailCompose ? (
            <div className="flex flex-col items-center justify-end min-h-[40vh] text-center px-4 pb-4">
              <p className="text-foreground/70 dark:text-muted-foreground max-w-md mb-4 leading-relaxed">
                Answering any question about your academic journey, such as:
              </p>
              
              {/* Suggestion Cards - hidden on mobile */}
              <div className="hidden md:grid md:grid-cols-3 gap-3 w-full max-w-3xl">
                {[
                  { text: "Help me choose courses for next semester, my interests are...", icon: "📚" },
                  { text: "Find EPFL labs in computer science focused on...", icon: "🔬" },
                  { text: "Help me find Mechanical Engineering courses requiring Python", icon: "📝" }
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="group flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 text-left"
                    onClick={() => setInput(suggestion.text)}
                  >
                    <span className="text-xl">{suggestion.icon}</span>
                    <span className="text-sm text-foreground/70 dark:text-foreground/80 group-hover:text-foreground transition-colors">
                      {suggestion.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, idx) => (
                <div 
                  key={message.id} 
                  data-message-index={idx}
                  className={`group animate-in fade-in-0 slide-in-from-bottom-2 duration-300 transition-all ${
                    isMobile ? '' : ''
                  }`}
                >
                  {/* Desktop: ChatGPT-style document reading layout */}
                  {/* Mobile: WhatsApp-style bubbles */}
                  <div className={`flex gap-3 ${
                    isMobile 
                      ? (message.role === "user" ? "flex-row-reverse" : "") 
                      : ""
                  }`}>
                    {/* Avatar - only on mobile for user, always for assistant */}
                    {(message.role === "assistant" || isMobile) && (
                      message.role === "assistant" ? (
                        <Avatar className={`h-9 w-9 shrink-0 ${isMobile ? '' : 'mt-1'}`}>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <PandaIconSimple size={20} />
                          </AvatarFallback>
                        </Avatar>
                      ) : isMobile ? (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={userProfile?.profile_photo_url || ""} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                            {userProfile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : null
                    )}

                    {/* Message Content */}
                    <div className={`flex-1 min-w-0 ${
                      isMobile 
                        ? `max-w-[80%] ${message.role === "user" ? "text-right" : ""}` 
                        : "max-w-none"
                    }`}>
                      <div
                        className={`group/bubble relative ${
                          isMobile 
                            ? `inline-block rounded-2xl px-4 py-2.5 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                                  : "bg-card border border-border/30 text-foreground rounded-tl-sm"
                              }`
                            : `${
                                message.role === "user"
                                  ? "bg-accent/30 rounded-xl px-4 py-3 border border-border/20"
                                  : "py-2"
                              }`
                        }`}
                      >
                        {/* Attachments indicator */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {message.attachments.map((a) => (
                              <AttachmentPreview
                                key={a.id}
                                name={a.name}
                                type={a.type}
                                content={a.content}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Referenced Courses & Labs indicator */}
                        {message.referencedItems && message.referencedItems.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {message.referencedItems.map((item, itemIdx) => (
                              <div
                                key={`${item.type}-${item.data.id || itemIdx}`}
                                className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2"
                              >
                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                                  item.type === 'course' 
                                    ? 'bg-blue-500/20' 
                                    : 'bg-emerald-500/20'
                                }`}>
                                  {item.type === 'course' ? (
                                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <Beaker className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">
                                    {item.data.code ? `${item.data.code} - ` : ''}{item.data.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {item.type === 'course' 
                                      ? `${item.data.ects ? `${item.data.ects} ECTS` : 'Course'}${item.data.professor ? ` • ${item.data.professor}` : ''}`
                                      : `Research Lab${item.data.topics ? ` • ${item.data.topics.slice(0, 50)}...` : ''}`
                                    }
                                  </div>
                                </div>
                                {item.type === 'course' ? (
                                  <BookOpen className="h-4 w-4 text-primary/50" />
                                ) : (
                                  <Beaker className="h-4 w-4 text-primary/50" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {message.role === "assistant" ? (
                          <>
                            <MarkdownRenderer content={message.content.replace(/<!--(COURSES|LABS|SEMESTERPLAN):.*?-->/gs, '')} />
                            <AIResultCards content={message.content} />
                          </>
                        ) : (
                          <EditableMessage
                            content={message.content}
                            isEditing={editingMessageId === message.id}
                            onSave={(newContent) => handleEditMessage(message.id, newContent)}
                            onCancel={() => setEditingMessageId(null)}
                          />
                        )}
                        
                        {/* User Message Actions - Edit and Copy */}
                        {message.role === "user" && message.content && !editingMessageId && (
                          <div className="absolute -bottom-1 -left-1 flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-accent/80 bg-background/90 border border-border/50 shadow-sm"
                              onClick={() => setEditingMessageId(message.id)}
                              disabled={isStreaming}
                              title="Edit message"
                            >
                              <Edit3 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-accent/80 bg-background/90 border border-border/50 shadow-sm"
                              onClick={() => handleCopy(message.content, message.id)}
                              title="Copy message"
                            >
                              {copiedId === message.id ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Message Actions - Assistant Only (outside bubble) */}
                      {message.role === "assistant" && message.content && (
                        <div className="flex flex-col gap-1 mt-2">
                          {/* Thinking History - always show for assistant messages */}
                          <ThinkingHistory
                            totalDurationSeconds={message.thoughtDurationSeconds || 0}
                            steps={message.thinkingSteps || []}
                          />
                          
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-accent/50"
                            onClick={() => handleCopy(message.content, message.id)}
                          >
                            {copiedId === message.id ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-accent/50"
                            onClick={() => handleRegenerate(idx)}
                            disabled={isStreaming}
                            title="Regenerate response"
                          >
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          {/* Continue button - show if message is the last one and might be incomplete */}
                          {idx === messages.length - 1 && message.content.length > 200 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 rounded-lg hover:bg-accent/50"
                              onClick={handleContinue}
                              disabled={isStreaming}
                              title="Continue generation"
                            >
                              <ArrowDown className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">Continue</span>
                            </Button>
                          )}
                          {/* Save to Email Drafts - show if message looks like an email */}
                          {(message.content.toLowerCase().includes('subject:') || 
                            message.content.toLowerCase().includes('dear ') ||
                            message.content.toLowerCase().includes('email')) && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg hover:bg-accent/50"
                                title="Copy email content"
                                onClick={() => {
                                  // Extract just the email part (after Subject: line)
                                  const emailContent = message.content.replace(/<!--[\s\S]*?-->/g, '').trim();
                                  navigator.clipboard.writeText(emailContent);
                                  toast.success("Email copied to clipboard");
                                }}
                              >
                                <Copy className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg hover:bg-accent/50"
                                title="Open in email client"
                                onClick={() => {
                                  const content = message.content.replace(/<!--[\s\S]*?-->/g, '').trim();
                                  // Try to extract subject
                                  const subjectMatch = content.match(/\*?\*?Subject:\*?\*?\s*(.+?)(?:\n|$)/i);
                                  const subject = subjectMatch ? subjectMatch[1].trim() : 'Email';
                                  // Get body (everything after subject line)
                                  const bodyStart = content.indexOf('\n', content.toLowerCase().indexOf('subject:'));
                                  const body = bodyStart > -1 ? content.substring(bodyStart).trim() : content;
                                  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                                }}
                              >
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg hover:bg-accent/50"
                                title="Save to Email Drafts"
                                onClick={async () => {
                                  const content = message.content.replace(/<!--[\s\S]*?-->/g, '').trim();
                                  const subjectMatch = content.match(/\*?\*?Subject:\*?\*?\s*(.+?)(?:\n|$)/i);
                                  await createEmailDraft.mutateAsync({
                                    subject: subjectMatch ? subjectMatch[1].trim() : "AI Generated Email",
                                    body: content,
                                    recipient: "",
                                  });
                                  toast.success("Email saved to drafts");
                                }}
                              >
                                <Mail className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg hover:bg-accent/50"
                            onClick={async () => {
                              await messageFeedback.mutateAsync({ 
                                messageId: message.id, 
                                feedback: "positive" 
                              });
                              toast.success("Thanks for your feedback!");
                            }}
                          >
                            <ThumbsUp 
                              className={`h-4 w-4 ${message.feedback === "positive" ? "text-emerald-500 fill-emerald-500" : "text-muted-foreground"}`} 
                            />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg hover:bg-accent/50"
                            onClick={async () => {
                              await messageFeedback.mutateAsync({ 
                                messageId: message.id, 
                                feedback: "negative" 
                              });
                              toast.success("Thanks for your feedback!");
                            }}
                          >
                            <ThumbsDown 
                              className={`h-4 w-4 ${message.feedback === "negative" ? "text-red-500 fill-red-500" : "text-muted-foreground"}`} 
                            />
                          </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Thinking Indicator (before any streaming starts) */}
              {/* Only show if thinking AND no empty assistant message is already displayed */}
              {aiState === 'thinking' && !messages.some(m => m.role === "assistant" && !m.content) && (
                <ThinkingIndicator 
                  mode="thinking"
                  startTime={thinkingStartTime || undefined}
                />
              )}

              {/* Database Searching Indicator */}
              {aiState === 'searching' && (
                <ThinkingIndicator 
                  mode="searching"
                  searchTools={activeSearchTools}
                  isCollapsible={true}
                  isExpanded={thinkingExpanded}
                  onToggleExpand={() => setThinkingExpanded(!thinkingExpanded)}
                  startTime={thinkingStartTime || undefined}
                />
              )}
              
              {/* Deep Planning Indicator (like ChatGPT deep think) */}
              {aiState === 'planning' && (
                <ThinkingIndicator 
                  mode="planning"
                  isCollapsible={true}
                  isExpanded={thinkingExpanded}
                  onToggleExpand={() => setThinkingExpanded(!thinkingExpanded)}
                  startTime={thinkingStartTime || undefined}
                />
              )}
            </>
          )}
        </div>
        
        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 shadow-lg border border-border/50 bg-card/95 backdrop-blur-md hover:bg-accent"
              onClick={() => scrollToBottom("smooth")}
            >
              <ArrowDown className="h-4 w-4" />
              Scroll to bottom
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Input Area - Fixed at bottom, centered like ChatGPT */}
      <div 
        ref={inputAreaRef}
        className={`flex-shrink-0 bg-transparent p-3 sm:p-4 transition-all duration-300 ${
          isDragOver 
            ? 'bg-primary/5' 
            : ''
        }`}
        style={{ 
          paddingBottom: `max(env(safe-area-inset-bottom), 16px)`,
          position: 'sticky',
          bottom: 0
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="mx-auto max-w-3xl">
        {/* Animated drop zone indicator */}
        {isDragOver && (
          <div className="mb-3 p-4 border-2 border-dashed border-primary rounded-xl bg-primary/10 text-center animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-5 w-5 text-primary animate-bounce" />
              <p className="text-sm font-medium text-primary">Drop to add as context</p>
              <Beaker className="h-5 w-5 text-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
            </div>
            <p className="text-xs text-primary/70 mt-1">The AI will reference these items in its response</p>
          </div>
        )}

        {/* Referenced Items (Context Chips) with count summary */}
        {referencedItems.length > 0 && (
          <div className="mb-3">
            {/* Summary badge when multiple items */}
            {referencedItems.length > 1 && (
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {referencedItems.length} items referenced
                </span>
                <span className="text-xs text-muted-foreground">
                  ({referencedItems.filter(i => i.type === 'course').length} courses, {referencedItems.filter(i => i.type === 'lab').length} labs)
                </span>
                <button
                  onClick={() => setReferencedItems([])}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {referencedItems.map((item, index) => (
                <div
                  key={`${item.type}-${item.data.id || index}`}
                  className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-1.5 text-sm animate-scale-in"
                >
                  {item.type === 'course' ? (
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Beaker className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className="max-w-40 truncate text-foreground font-medium">
                    {item.data.code || item.data.name}
                  </span>
                  <button
                    onClick={() => removeReferencedItem(index)}
                    className="text-primary/70 hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 bg-accent/50 border border-border/50 rounded-lg px-3 py-1.5 text-sm"
              >
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="max-w-32 truncate text-foreground">{attachment.name}</span>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ChatGPT-style pill input */}
        <div className="relative bg-card/80 dark:bg-card/60 backdrop-blur-md rounded-3xl border border-border/40 shadow-lg">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.json,.csv,.pdf,.docx,.png,.jpg,.jpeg,.gif,.webp,text/*,application/json,application/pdf,image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Main input area */}
          <div className="relative">
            {/* Mention Popup */}
            <MentionPopup
              isOpen={showMentionPopup}
              onClose={() => setShowMentionPopup(false)}
              onSelect={handleMentionSelect}
              courses={mentionCourses}
              labs={mentionLabs}
              searchQuery={mentionSearchQuery}
            />
            
            <Textarea
              ref={inputRef}
              placeholder="Use @ to mention saved courses/labs..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !showMentionPopup) {
                  e.preventDefault();
                  handleSend();
                }
                if (e.key === "Escape" && showMentionPopup) {
                  setShowMentionPopup(false);
                }
              }}
              disabled={isStreaming}
              className="w-full bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[52px] max-h-[200px] py-4 px-4 pr-14 text-base placeholder:text-muted-foreground/60 overflow-y-auto"
              rows={1}
              aria-label="Message input"
              aria-describedby="input-hint"
              data-tour="chat-input"
            />
            
            {/* Send button - inside input on right */}
            <div className="absolute right-3 bottom-2 flex items-center">
              {isStreaming ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive"
                  onClick={handleStop}
                  title="Stop generating"
                  aria-label="Stop generating response"
                >
                  <Square className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  data-send-button
                  className="h-9 w-9 rounded-full transition-all"
                  onClick={handleSend}
                  disabled={!input.trim() && attachments.length === 0}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Bottom toolbar inside pill */}
          <div className="flex items-center gap-1 px-3 pb-3 pt-0">
            {/* Plus button with dropdown for attach/export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-accent/50"
                  disabled={isStreaming}
                >
                  <span className="text-xl font-light text-muted-foreground">+</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach file
                </DropdownMenuItem>
                {messages.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs">Export conversation</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleExport('markdown')} className="cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      Markdown (.md)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('text')} className="cursor-pointer">
                      <FileDown className="h-4 w-4 mr-2" />
                      Plain Text (.txt)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('json')} className="cursor-pointer">
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON (.json)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
                      <FileType className="h-4 w-4 mr-2" />
                      PDF (.pdf)
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-[10px] sm:text-xs text-center text-foreground/40 dark:text-muted-foreground/60 mt-2">
          AI can make mistakes. Consider checking important information.
        </p>
        </div>
      </div>
      </div>
      {/* Diary Panel */}
      <WorkbenchDiary
        isOpen={isPlannerOpen}
        onToggle={togglePlanner}
        savedPlans={savedSemesterPlans}
        tempPlan={tempPlan}
        onSaveTempPlan={async (name, winterCourses, summerCourses) => {
          await saveAIPlan.mutateAsync({ name, winterCourses, summerCourses });
          clearTempPlan();
        }}
        onClearTempPlan={clearTempPlan}
        onDeletePlan={(planId) => deleteSemesterPlan.mutate(planId)}
        onUpdatePlanName={(planId, newName) => updateSemesterPlan.mutate({ id: planId, name: newName })}
        onRemoveCourseFromPlan={(planId, courseId) => {
          const plan = savedSemesterPlans.find(p => p.id === planId);
          if (plan) {
            const updatedCourses = plan.courses.filter(c => c.id_course !== courseId);
            updateSemesterPlan.mutate({ id: planId, courses: updatedCourses });
          }
        }}
        savedCourses={savedCourses?.map(c => ({
          id_course: c.Courses?.id_course || '',
          name_course: c.Courses?.name_course || '',
          code: c.Courses?.code || undefined,
          ects: c.Courses?.ects || undefined,
          type_exam: c.Courses?.type_exam || undefined,
          ba_ma: c.Courses?.ba_ma || undefined,
          professor_name: c.Courses?.professor_name || undefined,
          term: c.Courses?.term || undefined
        })).filter(c => c.id_course) || []}
      />
      
      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
};

export default Workbench;
