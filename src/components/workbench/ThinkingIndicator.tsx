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
          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-gradient-to-r from-card/95 to-card/80 border border-border/50 shadow-md backdrop-blur-sm">
          <PulsingDots />
          <span className="text-sm font-medium text-foreground/90">Analyzing your request…</span>
        </div>
      </div>
    );
  }

  if (mode === "searching") {
    return (
      <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20 shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 rounded-2xl px-4 py-3 bg-gradient-to-r from-card/95 to-card/80 border border-primary/20 shadow-md backdrop-blur-sm min-w-[280px]">
          <div className="flex items-center gap-3">
            <Database className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground/90">
              {searchTools.length > 0 
                ? `Accessing database: ${searchTools.map(formatToolName).join(', ')}…`
                : 'Searching database…'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PulsingDots />
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
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>Understanding your query…</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span>Fetching relevant data from database…</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span>Generating comprehensive response…</span>
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
            <Brain className="h-4 w-4 animate-pulse" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 rounded-2xl px-4 py-3 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/50 dark:border-amber-700/30 shadow-md backdrop-blur-sm min-w-[280px]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <CalendarDays className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Building your semester plan…</span>
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
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Analyzing course requirements…</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span>Searching for matching courses…</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                <span>Optimizing ECTS distribution…</span>
              </div>
            </div>
          )}
          
          <div className="h-1.5 bg-amber-200/30 dark:bg-amber-800/30 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse shadow-sm" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
