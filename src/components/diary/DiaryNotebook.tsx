import { useState, useRef } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, X, GripVertical, GraduationCap, Beaker, StickyNote, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);

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

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const renderItem = (item: DiaryPageItem) => {
    if (item.item_type === 'course') {
      const course = courses.find(c => c.id_course === item.reference_id);
      if (!course) return null;
      return (
        <DraggableItem key={item.id} item={item} onUpdatePosition={onUpdateItem}>
          <CourseCard 
            item={item} 
            course={course} 
            onRemove={onRemoveItem}
            onClick={() => handleCourseClick(course.id_course)}
          />
        </DraggableItem>
      );
    }

    if (item.item_type === 'lab') {
      const lab = labs.find(l => l.id_lab === item.reference_id);
      if (!lab) return null;
      return (
        <DraggableItem key={item.id} item={item} onUpdatePosition={onUpdateItem}>
          <LabCard 
            item={item} 
            lab={lab} 
            onRemove={onRemoveItem}
          />
        </DraggableItem>
      );
    }

    if (item.item_type === 'note') {
      return (
        <DraggableItem key={item.id} item={item} onUpdatePosition={onUpdateItem}>
          <NoteCard 
            item={item} 
            onRemove={onRemoveItem}
            onUpdate={onUpdateItem}
          />
        </DraggableItem>
      );
    }

    if (item.item_type === 'semester_planner' as any) {
      return (
        <DraggableItem key={item.id} item={item} onUpdatePosition={onUpdateItem}>
          <ModuleWrapper 
            item={item} 
            onRemove={onRemoveItem}
            title="Semester Planner"
            icon={<BarChart3 className="h-4 w-4" />}
          >
            <DiarySemesterPlanner
              pageId={currentPage?.id || ''}
              items={pageItems.filter(i => i.zone)}
              courses={courses}
              onRemoveItem={onRemoveItem}
              onCourseClick={handleCourseClick}
            />
          </ModuleWrapper>
        </DraggableItem>
      );
    }

    if (item.item_type === 'lab_tracker' as any) {
      return (
        <DraggableItem key={item.id} item={item} onUpdatePosition={onUpdateItem}>
          <ModuleWrapper 
            item={item} 
            onRemove={onRemoveItem}
            title="Lab Tracker"
            icon={<Beaker className="h-4 w-4" />}
          >
            <DiaryLabTracker 
              page={currentPage!}
              items={pageItems.filter(i => i.item_type === 'lab')}
              onRemoveItem={onRemoveItem}
              isLoading={false}
            />
          </ModuleWrapper>
        </DraggableItem>
      );
    }

    if (item.item_type === 'notes_module' as any) {
      return (
        <DraggableItem key={item.id} item={item} onUpdatePosition={onUpdateItem}>
          <ModuleWrapper 
            item={item} 
            onRemove={onRemoveItem}
            title="Notes"
            icon={<StickyNote className="h-4 w-4" />}
          >
            <DiaryNotesPage 
              page={currentPage!}
              items={pageItems.filter(i => i.item_type === 'note' || i.item_type === 'todo')}
              onRemoveItem={onRemoveItem}
              isLoading={false}
            />
          </ModuleWrapper>
        </DraggableItem>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Book container */}
      <div 
        className="relative w-full max-w-6xl h-full min-h-[60vh] md:min-h-[70vh] flex"
        style={{ perspective: "2000px" }}
      >
        {/* Black book spine */}
        <div className="w-4 sm:w-6 md:w-8 bg-gray-900 rounded-l-md shadow-lg flex-shrink-0" />

        {/* Page with paper texture - yellowish white */}
        <div 
          ref={(node) => {
            setNodeRef(node);
            if (pageRef) (pageRef as any).current = node;
          }}
          id="diary-page-content"
          className={cn(
            "flex-1 rounded-r-lg shadow-2xl transition-all duration-400 overflow-hidden relative",
            isFlipping && flipDirection === 'right' && "animate-[flipRight_0.4s_ease-in-out]",
            isFlipping && flipDirection === 'left' && "animate-[flipLeft_0.4s_ease-in-out]",
            isOver && "ring-2 ring-amber-400 ring-offset-2"
          )}
          style={{ 
            background: '#fdf8e8',
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.06'/%3E%3C/svg%3E")
            `,
            transformStyle: 'preserve-3d',
            boxShadow: '6px 6px 30px rgba(0,0,0,0.2), -1px 0 3px rgba(0,0,0,0.1), inset 0 0 80px rgba(139,119,80,0.05)',
          }}
        >
          {/* Page content area */}
          <div className="relative h-full overflow-auto p-4 sm:p-6 md:p-8">
            {/* Page header */}
            <div className="mb-4 pb-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 font-serif">
                {currentPage?.title || `Page ${currentPageIndex + 1}`}
              </h2>
              {currentPage?.semester && (
                <span className="text-sm text-gray-600">{currentPage.semester}</span>
              )}
            </div>

            {/* Drag hint when empty */}
            {pageItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                <div className="text-center text-gray-500">
                  <GraduationCap className="h-16 sm:h-20 w-16 sm:w-20 mx-auto mb-4 opacity-20" />
                  <p className="text-lg sm:text-xl font-serif">Drag modules and courses here</p>
                  <p className="text-sm mt-2">Use the sidebar to add content</p>
                </div>
              </div>
            )}

            {/* Render page items with absolute positioning */}
            <div className="relative min-h-[600px]">
              {pageItems.filter(item => !item.zone).map(renderItem)}
            </div>
          </div>

          {/* Subtle page curl effect */}
          <div 
            className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, transparent 50%, rgba(139,119,80,0.08) 50%)',
              borderRadius: '0 0 8px 0',
            }}
          />
        </div>

        {/* Page turn buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-10 sm:left-12 top-1/2 -translate-y-1/2 z-20 opacity-60 hover:opacity-100 bg-white/90 shadow-lg h-10 w-10 sm:h-12 sm:w-12 rounded-full"
          onClick={() => handlePageTurn('left')}
          disabled={currentPageIndex === 0 || isFlipping}
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-20 opacity-60 hover:opacity-100 bg-white/90 shadow-lg h-10 w-10 sm:h-12 sm:w-12 rounded-full"
          onClick={() => handlePageTurn('right')}
          disabled={currentPageIndex === pages.length - 1 || isFlipping}
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </Button>

        {/* Page dots */}
        <div className="absolute -bottom-6 sm:bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => onPageChange(index)}
              className={cn(
                "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all",
                index === currentPageIndex 
                  ? "bg-gray-700 scale-110" 
                  : "bg-gray-300 hover:bg-gray-500"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Draggable Item Wrapper for free positioning
const DraggableItem = ({ item, children, onUpdatePosition }: { item: DiaryPageItem; children: React.ReactNode; onUpdatePosition: (id: string, updates: any) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: item.position_x, y: item.position_y });
  const dragRef = useRef<{ startX: number; startY: number; itemX: number; itemY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, textarea, input')) return;
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      itemX: position.x,
      itemY: position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: Math.max(0, dragRef.current.itemX + dx),
      y: Math.max(0, dragRef.current.itemY + dy),
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onUpdatePosition(item.id, { position_x: position.x, position_y: position.y });
    }
    dragRef.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Sync position from props when item updates
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: item.position_x, y: item.position_y });
    }
  }, [item.position_x, item.position_y, isDragging]);

  return (
    <div
      className={cn("absolute", isDragging && "opacity-80 z-50 cursor-grabbing")}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};

// Course Card Component
const CourseCard = ({ item, course, onRemove, onClick }: any) => (
  <div
    className="group"
    style={{ width: item.width || 220 }}
  >
    <div 
      className="p-3 rounded-lg bg-blue-50/90 border border-blue-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-blue-100/90"
      onClick={onClick}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex items-start gap-2">
        <GraduationCap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-800 line-clamp-2">{course.name_course}</div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600 flex-wrap">
            {course.code && <span className="font-mono">{course.code}</span>}
            {course.ects && <span className="bg-blue-200/60 px-1.5 py-0.5 rounded font-medium">{course.ects} ECTS</span>}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Lab Card Component
const LabCard = ({ item, lab, onRemove }: any) => (
  <div
    className="group"
    style={{ width: item.width || 220 }}
  >
    <div className="p-3 rounded-lg bg-purple-50/90 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => onRemove(item.id)}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex items-start gap-2">
        <Beaker className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-800 line-clamp-2">{lab.name}</div>
          {lab.topics && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-1">{lab.topics}</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Note Card Component
const NoteCard = ({ item, onRemove, onUpdate }: any) => {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-100/90 border-yellow-300',
    pink: 'bg-pink-100/90 border-pink-300',
    blue: 'bg-blue-100/90 border-blue-300',
    green: 'bg-green-100/90 border-green-300',
    purple: 'bg-purple-100/90 border-purple-300',
  };

  return (
    <div
      className="group"
      style={{ width: item.width || 200 }}
    >
      <div className={cn("p-3 rounded-lg border shadow-sm", colors[item.color || 'yellow'])}>
        <button
          onClick={() => onRemove(item.id)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
        >
          <X className="h-3 w-3" />
        </button>
        <GripVertical className="h-3 w-3 text-gray-400 mb-2 opacity-50" />
        <Textarea
          value={item.content || ''}
          onChange={(e) => onUpdate(item.id, { content: e.target.value })}
          placeholder="Write your note..."
          className="bg-transparent border-none resize-none p-0 text-sm text-gray-700 focus-visible:ring-0 min-h-[60px]"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

// Module Wrapper Component
const ModuleWrapper = ({ item, onRemove, title, icon, children }: any) => (
  <div
    className="group"
    style={{ width: item.width || 450 }}
  >
    <div className="rounded-lg border border-gray-300 bg-white/95 shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100/80 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <GripVertical className="h-3 w-3 text-gray-400 cursor-grab" />
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