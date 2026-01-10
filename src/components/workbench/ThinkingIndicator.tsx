import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Database, Brain, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingIndicatorProps {
  mode: "thinking" | "searching" | "planning";
  searchTools?: string[];
  isCollapsible?: boolean;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}

// Animated pulsing dots component (like iMessage typing indicator)
const PulsingDots = () => {
  return (
    <div className="flex items-center gap-1">
      <div 
        className="h-2 w-2 rounded-full bg-primary animate-pulse"
        style={{ animationDelay: "0ms" }}
      />
      <div 
        className="h-2 w-2 rounded-full bg-primary animate-pulse"
        style={{ animationDelay: "200ms" }}
      />
      <div 
        className="h-2 w-2 rounded-full bg-primary animate-pulse"
        style={{ animationDelay: "400ms" }}
      />
    </div>
  );
};

// Format tool names for display
const formatToolName = (tool: string): string => {
  const toolNames: Record<string, string> = {
    search_courses: "Courses",
    search_labs: "Labs",
    search_programs: "Programs",
    search_teachers: "Teachers",
  };
  return toolNames[tool] || tool;
};

export const ThinkingIndicator = ({
  mode,
  searchTools = [],
  isCollapsible = false,
  onToggleExpand,
  isExpanded = false,
}: ThinkingIndicatorProps) => {
  if (mode === "thinking") {
    return (
      <div className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20 shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-card border border-border/50 shadow-sm">
          <PulsingDots />
          <span className="text-sm text-muted-foreground">Thinking…</span>
        </div>
      </div>
    );
  }

  if (mode === "searching") {
    return (
      <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20 shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 rounded-2xl px-4 py-3 bg-card border border-border/50 shadow-sm min-w-[280px]">
          <div className="flex items-center gap-3">
            <Database className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">
              {searchTools.length > 0 
                ? `Searching ${searchTools.map(formatToolName).join(', ')}...`
                : 'Searching database...'}
            </span>
            <PulsingDots />
          </div>
          
          {isCollapsible && (
            <button
              onClick={onToggleExpand}
              className="text-xs text-primary hover:underline text-left"
            >
              {isExpanded ? "Hide details" : "Show details"}
            </button>
          )}
          
          {isExpanded && (
            <div className="space-y-1.5 mt-2 animate-in fade-in-0 slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>Analyzing your query...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span>Searching relevant resources...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span>Preparing response...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === "planning") {
    return (
      <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-amber-400/30 shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-600 dark:text-amber-400">
            <Brain className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 rounded-2xl px-4 py-3 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-700/30 shadow-sm min-w-[280px]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <CalendarDays className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Creating Semester Plan</span>
          </div>
          
          {isCollapsible && (
            <button
              onClick={onToggleExpand}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline text-left"
            >
              {isExpanded ? "Hide reasoning" : "Show reasoning"}
            </button>
          )}
          
          {isExpanded && (
            <div className="space-y-1.5 mt-1 animate-in fade-in-0 slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Analyzing your requirements...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span>Searching matching courses...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                <span>Optimizing ECTS balance...</span>
              </div>
            </div>
          )}
          
          <div className="h-1 bg-amber-200/30 dark:bg-amber-800/30 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
