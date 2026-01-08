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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkbenchSidebar } from "@/components/WorkbenchSidebar";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AIResultCards } from "@/components/AIResultCard";
import { KeyboardShortcutsHelp, useKeyboardShortcuts } from "@/components/KeyboardShortcutsHelp";
import { ConversationSearchBar } from "@/components/ConversationSearchBar";
import { MentionPopup } from "@/components/MentionPopup";
import { EmailComposeInChat, EmailComposeData } from "@/components/EmailComposeInChat";
import { WorkbenchSemesterPlanner } from "@/components/workbench/WorkbenchSemesterPlanner";
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
  GraduationCap,
  PanelLeft,
  Database,
  Search,
  Download,
  FileText,
  FileJson,
  FileDown,
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
}

type ModelType = "gemini-flash" | "gemini-pro" | "gpt-5" | "gpt-5-mini" | "sonar" | "sonar-pro" | "sonar-reasoning";

type ProviderType = "gemini" | "openai" | "perplexity";

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
    logo: "https://pbs.twimg.com/profile_images/1798110641414443008/XP8gyBaY_400x400.jpg"
  }
};

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
  const [selectedModel, setSelectedModel] = useState<ModelType>("gemini-flash");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSearchingDatabase, setIsSearchingDatabase] = useState(false);
  const [activeSearchTools, setActiveSearchTools] = useState<string[]>([]);
  const [referencedItems, setReferencedItems] = useState<Array<{ type: 'course' | 'lab'; data: any }>>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");
  const [mentionCursorPosition, setMentionCursorPosition] = useState(0);
  const [showEmailCompose, setShowEmailCompose] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showRefinePopup, setShowRefinePopup] = useState(false);
  const [refinePopupPosition, setRefinePopupPosition] = useState({ x: 0, y: 0 });
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  // Track if user explicitly started a new chat - default to true so we always start fresh
  const [isNewChatMode, setIsNewChatMode] = useState(true);

  // When opening workbench, always start with a new chat (no auto-load of previous conversations)

  // Load messages when switching conversations (including attachments & references)
  useEffect(() => {
    if (loadedMessages && loadedMessages.length > 0) {
      setMessages(loadedMessages.map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        attachments: m.attachments as Attachment[] | undefined,
        referencedItems: m.referenced_items as ReferencedItem[] | undefined,
        timestamp: new Date(m.created_at)
      })));
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
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
      setIsThinking(false);
      setIsSearchingDatabase(false);
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
  }, [messages, isStreaming, isThinking, scrollToBottom]);

  // Handle text selection for refinement - MUST be before early return
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 10) {
      const text = selection.toString().trim();
      setSelectedText(text);
      
      // Get position for popup
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setRefinePopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowRefinePopup(true);
    } else {
      setShowRefinePopup(false);
      setSelectedText("");
    }
  }, []);

  // Add mouseup listener for text selection - MUST be before early return
  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [handleTextSelection]);

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
          setIsStreaming(false);
          setIsSearchingDatabase(false);
          setActiveSearchTools([]);
        },
        onSearchingDatabase: setIsSearchingDatabase,
        onToolsUsed: setActiveSearchTools
      });
    } catch {
      setIsStreaming(false);
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
    setIsThinking(true);
    
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
            setIsThinking(false);
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
          setIsStreaming(false);
          setIsThinking(false);
          setIsSearchingDatabase(false);
          setActiveSearchTools([]);
          abortControllerRef.current = null;
          
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
          setIsSearchingDatabase(searching);
          if (searching) setIsThinking(false);
        },
        onToolsUsed: setActiveSearchTools
      });
    } catch (err) {
      setIsStreaming(false);
      setIsThinking(false);
      abortControllerRef.current = null;
      if (err instanceof Error && err.name === 'AbortError') {
        // User stopped the request, don't show error
        return;
      }
      toast.error("Failed to get response from hubAI");
    }
  };

  const selectedModelData = models.find(m => m.id === selectedModel)!;


  // Handle export
  const handleExport = (format: 'markdown' | 'text' | 'json') => {
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
        prompt += `- ${c?.code || ''} ${c?.name_course || ''}\n`;
      });
    }
    
    if (data.selectedLabs.length > 0) {
      prompt += `\n**Labs I'm interested in:**\n`;
      data.selectedLabs.forEach(l => {
        prompt += `- ${l?.name || ''}\n`;
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

  // Handle refine request (plain function - no hooks)
  const handleRefineText = () => {
    if (!selectedText) return;
    
    const refinePrompt = `Please refine this part of the email:\n\n"${selectedText}"\n\nMake it more professional and polished while keeping the same meaning.`;
    setInput(refinePrompt);
    setShowRefinePopup(false);
    setSelectedText("");
    
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-transparent sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground/80 dark:text-foreground leading-none">hubAI</h1>
            </div>
          </div>

        {/* Model Selector with Provider Groups */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 border-border bg-transparent hover:bg-accent/30 transition-all text-foreground/70 dark:text-foreground"
            >
              <span className="text-primary">{selectedModelData.icon}</span>
              <span className="hidden sm:inline text-sm">{selectedModelData.name}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {/* Google Gemini Models */}
            <DropdownMenuLabel className="flex items-center gap-2">
              <img src={providerInfo.gemini.logo} alt="Gemini" className="h-4 w-4" />
              {providerInfo.gemini.name}
            </DropdownMenuLabel>
            {models.filter(m => m.provider === "gemini").map(model => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className="flex items-start gap-3 p-3 cursor-pointer"
              >
                <div className="mt-0.5 text-primary">{model.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs opacity-70">{model.description}</div>
                </div>
                {selectedModel === model.id && (
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                )}
              </DropdownMenuItem>
            ))}
            
            {/* OpenAI Models */}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2">
              <img src={providerInfo.openai.logo} alt="OpenAI" className="h-4 w-4" />
              {providerInfo.openai.name}
            </DropdownMenuLabel>
            {models.filter(m => m.provider === "openai").map(model => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className="flex items-start gap-3 p-3 cursor-pointer"
              >
                <div className="mt-0.5 text-primary">{model.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs opacity-70">{model.description}</div>
                </div>
                {selectedModel === model.id && (
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                )}
              </DropdownMenuItem>
            ))}
            
            {/* Perplexity Models */}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2">
              <img src={providerInfo.perplexity.logo} alt="Perplexity" className="h-4 w-4" />
              {providerInfo.perplexity.name}
            </DropdownMenuLabel>
            {models.filter(m => m.provider === "perplexity").map(model => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className="flex items-start gap-3 p-3 cursor-pointer"
              >
                <div className="mt-0.5 text-primary">{model.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs opacity-70">{model.description}</div>
                </div>
                {selectedModel === model.id && (
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

          {/* Semester Planner Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-accent/30"
            onClick={togglePlanner}
            title={isPlannerOpen ? "Hide Semester Planner" : "Show Semester Planner"}
          >
            <CalendarDays className={`h-5 w-5 ${isPlannerOpen ? 'text-primary' : 'text-foreground/50'}`} />
          </Button>
        
        {/* Search button */}
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
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
          className="gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:from-primary/20 hover:to-accent/20"
          onClick={() => {
            handleNewChat();
            setShowEmailCompose(true);
          }}
        >
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Compose Email</span>
        </Button>
        
        {/* Document Context Indicator */}
        {attachments.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Paperclip className="h-3.5 w-3.5 text-cyan-500" />
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
              {attachments.length} doc{attachments.length > 1 ? 's' : ''} attached
            </span>
          </div>
        )}
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

      {/* Chat Area */}
      <ScrollArea className="flex-1 px-4 relative" ref={scrollRef}>
        <div className="py-8 space-y-6">
          {/* Email Compose Form - shows when composing email */}
          {showEmailCompose && messages.length === 0 && (
            <EmailComposeInChat
              onSubmit={handleEmailComposeSubmit}
              onCancel={() => setShowEmailCompose(false)}
            />
          )}
          
          {/* Text Selection Refine Popup */}
          {showRefinePopup && selectedText && (
            <div 
              className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-150"
              style={{ 
                left: refinePopupPosition.x, 
                top: refinePopupPosition.y,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <Button
                size="sm"
                className="gap-1.5 shadow-lg"
                onClick={handleRefineText}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Refine with AI
              </Button>
            </div>
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
                  className="group animate-in fade-in-0 slide-in-from-bottom-2 duration-300 transition-all rounded-lg"
                >
                  <div className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    {message.role === "assistant" ? (
                      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20 shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-border shadow-sm">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Message Content */}
                    <div className={`flex-1 max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
                      <div
                        className={`inline-block rounded-2xl px-4 py-3 shadow-sm ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-md"
                            : "bg-card border border-border/50 text-foreground rounded-tl-md"
                        }`}
                      >
                        {/* Attachments indicator */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {message.attachments.map((a) => (
                              <div
                                key={a.id}
                                className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2"
                              >
                                <div className="h-9 w-9 rounded-lg bg-accent/40 flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">{a.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {(a.type || "file").toString().toUpperCase()}
                                  </div>
                                </div>
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                              </div>
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
                            <MarkdownRenderer content={message.content.replace(/<!--(COURSES|LABS):.*?-->/gs, '')} />
                            <AIResultCards content={message.content} />
                          </>
                        ) : (
                          <p className="whitespace-pre-wrap text-left leading-relaxed">{message.content}</p>
                        )}
                      </div>

                      {/* Message Actions */}
                      {message.role === "assistant" && message.content && (
                        <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
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
                          >
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                          </Button>
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
                                  let emailContent = message.content.replace(/<!--[\s\S]*?-->/g, '').trim();
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
                                  let content = message.content.replace(/<!--[\s\S]*?-->/g, '').trim();
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent/50">
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent/50">
                            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Thinking Indicator (before any streaming starts) */}
              {isThinking && !isSearchingDatabase && (
                <div className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20 shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-card border border-border/50 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}

              {/* Database Searching Indicator */}
              {isSearchingDatabase && (
                <div className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20 shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-card border border-border/50 shadow-sm">
                    <Database className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      {activeSearchTools.length > 0 
                        ? `Searching ${activeSearchTools.map(formatToolName).join(', ')}...`
                        : 'Searching database...'}
                    </span>
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  </div>
                </div>
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
              className="gap-2 shadow-lg border border-border/50 bg-card/95 backdrop-blur-sm hover:bg-accent"
              onClick={() => scrollToBottom("smooth")}
            >
              <ArrowDown className="h-4 w-4" />
              Scroll to bottom
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Input Area - Fixed bottom with animated drop zone */}
      <div 
        ref={inputAreaRef}
        className={`border-t border-border/50 bg-transparent p-4 transition-all duration-300 ${
          isDragOver 
            ? 'bg-primary/10 border-primary shadow-[0_-4px_24px_-4px_rgba(var(--primary),0.25)] scale-[1.01]' 
            : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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

        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.json,.csv,.pdf,.docx,.png,.jpg,.jpeg,.gif,.webp,text/*,application/json,application/pdf,image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-11 w-11 rounded-xl bg-transparent hover:bg-accent/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
          >
            <Paperclip className="h-5 w-5 text-foreground/50 dark:text-muted-foreground" />
          </Button>


          {/* Export Button */}
          {messages.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-11 w-11 rounded-xl bg-transparent hover:bg-accent/30 transition-colors"
                  disabled={isStreaming}
                  title="Export conversation"
                >
                  <Download className="h-5 w-5 text-foreground/50 dark:text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Export as</DropdownMenuLabel>
                <DropdownMenuSeparator />
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
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Text Input */}
          <div className="flex-1 relative">
            {/* Mention Popup */}
            <MentionPopup
              isOpen={showMentionPopup}
              onClose={() => setShowMentionPopup(false)}
              onSelect={handleMentionSelect}
              courses={mentionCourses}
              labs={mentionLabs}
              searchQuery={mentionSearchQuery}
            />
            
            <Input
              ref={inputRef}
              placeholder="Message hubAI... (type @ to mention courses/labs)"
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
              className="pr-14 py-6 rounded-xl border bg-transparent focus:border-primary/50 transition-all placeholder:text-foreground/40 dark:placeholder:text-muted-foreground border-foreground/20 dark:border-border"
            />
            {isStreaming ? (
              <Button
                size="icon"
                variant="destructive"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg transition-colors"
                onClick={handleStop}
                title="Stop generating"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                data-send-button
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg transition-colors"
                onClick={handleSend}
                disabled={!input.trim() && attachments.length === 0}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>


        <div className="flex flex-col items-center gap-2 mt-3">
          <p className="text-xs text-foreground/40 dark:text-muted-foreground/70">
            hubAI can make mistakes. Consider checking important information.
          </p>
          
          {/* Powered By Section */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <span>Powered by</span>
            <div className="flex items-center gap-1.5">
              <img src={providerInfo.gemini.logo} alt="Gemini" className="h-4 w-4" />
              <span className="font-medium">Gemini</span>
            </div>
            <div className="flex items-center gap-1.5">
              <img src={providerInfo.openai.logo} alt="ChatGPT" className="h-4 w-4" />
              <span className="font-medium">ChatGPT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <img src={providerInfo.perplexity.logo} alt="Perplexity" className="h-4 w-4" />
              <span className="font-medium">Perplexity</span>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Semester Planner Panel */}
      <WorkbenchSemesterPlanner
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
