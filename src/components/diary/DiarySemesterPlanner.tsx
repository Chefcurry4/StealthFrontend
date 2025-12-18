import { useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Download, Trash2, GraduationCap, X, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { DiaryPage, DiaryPageItem } from "@/types/diary";
import { useDiaryAnalytics } from "@/hooks/useDiaryAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface DiarySemesterPlannerProps {
  page: DiaryPage;
  items: DiaryPageItem[];
  onRemoveItem: (id: string) => void;
  isLoading: boolean;
}

const ZONES = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
];

export const DiarySemesterPlanner = ({ page, items, onRemoveItem, isLoading }: DiarySemesterPlannerProps) => {
  const { modeConfig } = useBackgroundTheme();
  const [courses, setCourses] = useState<any[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Fetch course details for items
  useEffect(() => {
    const fetchCourses = async () => {
      const courseItems = items.filter(item => item.item_type === 'course' && item.reference_id);
      if (courseItems.length === 0) {
        setCourses([]);
        return;
      }

      const courseIds = courseItems.map(item => item.reference_id!);
      const { data, error } = await supabase
        .from('Courses(C)')
        .select('id_course, name_course, code, ects, type_exam, term, ba_ma, topics, professor_name, software_equipment')
        .in('id_course', courseIds);

      if (!error && data) {
        setCourses(data);
      }
    };

    fetchCourses();
  }, [items]);

  const analytics = useDiaryAnalytics(courses);

  const handleExportPdf = async () => {
    const element = document.getElementById('semester-planner');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${page.title || 'semester-planner'}.pdf`);
      toast.success("PDF exported!");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const getCourseForItem = (item: DiaryPageItem) => {
    return courses.find(c => c.id_course === item.reference_id);
  };

  const getItemsForZone = (zone: string) => {
    return items.filter(item => item.zone === zone);
  };

  return (
    <div id="semester-planner" className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Semester Schedule
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            style={{ 
              borderColor: modeConfig.ui.cardBorder,
              background: modeConfig.ui.buttonSecondary,
              color: modeConfig.ui.buttonSecondaryText
            }}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            style={{ 
              borderColor: modeConfig.ui.cardBorder,
              background: modeConfig.ui.buttonSecondary,
              color: modeConfig.ui.buttonSecondaryText
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && courses.length > 0 && (
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg"
          style={{ background: modeConfig.ui.inputBackground }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: modeConfig.ui.buttonPrimary }}>
              {analytics.totalEcts}
            </div>
            <div className="text-xs opacity-60">Total ECTS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{courses.length}</div>
            <div className="text-xs opacity-60">Courses</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center gap-2">
              <span title="Written">📝 {analytics.examTypes.written}</span>
              <span title="Oral">🎤 {analytics.examTypes.oral}</span>
              <span title="During semester">📅 {analytics.examTypes.duringSemester}</span>
            </div>
            <div className="text-xs opacity-60">Exam Types</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs text-white" style={{ background: '#3498db' }}>
                Ba: {analytics.levels.bachelor}
              </span>
              <span className="px-2 py-0.5 rounded text-xs text-white" style={{ background: '#9b59b6' }}>
                Ma: {analytics.levels.master}
              </span>
            </div>
            <div className="text-xs opacity-60">Levels</div>
          </div>
        </div>
      )}

      {/* Topics */}
      {showAnalytics && analytics.topics.length > 0 && (
        <div className="p-4 rounded-lg" style={{ background: modeConfig.ui.inputBackground }}>
          <h4 className="text-sm font-medium mb-2">Topics You'll Master</h4>
          <div className="flex flex-wrap gap-1">
            {analytics.topics.slice(0, 15).map((topic, i) => (
              <span 
                key={i}
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: modeConfig.ui.cardBorder }}
              >
                {topic}
              </span>
            ))}
            {analytics.topics.length > 15 && (
              <span className="text-xs px-2 py-1 opacity-50">+{analytics.topics.length - 15} more</span>
            )}
          </div>
        </div>
      )}

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-5 gap-3">
        {ZONES.map((zone) => (
          <DropZone
            key={zone.id}
            id={zone.id}
            label={zone.label}
            items={getItemsForZone(zone.id)}
            courses={courses}
            onRemoveItem={onRemoveItem}
            modeConfig={modeConfig}
          />
        ))}
      </div>

      {/* Unassigned courses */}
      {items.filter(item => !item.zone).length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2 opacity-70">Unassigned Courses</h4>
          <DropZone
            id="unassigned"
            label=""
            items={items.filter(item => !item.zone)}
            courses={courses}
            onRemoveItem={onRemoveItem}
            modeConfig={modeConfig}
            isUnassigned
          />
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 opacity-50">
          <GraduationCap className="h-12 w-12 mx-auto mb-4" />
          <p>Drag courses from the sidebar to plan your semester</p>
        </div>
      )}
    </div>
  );
};

interface DropZoneProps {
  id: string;
  label: string;
  items: DiaryPageItem[];
  courses: any[];
  onRemoveItem: (id: string) => void;
  modeConfig: any;
  isUnassigned?: boolean;
}

const DropZone = ({ id, label, items, courses, onRemoveItem, modeConfig, isUnassigned }: DropZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `zone-${id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border-2 border-dashed p-2 min-h-[150px] transition-all",
        isOver && "border-solid scale-[1.02]",
        isUnassigned && "flex flex-wrap gap-2"
      )}
      style={{ 
        borderColor: isOver ? modeConfig.ui.buttonPrimary : modeConfig.ui.cardBorder,
        background: isOver ? modeConfig.ui.buttonPrimary + '10' : 'transparent'
      }}
    >
      {label && (
        <h4 className="text-xs font-medium text-center mb-2 opacity-70">{label}</h4>
      )}
      <div className={cn("space-y-2", isUnassigned && "contents")}>
        {items.map((item) => {
          const course = courses.find(c => c.id_course === item.reference_id);
          if (!course) return null;

          return (
            <div
              key={item.id}
              className="p-2 rounded-lg text-xs relative group"
              style={{ background: modeConfig.ui.inputBackground }}
            >
              <button
                onClick={() => onRemoveItem(item.id)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="font-medium truncate">{course.name_course}</div>
              <div className="flex items-center gap-1 mt-1 opacity-60">
                {course.ects && <span>{course.ects} ECTS</span>}
                {course.type_exam && (
                  <span>
                    {course.type_exam.toLowerCase().includes('written') ? '📝' : 
                     course.type_exam.toLowerCase().includes('oral') ? '🎤' : '📅'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
