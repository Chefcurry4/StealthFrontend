import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { X, GraduationCap, Snowflake, Sun, FileText, Mic, CalendarClock } from "lucide-react";
import { DiaryPageItem } from "@/types/diary";
import { useDiaryAnalytics } from "@/hooks/useDiaryAnalytics";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DiarySemesterPlannerProps {
  pageId: string;
  items: DiaryPageItem[];
  courses: any[];
  onRemoveItem: (id: string) => void;
  onCourseClick?: (course: any) => void;
}

const SEMESTERS = [
  { id: 'winter', label: 'Winter Semester', icon: Snowflake, color: 'bg-sky-50 border-sky-200' },
  { id: 'summer', label: 'Summer Semester', icon: Sun, color: 'bg-amber-50 border-amber-200' },
];

// Helper function to count exam types - "During the semester" counts as both written AND project
const countExamTypes = (courses: any[]) => {
  let written = 0;
  let oral = 0;
  let project = 0;

  courses.forEach((course) => {
    const examType = course.type_exam?.toLowerCase() || "";
    
    // "During the semester" means both written exam AND project/midterm
    if (examType.includes("semester") || examType.includes("during") || examType.includes("continuous")) {
      written++;
      project++;
    } else if (examType.includes("written") || examType.includes("écrit") || examType.includes("write")) {
      written++;
    } else if (examType.includes("oral")) {
      oral++;
    } else if (examType.includes("project") || examType.includes("midterm")) {
      project++;
    }
  });

  return { written, oral, project };
};

// Helper function to count levels
const countLevels = (courses: any[]) => {
  let bachelor = 0;
  let master = 0;

  courses.forEach((course) => {
    const level = course.ba_ma?.toLowerCase() || "";
    if (level.includes("ba") || level.includes("bachelor")) {
      bachelor++;
    } else if (level.includes("ma") || level.includes("master")) {
      master++;
    }
  });

  return { bachelor, master };
};

export const DiarySemesterPlanner = ({ pageId, items, courses, onRemoveItem, onCourseClick }: DiarySemesterPlannerProps) => {
  const [selectedSemester, setSelectedSemester] = useState<'winter' | 'summer'>('winter');
  const analytics = useDiaryAnalytics(courses);
  const examCounts = countExamTypes(courses);
  const levelCounts = countLevels(courses);

  const getItemsForZone = (zone: string) => {
    return items.filter(item => item.zone === zone);
  };

  const currentSemester = SEMESTERS.find(s => s.id === selectedSemester)!;

  return (
    <div className="space-y-3">
      {/* Semester Toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={selectedSemester === 'winter' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedSemester('winter')}
          className={cn(
            "gap-2",
            selectedSemester === 'winter' && "bg-sky-600 hover:bg-sky-700"
          )}
        >
          <Snowflake className="h-4 w-4" />
          Winter
        </Button>
        <Button
          variant={selectedSemester === 'summer' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedSemester('summer')}
          className={cn(
            "gap-2",
            selectedSemester === 'summer' && "bg-amber-600 hover:bg-amber-700"
          )}
        >
          <Sun className="h-4 w-4" />
          Summer
        </Button>
      </div>

      {/* Analytics Summary */}
      {courses.length > 0 && (
        <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-gray-50/80 border border-gray-200">
          <div className="col-span-2 grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded bg-white/80">
              <div className="text-xl font-bold text-blue-600">{analytics.totalEcts}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">ECTS</div>
            </div>
            <div className="text-center p-2 rounded bg-white/80">
              <div className="text-xl font-bold text-gray-800">{courses.length}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Courses</div>
            </div>
            <div className="text-center p-2 rounded bg-white/80">
              <div className="text-xl font-bold text-indigo-600">{levelCounts.bachelor}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Bachelor</div>
            </div>
            <div className="text-center p-2 rounded bg-white/80">
              <div className="text-xl font-bold text-purple-600">{levelCounts.master}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Master</div>
            </div>
          </div>

          {/* Exam Types */}
          <div className="col-span-2 flex items-center justify-center gap-4 py-2">
            <div className="flex items-center gap-1.5 text-sm">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{examCounts.written}</span>
              <span className="text-gray-500 text-xs">Written</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Mic className="h-4 w-4 text-green-500" />
              <span className="font-medium">{examCounts.oral}</span>
              <span className="text-gray-500 text-xs">Oral</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <CalendarClock className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{examCounts.project}</span>
              <span className="text-gray-500 text-xs">Project</span>
            </div>
          </div>
        </div>
      )}

      {/* Topics */}
      {analytics.topics.length > 0 && (
        <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-200">
          <h4 className="text-xs font-medium text-gray-600 mb-2">Topics You'll Cover</h4>
          <div className="flex flex-wrap gap-1">
            {analytics.topics.slice(0, 8).map((topic, i) => (
              <span 
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600"
              >
                {topic}
              </span>
            ))}
            {analytics.topics.length > 8 && (
              <span className="text-[10px] px-2 py-0.5 text-gray-400">+{analytics.topics.length - 8} more</span>
            )}
          </div>
        </div>
      )}

      {/* Single Semester Zone */}
      <SemesterDropZone
        semester={currentSemester}
        items={getItemsForZone(currentSemester.id)}
        courses={courses}
        onRemoveItem={onRemoveItem}
        onCourseClick={onCourseClick}
      />

      {items.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Drag courses to plan your {selectedSemester} semester</p>
        </div>
      )}
    </div>
  );
};

interface SemesterDropZoneProps {
  semester: { id: string; label: string; icon: any; color: string };
  items: DiaryPageItem[];
  courses: any[];
  onRemoveItem: (id: string) => void;
  onCourseClick?: (course: any) => void;
}

const SemesterDropZone = ({ semester, items, courses, onRemoveItem, onCourseClick }: SemesterDropZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `semester-zone-${semester.id}`,
  });

  const Icon = semester.icon;

  // Calculate ECTS for this semester
  const semesterEcts = items.reduce((total, item) => {
    const course = courses.find(c => c.id_course === item.reference_id);
    return total + (course?.ects || 0);
  }, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border-2 border-dashed p-3 min-h-[200px] transition-all",
        semester.color,
        isOver && "border-solid scale-[1.01] shadow-lg"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <h4 className="text-sm font-medium">{semester.label}</h4>
        </div>
        <span className="text-xs bg-white px-2 py-0.5 rounded-full shadow-sm font-medium">
          {semesterEcts} ECTS
        </span>
      </div>
      
      <div className="space-y-2">
        {items.map((item) => {
          const course = courses.find(c => c.id_course === item.reference_id);
          if (!course) return null;

          const examType = course.type_exam?.toLowerCase() || "";
          let examIcon = <CalendarClock className="h-3 w-3 text-orange-500" />;
          if (examType.includes('written') || examType.includes('écrit')) {
            examIcon = <FileText className="h-3 w-3 text-blue-500" />;
          } else if (examType.includes('oral')) {
            examIcon = <Mic className="h-3 w-3 text-green-500" />;
          }

          const levelLabel = course.ba_ma?.toLowerCase()?.includes('ba') ? 'Bachelor' : 
                            course.ba_ma?.toLowerCase()?.includes('ma') ? 'Master' : null;

          return (
            <div
              key={item.id}
              onClick={() => onCourseClick?.(course)}
              className="p-2 rounded bg-white border border-gray-200 text-xs relative group shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-gray-50"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-2.5 w-2.5" />
              </button>
              <div className="font-medium text-gray-800 line-clamp-1 text-xs">{course.name_course}</div>
              <div className="flex items-center gap-2 mt-1 text-gray-500 flex-wrap">
                {course.ects && <span className="font-medium">{course.ects} ECTS</span>}
                {examIcon}
                {levelLabel && (
                  <span className={cn(
                    "px-1 rounded text-[9px] font-medium",
                    levelLabel === 'Bachelor' ? "bg-indigo-100 text-indigo-700" : "bg-purple-100 text-purple-700"
                  )}>
                    {levelLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-xs">
          Drop courses here
        </div>
      )}
    </div>
  );
};
