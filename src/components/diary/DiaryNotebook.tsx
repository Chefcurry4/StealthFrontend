import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, X, GripVertical, GraduationCap, Beaker, StickyNote, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { DiaryPage, DiaryPageItem } from "@/types/diary";
import { DiarySemesterPlanner } from "./DiarySemesterPlanner";
import { DiaryLabTracker } from "./DiaryLabTracker";
import { DiaryNotesPage } from "./DiaryNotesPage";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface DiaryNotebookProps {
  pages: DiaryPage[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  notebookId: string;
  pageItems: DiaryPageItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: any) => void;
}

export const DiaryNotebook = ({
  pages,
  currentPageIndex,
  onPageChange,
  notebookId,
  pageItems,
  onRemoveItem,
  onUpdateItem,
}: DiaryNotebookProps) => {
  const { mode, modeConfig } = useBackgroundTheme();
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);

  const { setNodeRef, isOver } = useDroppable({
    id: 'diary-page-canvas',
  });

  // Fetch course and lab details for items
  useEffect(() => {
    const fetchData = async () => {
      const courseItems = pageItems.filter(item => item.item_type === 'course' && item.reference_id);
      const labItems = pageItems.filter(item => item.item_type === 'lab' && item.reference_id);

      if (courseItems.length > 0) {
        const courseIds = courseItems.map(item => item.reference_id!);
        const { data } = await supabase
          .from('Courses(C)')
          .select('id_course, name_course, code, ects, type_exam, term, ba_ma, topics, professor_name')
          .in('id_course', courseIds);
        if (data) setCourses(data);
      } else {
        setCourses([]);
      }

      if (labItems.length > 0) {
        const labIds = labItems.map(item => item.reference_id!);
        const { data } = await supabase
          .from('Labs(L)')
          .select('id_lab, name, topics, professors')
          .in('id_lab', labIds);
        if (data) setLabs(data);
      } else {
        setLabs([]);
      }
    };

    fetchData();
  }, [pageItems]);

  const handlePageTurn = (direction: 'left' | 'right') => {
    if (isFlipping) return;

    const newIndex = direction === 'right' 
      ? Math.min(pages.length - 1, currentPageIndex + 1)
      : Math.max(0, currentPageIndex - 1);

    if (newIndex !== currentPageIndex) {
      setFlipDirection(direction);
      setIsFlipping(true);
      
      setTimeout(() => {
        onPageChange(newIndex);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 400);
    }
  };

  const currentPage = pages[currentPageIndex];

  const renderItem = (item: DiaryPageItem) => {
    if (item.item_type === 'course') {
      const course = courses.find(c => c.id_course === item.reference_id);
      if (!course) return null;
      return (
        <CourseCard 
          key={item.id} 
          item={item} 
          course={course} 
          onRemove={onRemoveItem}
          modeConfig={modeConfig}
        />
      );
    }

    if (item.item_type === 'lab') {
      const lab = labs.find(l => l.id_lab === item.reference_id);
      if (!lab) return null;
      return (
        <LabCard 
          key={item.id} 
          item={item} 
          lab={lab} 
          onRemove={onRemoveItem}
          modeConfig={modeConfig}
        />
      );
    }

    if (item.item_type === 'note') {
      return (
        <NoteCard 
          key={item.id} 
          item={item} 
          onRemove={onRemoveItem}
          onUpdate={onUpdateItem}
        />
      );
    }

    if (item.item_type === 'semester_planner' as any) {
      return (
        <ModuleWrapper 
          key={item.id} 
          item={item} 
          onRemove={onRemoveItem}
          title="Semester Planner"
          icon={<BarChart3 className="h-4 w-4" />}
          modeConfig={modeConfig}
        >
          <DiarySemesterPlanner
            pageId={currentPage?.id || ''}
            items={pageItems.filter(i => i.zone)}
            courses={courses}
            onRemoveItem={onRemoveItem}
          />
        </ModuleWrapper>
      );
    }

    if (item.item_type === 'lab_tracker' as any) {
      return (
        <ModuleWrapper 
          key={item.id} 
          item={item} 
          onRemove={onRemoveItem}
          title="Lab Tracker"
          icon={<Beaker className="h-4 w-4" />}
          modeConfig={modeConfig}
        >
          <DiaryLabTracker />
        </ModuleWrapper>
      );
    }

    if (item.item_type === 'notes_module' as any) {
      return (
        <ModuleWrapper 
          key={item.id} 
          item={item} 
          onRemove={onRemoveItem}
          title="Notes"
          icon={<StickyNote className="h-4 w-4" />}
          modeConfig={modeConfig}
        >
          <DiaryNotesPage items={pageItems.filter(i => i.item_type === 'todo')} onRemoveItem={onRemoveItem} />
        </ModuleWrapper>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex items-center justify-center p-4 md:p-8">
      {/* Book container */}
      <div 
        className="relative w-full max-w-5xl h-full flex"
        style={{ perspective: "2000px" }}
      >
        {/* Spiral binding */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-3 md:w-4 z-10 flex flex-col justify-around py-8 rounded-full bg-gradient-to-b from-gray-400 to-gray-600">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="w-3 md:w-4 h-2 rounded-full bg-gray-300 shadow-inner"
            />
          ))}
        </div>

        {/* Page with paper texture */}
        <div 
          ref={setNodeRef}
          id="diary-page-content"
          className={cn(
            "flex-1 ml-8 md:ml-12 rounded-r-lg shadow-2xl transition-all duration-400 overflow-hidden relative",
            isFlipping && flipDirection === 'right' && "animate-[flipRight_0.4s_ease-in-out]",
            isFlipping && flipDirection === 'left' && "animate-[flipLeft_0.4s_ease-in-out]",
            isOver && "ring-2 ring-primary ring-offset-2"
          )}
          style={{ 
            background: '#fefefe',
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")
            `,
            transformStyle: 'preserve-3d',
            boxShadow: '0 0 30px rgba(0,0,0,0.1), inset 0 0 50px rgba(0,0,0,0.02)',
          }}
        >
          {/* Paper texture overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.02) 0%, transparent 3%, transparent 97%, rgba(0,0,0,0.02) 100%)',
            }}
          />

          {/* Subtle lines (optional notebook style) */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                transparent,
                transparent 31px,
                #ccc 31px,
                #ccc 32px
              )`,
              backgroundPosition: '0 40px',
            }}
          />

          {/* Red margin line */}
          <div 
            className="absolute top-0 bottom-0 left-12 md:left-16 w-px opacity-20"
            style={{ background: '#e74c3c' }}
          />

          {/* Page content area */}
          <div className="relative h-full overflow-auto p-4 md:p-6 pl-16 md:pl-20">
            {/* Page header */}
            <div className="mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                {currentPage?.title || `Page ${currentPageIndex + 1}`}
              </h2>
              {currentPage?.semester && (
                <span className="text-sm text-gray-500">{currentPage.semester}</span>
              )}
            </div>

            {/* Drag hint when empty */}
            {pageItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">Drag modules and courses here</p>
                  <p className="text-sm">Use the sidebar to add content</p>
                </div>
              </div>
            )}

            {/* Render page items */}
            <div className="relative min-h-[500px]">
              {pageItems.filter(item => !item.zone).map(renderItem)}
            </div>
          </div>

          {/* Page curl effect */}
          <div 
            className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.03) 50%)',
            }}
          />
        </div>

        {/* Page turn buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 opacity-50 hover:opacity-100 bg-white/80 shadow-md"
          onClick={() => handlePageTurn('left')}
          disabled={currentPageIndex === 0 || isFlipping}
        >
          <ChevronLeft className="h-8 w-8 text-gray-600" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 opacity-50 hover:opacity-100 bg-white/80 shadow-md"
          onClick={() => handlePageTurn('right')}
          disabled={currentPageIndex === pages.length - 1 || isFlipping}
        >
          <ChevronRight className="h-8 w-8 text-gray-600" />
        </Button>

        {/* Page dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => onPageChange(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentPageIndex 
                  ? "bg-gray-700 scale-125" 
                  : "bg-gray-300 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ item, course, onRemove, modeConfig }: any) => (
  <div
    className="absolute group cursor-move"
    style={{
      left: item.position_x,
      top: item.position_y,
      width: item.width || 200,
    }}
  >
    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => onRemove(item.id)}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex items-start gap-2">
        <GraduationCap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-800 truncate">{course.name_course}</div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            {course.code && <span>{course.code}</span>}
            {course.ects && <span className="bg-blue-100 px-1.5 py-0.5 rounded">{course.ects} ECTS</span>}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Lab Card Component
const LabCard = ({ item, lab, onRemove, modeConfig }: any) => (
  <div
    className="absolute group cursor-move"
    style={{
      left: item.position_x,
      top: item.position_y,
      width: item.width || 200,
    }}
  >
    <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => onRemove(item.id)}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex items-start gap-2">
        <Beaker className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-800 truncate">{lab.name}</div>
          {lab.topics && (
            <div className="text-xs text-gray-500 mt-1 truncate">{lab.topics}</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Note Card Component
const NoteCard = ({ item, onRemove, onUpdate }: any) => {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-100 border-yellow-300',
    pink: 'bg-pink-100 border-pink-300',
    blue: 'bg-blue-100 border-blue-300',
    green: 'bg-green-100 border-green-300',
    purple: 'bg-purple-100 border-purple-300',
  };

  return (
    <div
      className="absolute group cursor-move"
      style={{
        left: item.position_x,
        top: item.position_y,
        width: item.width || 200,
      }}
    >
      <div className={cn("p-3 rounded-lg border shadow-sm", colors[item.color || 'yellow'])}>
        <button
          onClick={() => onRemove(item.id)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
        >
          <X className="h-3 w-3" />
        </button>
        <GripVertical className="h-3 w-3 text-gray-400 mb-2 opacity-0 group-hover:opacity-100" />
        <Textarea
          value={item.content || ''}
          onChange={(e) => onUpdate(item.id, { content: e.target.value })}
          placeholder="Write your note..."
          className="bg-transparent border-none resize-none p-0 text-sm text-gray-700 focus-visible:ring-0 min-h-[60px]"
        />
      </div>
    </div>
  );
};

// Module Wrapper Component
const ModuleWrapper = ({ item, onRemove, title, icon, children, modeConfig }: any) => (
  <div
    className="absolute group"
    style={{
      left: item.position_x,
      top: item.position_y,
      width: item.width || 400,
    }}
  >
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {icon}
          {title}
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="w-5 h-5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  </div>
);
