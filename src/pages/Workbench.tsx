import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { streamAIStudyAdvisor } from "@/hooks/useAI";
import { useSavedCourses, useSavedLabs, useSavedPrograms } from "@/hooks/useSavedItems";
import { useLearningAgreements } from "@/hooks/useLearningAgreements";
import { useEmailDrafts } from "@/hooks/useEmailDrafts";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { useUserProfile } from "@/hooks/useUserProfile";
import { 
  useAIMessages, 
  useCreateConversation, 
  useSaveMessage, 
  useUpdateConversation,
  useAIConversations 
} from "@/hooks/useAIConversations";
import { useConversationSearch } from "@/hooks/useConversationSearch";
import { useVoiceInput } from "@/hooks/useVoiceInput";
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
  Mic,
  MicOff,
  Download,
  FileText,
  FileJson,
  FileDown
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Attachment {
  id: string;
  name: string;
  type: string;
  content: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
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
    logo: "https://www.perplexity.ai/favicon.ico"
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
  const [isSearchingDatabase, setIsSearchingDatabase] = useState(false);
  const [activeSearchTools, setActiveSearchTools] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showHelp, setShowHelp } = useKeyboardShortcuts();
  
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
  const { data: documents } = useUserDocuments();
  const { data: userProfile } = useUserProfile();
  const { data: recentConversations } = useAIConversations();
  
  // Conversation persistence hooks
  const createConversation = useCreateConversation();
  const saveMessage = useSaveMessage();
  const updateConversation = useUpdateConversation();
  const { data: loadedMessages } = useAIMessages(currentConversationId || null);

  // Track if user explicitly started a new chat
  const [isNewChatMode, setIsNewChatMode] = useState(false);

  // Auto-load the most recent conversation when entering workbench (only if not in new chat mode)
  useEffect(() => {
    if (!isNewChatMode && !currentConversationId && recentConversations && recentConversations.length > 0 && messages.length === 0) {
      // Load the most recent conversation
      setCurrentConversationId(recentConversations[0].id);
    }
  }, [recentConversations, currentConversationId, messages.length, isNewChatMode]);

  // Load messages when switching conversations
  useEffect(() => {
    if (loadedMessages && loadedMessages.length > 0) {
      setMessages(loadedMessages.map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
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
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setIsNewChatMode(false);
    setInput("");
    setAttachments([]);
  };

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("text/") && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
        toast.error(`${file.name}: Only text files are supported`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: File too large (max 5MB)`);
        continue;
      }

      try {
        const content = await file.text();
        setAttachments(prev => [...prev, {
          id: generateId(),
          name: file.name,
          type: file.type,
          content: content.substring(0, 10000)
        }]);
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
      await navigator.clipboard.writeText(content);
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
        savedPrograms: savedPrograms?.map(p => ({
          name: p.Programs?.name
        })).filter(p => p.name) || [],
        learningAgreements: agreements?.map(a => ({
          title: a.title,
          status: a.status,
          type: a.agreement_type
        })) || [],
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
        onDelta: (delta) => {
          assistantContent += delta;
          setMessages(prev => prev.map(m => 
            m.id === assistantMessageId ? { ...m, content: assistantContent } : m
          ));
        },
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
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setAttachments([]);
    setIsStreaming(true);

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

      // Save user message to database
      await saveMessage.mutateAsync({
        conversationId,
        role: "user",
        content: userMessageContent
      });

      // Build comprehensive user context for AI with FULL details
      const userContext = {
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
        savedPrograms: savedPrograms?.map(p => ({
          name: p.Programs?.name
        })).filter(p => p.name) || [],
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
        profile: userProfile ? {
          country: userProfile.country,
          language: userProfile.language_preference,
        } : null,
        model: selectedModel,
      };

      const messagesForAI = newMessages.map(m => {
        if (m.attachments && m.attachments.length > 0) {
          let content = m.content;
          content += "\n\n--- Attached Files ---\n";
          m.attachments.forEach(a => {
            content += `\n[${a.name}]\n${a.content}\n`;
          });
          return { role: m.role, content };
        }
        return { role: m.role, content: m.content };
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
        onDelta: (delta) => {
          assistantContent += delta;
          setMessages(prev => prev.map(m => 
            m.id === assistantMessageId ? { ...m, content: assistantContent } : m
          ));
        },
        onDone: async () => {
          setIsStreaming(false);
          setIsSearchingDatabase(false);
          setActiveSearchTools([]);
          // Save assistant message to database after streaming is done
          if (conversationId && assistantContent) {
            await saveMessage.mutateAsync({
              conversationId,
              role: "assistant",
              content: assistantContent
            });
          }
        },
        onSearchingDatabase: setIsSearchingDatabase,
        onToolsUsed: setActiveSearchTools
      });
    } catch (err) {
      setIsStreaming(false);
      toast.error("Failed to get response from hubAI");
    }
  };

  const selectedModelData = models.find(m => m.id === selectedModel)!;

  // Voice input hook
  const { 
    isListening, 
    isSupported: voiceSupported, 
    startListening, 
    stopListening, 
    transcript 
  } = useVoiceInput({
    onTranscript: (text) => {
      setInput(prev => prev + (prev ? ' ' : '') + text);
    }
  });

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

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <WorkbenchSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
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
          <div className="flex items-center gap-3">
            {/* Toggle button - show when sidebar closed */}
            {!sidebarOpen && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(true)}
                className="hover:bg-accent/50 transition-colors text-foreground/60 dark:text-foreground"
                title="Open sidebar"
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
            className="hover:bg-accent/50 transition-colors text-foreground/60 dark:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground/80 dark:text-foreground leading-none">hubAI</h1>
            </div>
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
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-8 space-y-6">
          {messages.length === 0 ? (
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
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {message.attachments.map(a => (
                              <span 
                                key={a.id} 
                                className="inline-flex items-center gap-1 text-xs bg-primary-foreground/20 rounded-md px-2 py-1"
                              >
                                <Paperclip className="h-3 w-3" />
                                {a.name}
                              </span>
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
                      {message.role === "assistant" && (
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
      </ScrollArea>

      {/* Input Area - Fixed bottom */}
      <div className="border-t border-border/50 bg-transparent p-4">
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
            accept=".txt,.md,.json,.csv,.pdf,.docx"
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

          {/* Voice Input Button */}
          {voiceSupported && (
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 h-11 w-11 rounded-xl transition-colors ${
                isListening 
                  ? 'bg-destructive/20 hover:bg-destructive/30 text-destructive' 
                  : 'bg-transparent hover:bg-accent/30'
              }`}
              onClick={isListening ? stopListening : startListening}
              disabled={isStreaming}
              title={isListening ? "Stop recording" : "Start voice input"}
            >
              {isListening ? (
                <MicOff className="h-5 w-5 animate-pulse" />
              ) : (
                <Mic className="h-5 w-5 text-foreground/50 dark:text-muted-foreground" />
              )}
            </Button>
          )}

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
            <Input
              placeholder={isListening ? "Listening..." : "Message hubAI..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isStreaming}
              className={`pr-14 py-6 rounded-xl border bg-transparent focus:border-primary/50 transition-all placeholder:text-foreground/40 dark:placeholder:text-muted-foreground ${
                isListening ? 'border-destructive/50' : 'border-foreground/20 dark:border-border'
              }`}
            />
            <Button
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg transition-colors"
              onClick={handleSend}
              disabled={isStreaming || (!input.trim() && attachments.length === 0)}
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Voice transcript indicator */}
        {isListening && transcript && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <span className="font-medium">Listening:</span> {transcript}
          </div>
        )}

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
      
      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
};

export default Workbench;
