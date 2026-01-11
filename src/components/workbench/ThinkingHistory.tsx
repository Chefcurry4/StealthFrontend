import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface ThinkingStep {
  tool: string;
  durationMs: number;
}

interface ThinkingHistoryProps {
  /** Total thinking duration in seconds */
  totalDurationSeconds: number;
  /** List of tools used with their durations */
  steps: ThinkingStep[];
  /** Additional CSS classes */
  className?: string;
}

// Format tool names for display
const formatToolName = (tool: string): string => {
  const toolNames: Record<string, string> = {
    search_courses: "Courses Database",
    search_labs: "Labs Database",
    search_programs: "Programs Database",
    search_teachers: "Teachers Database",
    search_universities: "Universities Database",
    get_courses_by_teacher: "Teacher's Courses",
    get_labs_by_university: "University Labs",
    get_programs_by_university: "University Programs",
    generate_semester_plan: "Semester Planning",
    get_document_content: "Document Analysis",
    thinking: "Reasoning",
    streaming: "Generating Response",
  };
  return toolNames[tool] || tool.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

// Get icon for tool type
const getToolIcon = (tool: string): string => {
  if (tool.includes("course")) return "📚";
  if (tool.includes("lab")) return "🔬";
  if (tool.includes("program")) return "🎓";
  if (tool.includes("teacher")) return "👨‍🏫";
  if (tool.includes("university") || tool.includes("universities")) return "🏛️";
  if (tool.includes("semester") || tool.includes("plan")) return "📅";
  if (tool.includes("document")) return "📄";
  if (tool === "thinking") return "🧠";
  if (tool === "streaming") return "✨";
  return "⚡";
};

export const ThinkingHistory = ({
  totalDurationSeconds,
  steps,
  className,
}: ThinkingHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if no meaningful steps
  if (steps.length === 0 || totalDurationSeconds <= 0) {
    return null;
  }

  // Calculate total from steps vs actual duration
  const stepsWithDuration = steps.filter(s => s.durationMs > 0);
  const hasDetailedSteps = stepsWithDuration.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors group",
          className
        )}
      >
        <span className="text-xs">💭</span>
        <span>thought for {totalDurationSeconds}s</span>
        {hasDetailedSteps && (
          <>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-muted-foreground/60">{steps.length} tools</span>
            {isOpen ? (
              <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            ) : (
              <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            )}
          </>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5 border border-border/30 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-medium mb-2">
            <Clock className="h-3 w-3" />
            <span>Thinking Process</span>
          </div>
          
          {steps.map((step, index) => (
            <div
              key={`${step.tool}-${index}`}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs shrink-0">{getToolIcon(step.tool)}</span>
                <span className="text-muted-foreground truncate">
                  {formatToolName(step.tool)}
                </span>
              </div>
              <span className="text-muted-foreground/60 shrink-0 font-mono text-[10px]">
                {step.durationMs > 0 
                  ? `${(step.durationMs / 1000).toFixed(1)}s`
                  : "—"
                }
              </span>
            </div>
          ))}

          <div className="border-t border-border/30 pt-1.5 mt-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-primary/60" />
              <span className="text-muted-foreground font-medium">Total</span>
            </div>
            <span className="text-foreground font-mono text-[10px] font-medium">
              {totalDurationSeconds}s
            </span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
