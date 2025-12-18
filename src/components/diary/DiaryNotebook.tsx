import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, X, GripVertical, GraduationCap, Beaker, StickyNote, BarChart3, Maximize2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DiaryPage, DiaryPageItem } from "@/types/diary";
import { DiarySemesterPlanner } from "./DiarySemesterPlanner";
import { DiaryLabTracker } from "./DiaryLabTracker";
import { DiaryNotesPage } from "./DiaryNotesPage";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { TeacherLink } from "@/components/TeacherLink";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
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
          .select('id_course, name_course, code, ects, type_exam, term, ba_ma, topics, professor_name, description, software_equipment, language')
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

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
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
            onClick={() => handleCourseClick(course)}
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
            onUpdate={onUpdateItem}
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
            onUpdate={onUpdateItem}
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
            onUpdate={onUpdateItem}
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
    <>
      <div className="h-full flex items-center justify-center p-2 sm:p-3 md:p-4">
        {/* Book container - fits screen */}
        <div 
          className="relative w-full h-full max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)] flex"
          style={{ perspective: "2000px" }}
        >
          {/* Black book spine */}
          <div className="w-3 sm:w-4 md:w-6 bg-gray-900 rounded-l-md shadow-lg flex-shrink-0" />

          {/* Page with paper texture - yellowish white */}
          <div 
            ref={(node) => {
              setNodeRef(node);
              if (pageRef) (pageRef as any).current = node;
            }}
            id="diary-page-content"
            className={cn(
              "flex-1 rounded-r-lg shadow-2xl transition-all duration-400 overflow-auto relative",
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
            <div className="relative h-full p-3 sm:p-4 md:p-6">
              {/* Page header */}
              <div className="mb-3 pb-2">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 font-serif">
                  {currentPage?.title || `Page ${currentPageIndex + 1}`}
                </h2>
                {currentPage?.semester && (
                  <span className="text-xs sm:text-sm text-gray-600">{currentPage.semester}</span>
                )}
              </div>

              {/* Drag hint when empty */}
              {pageItems.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                  <div className="text-center text-gray-500">
                    <GraduationCap className="h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-3 opacity-20" />
                    <p className="text-base sm:text-lg font-serif">Drag modules and courses here</p>
                    <p className="text-xs sm:text-sm mt-2">Use the sidebar to add content</p>
                  </div>
                </div>
              )}

              {/* Render page items with absolute positioning */}
              <div className="relative" style={{ minHeight: 'calc(100% - 60px)' }}>
                {pageItems.filter(item => !item.zone).map(renderItem)}
              </div>
            </div>

            {/* Subtle page curl effect */}
            <div 
              className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none"
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
            className="absolute left-8 sm:left-10 top-1/2 -translate-y-1/2 z-20 opacity-60 hover:opacity-100 bg-white/90 shadow-lg h-8 w-8 sm:h-10 sm:w-10 rounded-full"
            onClick={() => handlePageTurn('left')}
            disabled={currentPageIndex === 0 || isFlipping}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-1 sm:right-0 top-1/2 -translate-y-1/2 z-20 opacity-60 hover:opacity-100 bg-white/90 shadow-lg h-8 w-8 sm:h-10 sm:w-10 rounded-full"
            onClick={() => handlePageTurn('right')}
            disabled={currentPageIndex === pages.length - 1 || isFlipping}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </Button>

          {/* Page dots */}
          <div className="absolute -bottom-5 sm:bottom-1 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-20 bg-white/80 px-2 py-1 rounded-full shadow-sm">
            {pages.map((page, index) => (
              <button
                key={page.id}
                onClick={() => onPageChange(index)}
                className={cn(
                  "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all",
                  index === currentPageIndex 
                    ? "bg-gray-700 scale-110" 
                    : "bg-gray-300 hover:bg-gray-500"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Course Detail Popup */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-start gap-3">
              <GraduationCap className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <span>{selectedCourse?.name_course}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="flex flex-wrap gap-2">
                {selectedCourse.code && (
                  <Badge variant="secondary" className="font-mono">{selectedCourse.code}</Badge>
                )}
                {selectedCourse.ects && (
                  <Badge variant="outline">{selectedCourse.ects} ECTS</Badge>
                )}
                {selectedCourse.ba_ma && (
                  <Badge variant="outline">
                    {selectedCourse.ba_ma === 'Ba' ? 'Bachelor' : selectedCourse.ba_ma === 'Ma' ? 'Master' : selectedCourse.ba_ma}
                  </Badge>
                )}
                {selectedCourse.term && (
                  <Badge variant="outline">{selectedCourse.term}</Badge>
                )}
                {selectedCourse.language && (
                  <Badge variant="outline">{selectedCourse.language}</Badge>
                )}
              </div>

              {/* Description */}
              {selectedCourse.description && (
                <div>
                  <h4 className="font-medium text-sm mb-1 text-gray-700">Description</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.description}</p>
                </div>
              )}

              {/* Topics */}
              {selectedCourse.topics && (
                <div>
                  <h4 className="font-medium text-sm mb-1 text-gray-700">Topics</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.topics}</p>
                </div>
              )}

              {/* Professor */}
              {selectedCourse.professor_name && (
                <div>
                  <h4 className="font-medium text-sm mb-1 text-gray-700">Professor(s)</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.professor_name.split(';').map((name: string, idx: number) => (
                      <TeacherLink key={idx} teacherName={name.trim()} />
                    ))}
                  </div>
                </div>
              )}

              {/* Software/Equipment */}
              {selectedCourse.software_equipment && (
                <div>
                  <h4 className="font-medium text-sm mb-1 text-gray-700">Software & Equipment</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.software_equipment}</p>
                </div>
              )}

              {/* Exam Type */}
              {selectedCourse.type_exam && (
                <div>
                  <h4 className="font-medium text-sm mb-1 text-gray-700">Exam Type</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.type_exam}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Draggable Item Wrapper with resize support
const DraggableItem = ({ item, children, onUpdatePosition }: { item: DiaryPageItem; children: React.ReactNode; onUpdatePosition: (id: string, updates: any) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: item.position_x, y: item.position_y });
  const [size, setSize] = useState({ width: item.width || 220, height: item.height || 100 });
  const dragRef = useRef<{ startX: number; startY: number; itemX: number; itemY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, textarea, input, .resize-handle')) return;
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
    if (isDragging && dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(0, dragRef.current.itemX + dx),
        y: Math.max(0, dragRef.current.itemY + dy),
      });
    }
    if (isResizing && resizeRef.current) {
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      setSize({
        width: Math.max(150, resizeRef.current.startWidth + dx),
        height: Math.max(80, resizeRef.current.startHeight + dy),
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onUpdatePosition(item.id, { position_x: position.x, position_y: position.y });
    }
    if (isResizing) {
      setIsResizing(false);
      onUpdatePosition(item.id, { width: size.width, height: size.height });
    }
    dragRef.current = null;
    resizeRef.current = null;
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  // Sync position from props when item updates
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: item.position_x, y: item.position_y });
    }
  }, [item.position_x, item.position_y, isDragging]);

  useEffect(() => {
    if (!isResizing) {
      setSize({ width: item.width || 220, height: item.height || 100 });
    }
  }, [item.width, item.height, isResizing]);

  return (
    <div
      className={cn("absolute group", (isDragging || isResizing) && "opacity-80 z-50")}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      {/* Resize handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeStart}
      >
        <Maximize2 className="h-3 w-3 text-gray-400 rotate-90" />
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ item, course, onRemove, onClick }: any) => (
  <div className="group relative h-full">
    <div 
      className="p-3 rounded-lg bg-blue-50/90 border border-blue-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-blue-100/90 h-full"
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
  <div className="group relative h-full">
    <div className="p-3 rounded-lg bg-purple-50/90 border border-purple-200 shadow-sm hover:shadow-md transition-shadow h-full">
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

// Note Card Component with color picker
const NoteCard = ({ item, onRemove, onUpdate }: any) => {
  const allColors: Record<string, { bg: string; border: string; name: string }> = {
    yellow: { bg: 'bg-yellow-100/90', border: 'border-yellow-300', name: 'Yellow' },
    pink: { bg: 'bg-pink-100/90', border: 'border-pink-300', name: 'Pink' },
    blue: { bg: 'bg-blue-100/90', border: 'border-blue-300', name: 'Blue' },
    green: { bg: 'bg-green-100/90', border: 'border-green-300', name: 'Green' },
    purple: { bg: 'bg-purple-100/90', border: 'border-purple-300', name: 'Purple' },
    orange: { bg: 'bg-orange-100/90', border: 'border-orange-300', name: 'Orange' },
    cyan: { bg: 'bg-cyan-100/90', border: 'border-cyan-300', name: 'Cyan' },
    rose: { bg: 'bg-rose-100/90', border: 'border-rose-300', name: 'Rose' },
  };

  const currentColor = allColors[item.color || 'yellow'] || allColors.yellow;

  return (
    <div className="group relative h-full">
      <div className={cn("p-3 rounded-lg border shadow-sm h-full flex flex-col", currentColor.bg, currentColor.border)}>
        <button
          onClick={() => onRemove(item.id)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
        >
          <X className="h-3 w-3" />
        </button>
        
        {/* Color picker */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="absolute -top-2 left-2 w-5 h-5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 border">
              <Palette className="h-3 w-3 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="grid grid-cols-4 gap-1">
              {Object.entries(allColors).map(([colorId, colorData]) => (
                <button
                  key={colorId}
                  onClick={() => onUpdate(item.id, { color: colorId })}
                  className={cn(
                    "w-6 h-6 rounded border-2 transition-all",
                    colorData.bg,
                    item.color === colorId ? 'ring-2 ring-gray-400 scale-110' : 'hover:scale-105'
                  )}
                  title={colorData.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <GripVertical className="h-3 w-3 text-gray-400 mb-2 opacity-50" />
        <Textarea
          value={item.content || ''}
          onChange={(e) => onUpdate(item.id, { content: e.target.value })}
          placeholder="Write your note..."
          className="bg-transparent border-none resize-none p-0 text-sm text-gray-700 focus-visible:ring-0 flex-1 min-h-[40px]"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

// Module Wrapper Component with resize support
const ModuleWrapper = ({ item, onRemove, onUpdate, title, icon, children }: any) => (
  <div className="group relative h-full">
    <div className="rounded-lg border border-gray-300 bg-white/95 shadow-md overflow-hidden h-full flex flex-col">
      <button
        onClick={() => onRemove(item.id)}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="px-3 py-2 bg-gray-100/80 border-b border-gray-200 flex items-center gap-2">
        <GripVertical className="h-3 w-3 text-gray-400" />
        {icon}
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      <div className="p-3 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  </div>
);
