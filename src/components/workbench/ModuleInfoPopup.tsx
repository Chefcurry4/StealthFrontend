import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ModuleInfoPopupProps {
  title: string;
  description: string;
  tips: string[];
}

export const ModuleInfoPopup = ({ title, description, tips }: ModuleInfoPopupProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <span 
          role="button"
          tabIndex={0}
          className="inline-flex items-center justify-center h-4 w-4 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <Info className="h-2.5 w-2.5" />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-64 sm:w-72 p-3" align="start" side="bottom">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
          {tips.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] font-medium uppercase text-muted-foreground mb-1.5">Tips</p>
              <ul className="space-y-1">
                {tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
