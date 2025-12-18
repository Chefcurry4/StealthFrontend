import { useDroppable } from "@dnd-kit/core";
import { X, GraduationCap, Snowflake, Sun } from "lucide-react";
import { DiaryPageItem } from "@/types/diary";
import { useDiaryAnalytics } from "@/hooks/useDiaryAnalytics";
import { cn } from "@/lib/utils";

interface DiarySemesterPlannerProps {
  pageId: string;
  items: DiaryPageItem[];
  courses: any[];
  onRemoveItem: (id: string) => void;
}

const SEMESTERS = [
  { id: 'winter', label: 'Winter Semester', icon: Snowflake, color: 'bg-blue-50 border-blue-200' },
  { id: 'summer', label: 'Summer Semester', icon: Sun, color: 'bg-orange-50 border-orange-200' },
];

export const DiarySemesterPlanner = ({ pageId, items, courses, onRemoveItem }: DiarySemesterPlannerProps) => {
  const analytics = useDiaryAnalytics(courses);

  const getItemsForZone = (zone: string) => {
    return items.filter(item => item.zone === zone);
  };

  return (
    <div className="space-y-3">
      {/* Analytics Summary */}
      {courses.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 sm:p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-blue-600">{analytics.totalEcts}</div>
            <div className="text-[10px] sm:text-xs text-gray-500">ECTS</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold">{courses.length}</div>
            <div className="text-[10px] sm:text-xs text-gray-500">Courses</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center gap-1 text-xs sm:text-sm">
              <span title="Written">📝{analytics.examTypes.written}</span>
              <span title="Oral">🎤{analytics.examTypes.oral}</span>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500">Exams</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center gap-0.5 sm:gap-1 flex-wrap">
              <span className="px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs bg-blue-100 text-blue-700">Ba:{analytics.levels.bachelor}</span>
              <span className="px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs bg-purple-100 text-purple-700">Ma:{analytics.levels.master}</span>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500">Levels</div>
          </div>
        </div>
      )}

      {/* Topics */}
      {analytics.topics.length > 0 && (
        <div className="p-2 sm:p-3 rounded-lg bg-gray-50 border border-gray-200">
          <h4 className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1.5 sm:mb-2">Topics You'll Cover</h4>
          <div className="flex flex-wrap gap-1">
            {analytics.topics.slice(0, 8).map((topic, i) => (
              <span 
                key={i}
                className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600"
              >
                {topic}
              </span>
            ))}
            {analytics.topics.length > 8 && (
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 text-gray-400">+{analytics.topics.length - 8}</span>
            )}
          </div>
        </div>
      )}

      {/* Semester Zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {SEMESTERS.map((semester) => (
          <SemesterDropZone
            key={semester.id}
            semester={semester}
            items={getItemsForZone(semester.id)}
            courses={courses}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-4 sm:py-6 text-gray-400">
          <GraduationCap className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-1.5 sm:mb-2 opacity-40" />
          <p className="text-xs sm:text-sm">Drag courses to plan semesters</p>
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
}

const SemesterDropZone = ({ semester, items, courses, onRemoveItem }: SemesterDropZoneProps) => {
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
        "rounded-lg border-2 border-dashed p-2 sm:p-3 min-h-[120px] sm:min-h-[160px] transition-all",
        semester.color,
        isOver && "border-solid scale-[1.01] shadow-md"
      )}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
          <h4 className="text-xs sm:text-sm font-medium">{semester.label}</h4>
        </div>
        <span className="text-[10px] sm:text-xs bg-white px-1.5 sm:px-2 py-0.5 rounded shadow-sm">
          {semesterEcts} ECTS
        </span>
      </div>
      
      <div className="space-y-1.5 sm:space-y-2">
        {items.map((item) => {
          const course = courses.find(c => c.id_course === item.reference_id);
          if (!course) return null;

          return (
            <div
              key={item.id}
              className="p-1.5 sm:p-2 rounded bg-white border border-gray-200 text-[10px] sm:text-xs relative group shadow-sm"
            >
              <button
                onClick={() => onRemoveItem(item.id)}
                className="absolute -top-1 -right-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-2 sm:h-2.5 w-2 sm:w-2.5" />
              </button>
              <div className="font-medium text-gray-800 truncate text-[10px] sm:text-xs">{course.name_course}</div>
              <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 text-gray-500 flex-wrap">
                {course.ects && <span>{course.ects} ECTS</span>}
                {course.type_exam && (
                  <span className="text-[10px]">
                    {course.type_exam.toLowerCase().includes('written') ? '📝' : 
                     course.type_exam.toLowerCase().includes('oral') ? '🎤' : '📅'}
                  </span>
                )}
                {course.ba_ma && (
                  <span className={cn(
                    "px-0.5 sm:px-1 rounded text-[8px] sm:text-[10px]",
                    course.ba_ma === 'Ba' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  )}>
                    {course.ba_ma}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-3 sm:py-4 text-gray-400 text-[10px] sm:text-xs">
          Drop courses here
        </div>
      )}
    </div>
  );
};
