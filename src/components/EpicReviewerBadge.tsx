import { Crown, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EpicReviewerBadgeProps {
  size?: "sm" | "md";
  showTooltip?: boolean;
}

const EpicReviewerBadge = ({ size = "sm", showTooltip = true }: EpicReviewerBadgeProps) => {
  const badgeContent = (
    <Badge 
      className={`bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1 font-semibold ${
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"
      }`}
    >
      <Crown className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      EPIC
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-help">
            {badgeContent}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <div className="flex items-start gap-2">
            <Crown className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Epic Reviewer</p>
              <p className="text-xs text-muted-foreground mt-1">
                This user has written 10+ course or lab reviews, earning the prestigious Epic Reviewer status!
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EpicReviewerBadge;
