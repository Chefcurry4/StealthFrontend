import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { X, GraduationCap, Snowflake, Sun, FileText, Mic, CalendarClock } from "lucide-react";
import { DiaryPageItem } from "@/types/diary";
import { useDiaryAnalytics } from "@/hooks/useDiaryAnalytics";
import { Button } from "@/components/ui/button";

interface DiarySemesterPlannerProps {
  pageId: string;
  moduleId?: string; // Unique ID for this semester planner module
  items: DiaryPageItem[];
  courses: any[];
  onRemoveItem: (id: string) => void;
  onCourseClick?: (course: any) => void;
}

const SEMESTERS = [
  { id: 'winter', label: 'Winter Semester', icon: Snowflake, color: 'bg-sky-50 border-sky-200' },
  { id: 'summer', label: 'Summer Semester', icon: Sun, color: 'bg-amber-50 border-amber-200' },
];

// Helper function to count exam types - handles multiple exam types per course
const countExamTypes = (courses: any[]) => {
  let written = 0;
  let oral = 0;
  let projectMidterm = 0;

  courses.forEach((course) => {
    const examType = course.type_exam?.toLowerCase() || "";
    
    // Check for written exam keywords
    const isWritten = examType.includes("written") || 
                      examType.includes("écrit") || 
                      examType.includes("write") ||
                      examType.includes("exam") && !examType.includes("oral");
    
    // Check for oral exam keywords
    const isOral = examType.includes("oral") || 
                   examType.includes("presentation") ||
                   examType.includes("defense");
    
    // Check for project/midterm keywords
    const isProjectMidterm = examType.includes("project") || 
                              examType.includes("midterm") ||
                              examType.includes("semester") ||
                              examType.includes("during") ||
                              examType.includes("continuous") ||
                              examType.includes("assignment") ||
                              examType.includes("report") ||
                              examType.includes("practical");
    
    // Count each type independently (a course can have multiple exam types)
    if (isWritten) written++;
    if (isOral) oral++;
    if (isProjectMidterm) projectMidterm++;
    
    // If no specific type detected but there's an exam type string, count as project/midterm
    if (!isWritten && !isOral && !isProjectMidterm && examType.trim()) {
      projectMidterm++;
    }
  });

  return { written, oral, projectMidterm };
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

export const DiarySemesterPlanner = ({ pageId, moduleId, items, courses, onRemoveItem, onCourseClick }: DiarySemesterPlannerProps) => {
  const [selectedSemester, setSelectedSemester] = useState<'winter' | 'summer'>('winter');
  const analytics = useDiaryAnalytics(courses);
  const examCounts = countExamTypes(courses);
  const levelCounts = countLevels(courses);

  // Zone prefix for this specific semester planner module
  const zonePrefix = moduleId ? `semester-${moduleId}` : '';

  const getItemsForZone = (zone: string) => {
    const fullZone = moduleId ? `${zonePrefix}-${zone}` : zone;
    return items.filter(item => item.zone === fullZone);
  };

  const currentSemester = SEMESTERS.find(s => s.id === selectedSemester)!;

  return (
    <div className="space-y-2">
      {/* Semester Toggle */}
      <div className="flex justify-center gap-1">
        <Button
          variant={selectedSemester === 'winter' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedSemester('winter')}
          className="gap-1 h-6 text-[10px] px-2"
        >
          <Snowflake className="h-3 w-3" />
          Winter
        </Button>
        <Button
          variant={selectedSemester === 'summer' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedSemester('summer')}
          className="gap-1 h-6 text-[10px] px-2"
        >
          <Sun className="h-3 w-3" />
          Summer
        </Button>
      </div>

      {/* Analytics Summary - more compact */}
      {courses.length > 0 && (
        <div className="grid grid-cols-4 gap-1 p-2 rounded-lg bg-gray-50/80 border border-gray-200">
          <div className="text-center p-1 rounded bg-white/80">
            <div className="text-sm font-bold text-blue-600">{analytics.totalEcts}</div>
            <div className="text-[8px] text-gray-500 uppercase">ECTS</div>
          </div>
          <div className="text-center p-1 rounded bg-white/80">
            <div className="text-sm font-bold text-gray-800">{courses.length}</div>
            <div className="text-[8px] text-gray-500 uppercase">Courses</div>
          </div>
          <div className="text-center p-1 rounded bg-white/80">
            <div className="text-sm font-bold text-indigo-600">{levelCounts.bachelor}</div>
            <div className="text-[8px] text-gray-500 uppercase">Bachelor</div>
          </div>
          <div className="text-center p-1 rounded bg-white/80">
            <div className="text-sm font-bold text-purple-600">{levelCounts.master}</div>
            <div className="text-[8px] text-gray-500 uppercase">Master</div>
          </div>

          {/* Exam Types - inline */}
          <div className="col-span-4 flex items-center justify-center gap-3 py-1">
            <div className="flex items-center gap-1 text-[10px]">
              <FileText className="h-3 w-3 text-blue-500" />
              <span className="font-medium">{examCounts.written}</span>
              <span className="text-gray-500">Written</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <Mic className="h-3 w-3 text-green-500" />
              <span className="font-medium">{examCounts.oral}</span>
              <span className="text-gray-500">Oral</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <CalendarClock className="h-3 w-3 text-orange-500" />
              <span className="font-medium">{examCounts.projectMidterm}</span>
              <span className="text-gray-500">Project/Midterm</span>
            </div>
          </div>
        </div>
      )}

      {/* Topics - more compact */}
      {analytics.topics.length > 0 && (
        <div className="p-2 rounded-lg bg-gray-50/80 border border-gray-200">
          <h4 className="text-[9px] font-medium text-gray-600 mb-1">Topics</h4>
          <div className="flex flex-wrap gap-0.5">
            {analytics.topics.slice(0, 6).map((topic, i) => (
              <span 
                key={i}
                className="text-[8px] px-1.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600"
              >
                {topic}
              </span>
            ))}
            {analytics.topics.length > 6 && (
              <span className="text-[8px] px-1 text-gray-400">+{analytics.topics.length - 6}</span>
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
        zonePrefix={zonePrefix}
      />

      {items.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          <GraduationCap className="h-6 w-6 mx-auto mb-1 opacity-40" />
          <p className="text-[10px]">Drag courses to plan your {selectedSemester} semester</p>
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
  zonePrefix?: string;
}

const SemesterDropZone = ({ semester, items, courses, onRemoveItem, onCourseClick, zonePrefix }: SemesterDropZoneProps) => {
  // Create unique droppable ID that includes the module prefix
  const droppableId = zonePrefix 
    ? `${zonePrefix}-${semester.id}` 
    : `semester-zone-${semester.id}`;
    
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
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
        "rounded-lg border-2 border-dashed p-2 min-h-[120px] transition-all",
        semester.color,
        isOver && "border-solid scale-[1.01] shadow-lg"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3" />
          <h4 className="text-[10px] font-medium">{semester.label}</h4>
        </div>
        <span className="text-[9px] bg-white px-1.5 py-0.5 rounded-full shadow-sm font-medium">
          {semesterEcts} ECTS
        </span>
      </div>
      
      <div className="space-y-1">
        {items.map((item) => {
          const course = courses.find(c => c.id_course === item.reference_id);
          if (!course) return null;

          const examType = course.type_exam?.toLowerCase() || "";
          let examIcon = <CalendarClock className="h-2.5 w-2.5 text-orange-500" />;
          if (examType.includes('written') || examType.includes('écrit')) {
            examIcon = <FileText className="h-2.5 w-2.5 text-blue-500" />;
          } else if (examType.includes('oral')) {
            examIcon = <Mic className="h-2.5 w-2.5 text-green-500" />;
          }

          const levelLabel = course.ba_ma?.toLowerCase()?.includes('ba') ? 'Ba' : 
                            course.ba_ma?.toLowerCase()?.includes('ma') ? 'Ma' : null;

          return (
            <div
              key={item.id}
              onClick={() => onCourseClick?.(course)}
              className="p-1.5 rounded bg-white border border-gray-200 text-[10px] relative group shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-gray-50"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-2 w-2" />
              </button>
              <div className="font-medium text-gray-800 line-clamp-1 text-[9px]">{course.name_course}</div>
              <div className="flex items-center gap-1.5 mt-0.5 text-gray-500 flex-wrap">
                {course.ects && <span className="font-medium text-[8px]">{course.ects} ECTS</span>}
                {examIcon}
                {levelLabel && (
                  <span className={cn(
                    "px-1 rounded text-[7px] font-medium",
                    levelLabel === 'Ba' ? "bg-indigo-100 text-indigo-700" : "bg-purple-100 text-purple-700"
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
        <div className="text-center py-4 text-gray-400 text-[9px]">
          Drop courses here
        </div>
      )}
    </div>
  );
};