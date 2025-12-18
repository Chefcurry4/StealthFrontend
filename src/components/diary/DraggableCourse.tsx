import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GraduationCap, FileText, Clock } from "lucide-react";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { cn } from "@/lib/utils";

interface DraggableCourseProps {
  course: {
    id_course: string;
    name_course: string;
    code?: string | null;
    ects?: number | null;
    type_exam?: string | null;
    term?: string | null;
    ba_ma?: string | null;
  };
  isOnPage?: boolean;
}

export const DraggableCourse = ({ course, isOnPage = false }: DraggableCourseProps) => {
  const { modeConfig } = useBackgroundTheme();
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `course-${course.id_course}`,
    data: {
      type: 'course',
      course,
    },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const getExamIcon = () => {
    const exam = course.type_exam?.toLowerCase() || '';
    if (exam.includes('written')) return '📝';
    if (exam.includes('oral')) return '🎤';
    if (exam.includes('semester') || exam.includes('during')) return '📅';
    return '📋';
  };

  const getLevelBadge = () => {
    const level = course.ba_ma?.toLowerCase() || '';
    if (level.includes('ba')) return { text: 'Ba', color: '#3498db' };
    if (level.includes('ma')) return { text: 'Ma', color: '#9b59b6' };
    return null;
  };

  const levelBadge = getLevelBadge();

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
        <GraduationCap className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-60" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate" style={{ color: modeConfig.textColor }}>
            {course.name_course}
          </h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {course.code && (
              <span className="text-xs opacity-60">{course.code}</span>
            )}
            {course.ects && (
              <span 
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: modeConfig.ui.buttonPrimary + '20', color: modeConfig.ui.buttonPrimary }}
              >
                {course.ects} ECTS
              </span>
            )}
            {levelBadge && (
              <span 
                className="text-xs px-1.5 py-0.5 rounded-full text-white"
                style={{ background: levelBadge.color }}
              >
                {levelBadge.text}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs opacity-50">
            <span>{getExamIcon()}</span>
            {course.term && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.term}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
