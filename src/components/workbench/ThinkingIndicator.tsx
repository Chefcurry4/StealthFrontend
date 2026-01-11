import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PandaBookLoader } from "./PandaBookLoader";

interface ThinkingIndicatorProps {
  mode: "thinking" | "searching" | "planning";
  searchTools?: string[];
  isCollapsible?: boolean;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  /** When thinking started - used to calculate elapsed time */
  startTime?: number;
}

// Contextual messages for each mode
const thinkingMessages = [
  "Panda is thinking...",
  "Analyzing your request...",
  "Processing...",
  "Let me think about that...",
];

const searchingMessages = [
  "Accessing database...",
  "Searching for relevant data...",
  "Fetching information...",
  "Looking through records...",
];

const planningMessages = [
  "Planning your semester...",
  "Building your plan...",
  "Optimizing course selection...",
  "Deep thinking in progress...",
];

// Format tool names for display
const formatToolName = (tool: string): string => {
  const toolNames: Record<string, string> = {
    search_courses: "Courses",
    search_labs: "Labs",
    search_programs: "Programs",
    search_teachers: "Teachers",
    search_universities: "Universities",
    get_courses_by_teacher: "Teacher Courses",
    get_labs_by_university: "University Labs",
    get_programs_by_university: "Programs",
    generate_semester_plan: "Semester Planning",
    get_document_content: "Documents",
  };
  return toolNames[tool] || tool.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

// Get contextual message based on tools being used
const getContextualMessage = (mode: string, tools: string[]): string => {
  if (mode === "searching" && tools.length > 0) {
    const toolNames = tools.map(formatToolName);
    if (tools.length === 1) {
      return `Accessing ${toolNames[0]} database...`;
    }
    return `Searching ${toolNames.slice(0, 2).join(", ")}${tools.length > 2 ? "..." : ""}`;
  }
  
  if (mode === "planning") {
    return planningMessages[Math.floor(Math.random() * planningMessages.length)];
  }
  
  if (mode === "searching") {
    return searchingMessages[Math.floor(Math.random() * searchingMessages.length)];
  }
  
  return thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
};

export const ThinkingIndicator = ({
  mode,
  searchTools = [],
  isCollapsible = false,
  onToggleExpand,
  isExpanded = false,
  startTime,
}: ThinkingIndicatorProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Track elapsed time
  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  // Rotate through contextual messages
  useEffect(() => {
    // Set initial message
    setCurrentMessage(getContextualMessage(mode, searchTools));
    
    // Rotate messages every 3 seconds
    messageIntervalRef.current = setInterval(() => {
      setCurrentMessage(getContextualMessage(mode, searchTools));
    }, 3000);
    
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [mode, searchTools]);

  // Common loader container styles
  const loaderContainerClass = cn(
    "flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
    "w-full max-w-full"
  );

  if (mode === "thinking") {
    return (
      <div className={loaderContainerClass}>
        <div className="shrink-0">
          <PandaBookLoader size={36} mode="thinking" />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-card/95 to-card/80 border border-border/50 shadow-md backdrop-blur-sm">
            <span className="text-sm font-medium text-foreground/90 truncate">
              {currentMessage}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "searching") {
    return (
      <div className={loaderContainerClass}>
        <div className="shrink-0">
          <PandaBookLoader size={36} mode="searching" />
        </div>
        <div className="flex flex-col gap-2 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-card/95 to-card/80 border border-primary/20 shadow-md backdrop-blur-sm min-w-0 flex-1 max-w-sm sm:max-w-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-foreground/90 truncate">
              {searchTools.length > 0 
                ? `Accessing: ${searchTools.map(formatToolName).join(", ")}`
                : currentMessage}
            </span>
          </div>
          
          {isCollapsible && (
            <button
              onClick={onToggleExpand}
              className="text-xs text-primary hover:underline text-left font-medium"
            >
              {isExpanded ? "Hide details" : "Show what I'm doing"}
            </button>
          )}
          
          {isExpanded && (
            <div className="space-y-1.5 mt-2 animate-in fade-in-0 slide-in-from-top-2 duration-200 bg-background/40 rounded-lg p-2 border border-border/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                <span className="truncate">Understanding your query...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-pulse shrink-0" style={{ animationDelay: '0.2s' }} />
                <span className="truncate">Fetching relevant data from database...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse shrink-0" style={{ animationDelay: '0.4s' }} />
                <span className="truncate">Generating comprehensive response...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === "planning") {
    return (
      <div className={loaderContainerClass}>
        <div className="shrink-0">
          <PandaBookLoader size={36} mode="planning" />
        </div>
        <div className="flex flex-col gap-2 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/50 dark:border-amber-700/30 shadow-md backdrop-blur-sm min-w-0 flex-1 max-w-sm sm:max-w-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300 truncate">
              {currentMessage}
            </span>
          </div>
          
          {isCollapsible && (
            <button
              onClick={onToggleExpand}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-left font-medium"
            >
              {isExpanded ? "Hide process" : "Show planning process"}
            </button>
          )}
          
          {isExpanded && (
            <div className="space-y-1.5 mt-1 animate-in fade-in-0 slide-in-from-top-2 duration-200 bg-background/40 rounded-lg p-2 border border-amber-200/30 dark:border-amber-700/20">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="truncate">Analyzing course requirements...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" style={{ animationDelay: '0.3s' }} />
                <span className="truncate">Searching for matching courses...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" style={{ animationDelay: '0.6s' }} />
                <span className="truncate">Optimizing ECTS distribution...</span>
              </div>
            </div>
          )}
          
          <div className="h-1.5 bg-amber-200/30 dark:bg-amber-800/30 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse shadow-sm" 
              style={{ width: `${Math.min(90, (elapsedSeconds * 10) + 20)}%` }} 
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * "Thought for X seconds" badge shown after AI response completes
 */
export const ThoughtDurationBadge = ({ 
  durationSeconds,
  className
}: { 
  durationSeconds: number;
  className?: string;
}) => {
  if (durationSeconds <= 0) return null;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs text-muted-foreground/70",
      className
    )}>
      <span className="text-xs">💭</span>
      thought for {durationSeconds}s
    </span>
  );
};
