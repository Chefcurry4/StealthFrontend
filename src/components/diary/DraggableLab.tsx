import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Beaker, Tag } from "lucide-react";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { cn } from "@/lib/utils";

interface DraggableLabProps {
  lab: {
    id_lab: string;
    name: string;
    slug?: string | null;
    topics?: string | null;
    professors?: string | null;
  };
}

export const DraggableLab = ({ lab }: DraggableLabProps) => {
  const { modeConfig } = useBackgroundTheme();
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lab-${lab.id_lab}`,
    data: {
      type: 'lab',
      lab,
    },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const topics = lab.topics?.split(/[,;]/).slice(0, 3).map(t => t.trim()).filter(Boolean) || [];

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: modeConfig.ui.inputBackground }}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50 scale-95 shadow-xl z-50",
        !isDragging && "hover:shadow-md hover:scale-[1.02]"
      )}
    >
      <div className="flex items-start gap-2">
        <Beaker className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-60" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate" style={{ color: modeConfig.textColor }}>
            {lab.name}
          </h4>
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {topics.map((topic, i) => (
                <span 
                  key={i}
                  className="text-xs px-1.5 py-0.5 rounded-full opacity-70"
                  style={{ background: modeConfig.ui.cardBorder }}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
