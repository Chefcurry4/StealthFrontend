import { useState, useRef, useEffect, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronLeft, ChevronRight, X, GripVertical, GraduationCap, Beaker, StickyNote, BarChart3, Palette, Copy, Pencil, Maximize2, Minimize2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DiaryPage, DiaryPageItem } from "@/types/diary";
import { DiarySemesterPlanner } from "./DiarySemesterPlanner";
import { DiaryLabTracker } from "./DiaryLabTracker";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { TeacherLink } from "@/components/TeacherLink";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

// Grid size for snapping
const GRID_SIZE = 20;
// Edge snap threshold
const EDGE_SNAP_THRESHOLD = 15;
// Page boundaries (approximate)
const PAGE_PADDING = 20;

// Snap to grid helper
const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

// Snap to edge helper - snaps when close to edges or other items
const snapToEdge = (
  value: number, 
  size: number, 
  pageSize: number, 
  otherItems: { pos: number; size: number }[]
): number => {
  // Snap to page start
  if (value < EDGE_SNAP_THRESHOLD + PAGE_PADDING) return PAGE_PADDING;
  
  // Snap to page end
  const endPos = pageSize - size - PAGE_PADDING;
  if (value > endPos - EDGE_SNAP_THRESHOLD) return endPos;
  
  // Snap to other items
  for (const item of otherItems) {
    // Snap to item's left edge
    if (Math.abs(value - item.pos) < EDGE_SNAP_THRESHOLD) return item.pos;
    // Snap to item's right edge
    if (Math.abs(value - (item.pos + item.size)) < EDGE_SNAP_THRESHOLD) return item.pos + item.size;
    // Snap current item's right to other item's left
    if (Math.abs(value + size - item.pos) < EDGE_SNAP_THRESHOLD) return item.pos - size;
    // Snap current item's right to other item's right
    if (Math.abs(value + size - (item.pos + item.size)) < EDGE_SNAP_THRESHOLD) return item.pos + item.size - size;
  }
  
  return snapToGrid(value);
};

interface DiaryNotebookProps {
  pages: DiaryPage[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  notebookId: string;
  pageItems: DiaryPageItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: any) => void;
  onDuplicateItem?: (item: DiaryPageItem) => void;
  onUpdatePage?: (pageId: string, updates: { title?: string; semester?: string }) => void;
  onReorderPages?: (activeId: string, overId: string) => void;
  isFullView?: boolean;
  onToggleFullView?: () => void;
}

export const DiaryNotebook = ({
  pages,
  currentPageIndex,
  onPageChange,
  notebookId,
  pageItems,
  onRemoveItem,
  onUpdateItem,
  onDuplicateItem,
  onUpdatePage,
  onReorderPages,
  isFullView = false,
  onToggleFullView,
}: DiaryNotebookProps) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [showGrid, setShowGrid] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<DiaryPageItem | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const pageSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const { setNodeRef, isOver } = useDroppable({
    id: 'diary-page-canvas',
  });

  // Keyboard shortcuts for copy/paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedItemId) {
        const item = pageItems.find(i => i.id === selectedItemId);
        if (item) {
          setCopiedItem(item);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedItem && onDuplicateItem) {
        onDuplicateItem({
          ...copiedItem,
          position_x: copiedItem.position_x + 40,
          position_y: copiedItem.position_y + 40,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, copiedItem, pageItems, onDuplicateItem]);

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
      }, 300);
    }
  };

  const currentPage = pages[currentPageIndex];

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
  };

  const handleTitleEdit = () => {
    setEditedTitle(currentPage?.title || '');
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (currentPage && onUpdatePage && editedTitle.trim()) {
      onUpdatePage(currentPage.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionEdit = () => {
    setEditedDescription(currentPage?.semester || '');
    setIsEditingDescription(true);
  };

  const handleDescriptionSave = () => {
    if (currentPage && onUpdatePage) {
      onUpdatePage(currentPage.id, { semester: editedDescription.trim() || undefined });
    }
    setIsEditingDescription(false);
  };

  const handlePageReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderPages) {
      onReorderPages(active.id as string, over.id as string);
    }
  };

  const currentPageItemsFiltered = pageItems.filter(item => !item.zone);
  
  const renderItem = (item: DiaryPageItem) => {
    const commonProps = {
      item,
      onUpdatePosition: onUpdateItem,
      otherItems: currentPageItemsFiltered,
      isSelected: selectedItemId === item.id,
      onSelect: setSelectedItemId,
    };

    if (item.item_type === 'course') {
      const course = courses.find(c => c.id_course === item.reference_id);
      if (!course) return null;
      return (
        <DraggableItem key={item.id} {...commonProps} onClickAction={() => handleCourseClick(course)}>
          <CourseCard 
            item={item} 
            course={course} 
            onRemove={onRemoveItem}
            onDuplicate={onDuplicateItem}
          />
        </DraggableItem>
      );
    }

    if (item.item_type === 'lab') {
      const lab = labs.find(l => l.id_lab === item.reference_id);
      if (!lab) return null;
      return (
        <DraggableItem key={item.id} {...commonProps}>
          <LabCard 
            item={item} 
            lab={lab} 
            onRemove={onRemoveItem}
            onDuplicate={onDuplicateItem}
          />
        </DraggableItem>
      );
    }

    if (item.item_type === 'note') {
      return (
        <DraggableItem key={item.id} {...commonProps}>
          <NoteCard 
            item={item} 
            onRemove={onRemoveItem}
            onUpdate={onUpdateItem}
            onDuplicate={onDuplicateItem}
          />
        </DraggableItem>
      );
    }

    if (item.item_type === 'semester_planner' as any) {
      return (
        <DraggableItem key={item.id} {...commonProps}>
          <ModuleWrapper 
            item={item} 
            onRemove={onRemoveItem}
            onUpdate={onUpdateItem}
            title="Semester Planner"
            icon={<BarChart3 className="h-3 w-3" />}
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
        <DraggableItem key={item.id} {...commonProps}>
          <ModuleWrapper 
            item={item} 
            onRemove={onRemoveItem}
            onUpdate={onUpdateItem}
            title="Lab Tracker"
            icon={<Beaker className="h-3 w-3" />}
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

    if (item.item_type === 'text' as any) {
      return (
        <DraggableItem key={item.id} {...commonProps}>
          <TextCard 
            item={item} 
            onRemove={onRemoveItem}
            onUpdate={onUpdateItem}
            onDuplicate={onDuplicateItem}
          />
        </DraggableItem>
      );
    }

    return null;
  };

  return (
    <>
      <div className={cn(
        "h-full flex items-center justify-center p-2 sm:p-3 md:p-4",
        isFullView && "fixed inset-0 z-50 bg-black/80 p-8"
      )}>
        {/* Floating close button for full view */}
        {isFullView && onToggleFullView && (
          <Button
            variant="default"
            size="sm"
            onClick={onToggleFullView}
            className="fixed top-4 right-4 z-[60] bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl border-2 border-primary-foreground/20"
          >
            <X className="h-4 w-4 mr-1.5" />
            Exit Full View
          </Button>
        )}
        {/* Book container - fits screen */}
        <div 
          className={cn(
            "relative w-full h-full flex",
            isFullView ? "max-w-5xl max-h-[90vh]" : "max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-160px)]"
          )}
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
              "flex-1 rounded-r-lg shadow-2xl overflow-auto relative",
              isFlipping && flipDirection === 'right' && "animate-[flipRight_0.3s_ease-in-out]",
              isFlipping && flipDirection === 'left' && "animate-[flipLeft_0.3s_ease-in-out]",
              isOver && "ring-2 ring-amber-400 ring-offset-2"
            )}
            style={{ 
              background: '#fdf8e8',
              backgroundImage: `
                url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.06'/%3E%3C/svg%3E")
              `,
              transformStyle: 'preserve-3d',
              boxShadow: '6px 6px 30px rgba(0,0,0,0.2), -1px 0 3px rgba(0,0,0,0.1), inset 0 0 80px rgba(139,119,80,0.05)',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Grid overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none z-0 opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(139,119,80,0.2) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(139,119,80,0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                }}
              />
            )}

            {/* Student Hub logo on top right */}
            <div className="absolute top-2 right-3 flex items-center gap-2 z-10 opacity-70">
              <GraduationCap className="h-5 w-5 text-gray-600" />
              <span className="text-xs font-semibold text-gray-600 tracking-wide">Students Hub</span>
            </div>

            {/* Page content area */}
            <div className="relative h-full p-3 sm:p-4 md:p-5">
              {/* Page header with editable title */}
              <div className="mb-2 pb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                        onBlur={handleTitleSave}
                        autoFocus
                        className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 font-serif bg-transparent border-gray-300 h-7"
                      />
                    </div>
                  ) : (
                    <h2 
                      className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 font-serif flex items-center gap-2 cursor-pointer hover:text-gray-600 group"
                      onClick={handleTitleEdit}
                    >
                      {currentPage?.title || `Page ${currentPageIndex + 1}`}
                      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </h2>
                  )}
                  {isEditingDescription ? (
                    <Input
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDescriptionSave()}
                      onBlur={handleDescriptionSave}
                      autoFocus
                      placeholder="Write a description here..."
                      className="text-xs text-gray-600 bg-transparent border-gray-300 h-5 mt-0.5"
                    />
                  ) : (
                    <p 
                      className="text-xs text-gray-600 cursor-pointer hover:text-gray-500 flex items-center gap-1 group mt-0.5"
                      onClick={handleDescriptionEdit}
                    >
                      {currentPage?.semester || 'Write a description here...'}
                      <Pencil className="h-2 w-2 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </p>
                  )}
                  {/* Creation date */}
                  {currentPage?.created_at && (
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      Created {format(new Date(currentPage.created_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                {/* Grid toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGrid(!showGrid)}
                  className={cn("h-6 w-6 opacity-60 hover:opacity-100", showGrid && "opacity-100 bg-gray-200")}
                  title={showGrid ? "Hide grid" : "Show grid"}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="1" width="6" height="6" />
                    <rect x="9" y="1" width="6" height="6" />
                    <rect x="1" y="9" width="6" height="6" />
                    <rect x="9" y="9" width="6" height="6" />
                  </svg>
                </Button>
                {/* Full view toggle */}
                {onToggleFullView && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleFullView}
                    className="h-6 w-6 opacity-60 hover:opacity-100"
                  >
                    {isFullView ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </Button>
                )}
              </div>

              {/* Drag hint when empty */}
              {pageItems.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                  <div className="text-center text-gray-500">
                    <GraduationCap className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm sm:text-base font-serif">Drag modules and courses here</p>
                    <p className="text-xs mt-1">Use the sidebar to add content</p>
                  </div>
                </div>
              )}

              {/* Render page items with absolute positioning - large area for free placement */}
              <div 
                className="relative" 
                style={{ minHeight: '2000px' }} 
                onClick={() => setSelectedItemId(null)}
              >
                {currentPageItemsFiltered.map(renderItem)}
              </div>
            </div>

            {/* Subtle page curl effect */}
            <div 
              className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none"
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
            className="absolute left-8 sm:left-10 top-1/2 -translate-y-1/2 z-20 opacity-60 hover:opacity-100 bg-white/90 shadow-lg h-7 w-7 sm:h-8 sm:w-8 rounded-full"
            onClick={() => handlePageTurn('left')}
            disabled={currentPageIndex === 0 || isFlipping}
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-1 sm:right-0 top-1/2 -translate-y-1/2 z-20 opacity-60 hover:opacity-100 bg-white/90 shadow-lg h-7 w-7 sm:h-8 sm:w-8 rounded-full"
            onClick={() => handlePageTurn('right')}
            disabled={currentPageIndex === pages.length - 1 || isFlipping}
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </Button>

          {/* Draggable Page dots */}
          <DndContext sensors={pageSensors} collisionDetection={closestCenter} onDragEnd={handlePageReorder}>
            <SortableContext items={pages.map(p => p.id)} strategy={horizontalListSortingStrategy}>
              <div className="absolute -bottom-4 sm:bottom-1 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-20 bg-white/80 px-2 py-1 rounded-full shadow-sm">
                {pages.map((page, index) => (
                  <SortablePageDot
                    key={page.id}
                    page={page}
                    index={index}
                    isActive={index === currentPageIndex}
                    onClick={() => onPageChange(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Course Detail Popup - Improved styling */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-auto bg-gradient-to-br from-white to-blue-50/50">
          <DialogHeader>
            <DialogTitle className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-lg">{selectedCourse?.name_course}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4 mt-2">
              {/* Basic Info */}
              <div className="flex flex-wrap gap-2">
                {selectedCourse.code && (
                  <Badge variant="secondary" className="font-mono bg-gray-100">{selectedCourse.code}</Badge>
                )}
                {selectedCourse.ects && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{selectedCourse.ects} ECTS</Badge>
                )}
                {selectedCourse.ba_ma && (
                  <Badge variant="outline" className="border-purple-200 text-purple-700">
                    {selectedCourse.ba_ma === 'Ba' ? 'Bachelor' : selectedCourse.ba_ma === 'Ma' ? 'Master' : selectedCourse.ba_ma}
                  </Badge>
                )}
                {selectedCourse.term && (
                  <Badge variant="outline" className="border-green-200 text-green-700">{selectedCourse.term}</Badge>
                )}
                {selectedCourse.language && (
                  <Badge variant="outline" className="border-amber-200 text-amber-700">{selectedCourse.language}</Badge>
                )}
              </div>

              {/* Description */}
              {selectedCourse.description && (
                <div className="p-3 rounded-lg bg-white/80 border border-gray-100">
                  <h4 className="font-medium text-xs mb-1 text-gray-500 uppercase tracking-wide">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedCourse.description}</p>
                </div>
              )}

              {/* Topics */}
              {selectedCourse.topics && (
                <div className="p-3 rounded-lg bg-white/80 border border-gray-100">
                  <h4 className="font-medium text-xs mb-1 text-gray-500 uppercase tracking-wide">Topics</h4>
                  <p className="text-sm text-gray-700">{selectedCourse.topics}</p>
                </div>
              )}

              {/* Professor */}
              {selectedCourse.professor_name && (
                <div className="p-3 rounded-lg bg-white/80 border border-gray-100">
                  <h4 className="font-medium text-xs mb-2 text-gray-500 uppercase tracking-wide">Professor(s)</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.professor_name.split(';').map((name: string, idx: number) => (
                      <TeacherLink key={idx} teacherName={name.trim()} />
                    ))}
                  </div>
                </div>
              )}

              {/* Software/Equipment */}
              {selectedCourse.software_equipment && (
                <div className="p-3 rounded-lg bg-white/80 border border-gray-100">
                  <h4 className="font-medium text-xs mb-1 text-gray-500 uppercase tracking-wide">Software & Equipment</h4>
                  <p className="text-sm text-gray-700">{selectedCourse.software_equipment}</p>
                </div>
              )}

              {/* Exam Type */}
              {selectedCourse.type_exam && (
                <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-100">
                  <h4 className="font-medium text-xs mb-1 text-amber-600 uppercase tracking-wide">Exam Type</h4>
                  <p className="text-sm text-gray-700 font-medium">{selectedCourse.type_exam}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Sortable Page Dot Component
const SortablePageDot = ({ 
  page, 
  index, 
  isActive, 
  onClick 
}: { 
  page: DiaryPage; 
  index: number; 
  isActive: boolean; 
  onClick: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms ease',
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full cursor-grab active:cursor-grabbing",
        isActive 
          ? "bg-gray-700 scale-125 shadow-sm" 
          : "bg-gray-300 hover:bg-gray-500 hover:scale-110",
        isDragging && "opacity-70 scale-150",
        "transition-all duration-150"
      )}
      title={page.title || `Page ${index + 1}`}
    />
  );
};

// Draggable Item Wrapper with resize support, grid snapping, and edge snapping
const DraggableItem = ({ 
  item, 
  children, 
  onUpdatePosition,
  onClickAction,
  otherItems = [],
  isSelected,
  onSelect,
}: { 
  item: DiaryPageItem; 
  children: React.ReactNode; 
  onUpdatePosition: (id: string, updates: any) => void;
  onClickAction?: () => void;
  otherItems?: DiaryPageItem[];
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [position, setPosition] = useState({ x: item.position_x, y: item.position_y });
  const [size, setSize] = useState({ width: item.width || 180, height: item.height || 80 });
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; itemX: number; itemY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number; startLeft: number; startTop: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get dynamic page dimensions from container - allow unlimited vertical space
  const getPageDimensions = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Use actual width, but allow virtually unlimited height for vertical scrolling
      return { width: Math.max(rect.width, 800), height: 10000 };
    }
    return { width: 800, height: 10000 };
  };

  // Build other items position data for edge snapping
  const otherItemsX = otherItems
    .filter(i => i.id !== item.id)
    .map(i => ({ pos: i.position_x, size: i.width || 180 }));
  const otherItemsY = otherItems
    .filter(i => i.id !== item.id)
    .map(i => ({ pos: i.position_y, size: i.height || 80 }));

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, textarea, input, .resize-handle')) return;
    e.preventDefault();
    onSelect?.(item.id);
    setIsDragging(true);
    setHasMoved(false);
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
      
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setHasMoved(true);
      }
      
      // Get dynamic page dimensions
      const { width: pageWidth, height: pageHeight } = getPageDimensions();
      
      // Apply edge snapping with fallback to grid snapping - allow free positioning
      const rawX = Math.max(0, dragRef.current.itemX + dx);
      const rawY = Math.max(0, dragRef.current.itemY + dy);
      const newX = snapToEdge(rawX, size.width, pageWidth, otherItemsX);
      const newY = snapToEdge(rawY, size.height, pageHeight, otherItemsY);
      
      setPosition({ x: newX, y: newY });
    }
    if (isResizing && resizeRef.current) {
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      
      let newWidth = resizeRef.current.startWidth;
      let newHeight = resizeRef.current.startHeight;
      let newX = position.x;
      let newY = position.y;
      
      // Handle different resize directions with grid snapping
      if (resizeDirection?.includes('e')) newWidth = snapToGrid(Math.max(100, resizeRef.current.startWidth + dx));
      if (resizeDirection?.includes('w')) {
        newWidth = snapToGrid(Math.max(100, resizeRef.current.startWidth - dx));
        newX = snapToGrid(resizeRef.current.startLeft + dx);
      }
      if (resizeDirection?.includes('s')) newHeight = snapToGrid(Math.max(60, resizeRef.current.startHeight + dy));
      if (resizeDirection?.includes('n')) {
        newHeight = snapToGrid(Math.max(60, resizeRef.current.startHeight - dy));
        newY = snapToGrid(resizeRef.current.startTop + dy);
      }
      
      setSize({ width: newWidth, height: newHeight });
      if (resizeDirection?.includes('w') || resizeDirection?.includes('n')) {
        setPosition({ x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (hasMoved) {
        setPendingUpdate(true);
        onUpdatePosition(item.id, { position_x: position.x, position_y: position.y });
        setTimeout(() => setPendingUpdate(false), 300);
      } else if (onClickAction) {
        onClickAction();
      }
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeDirection(null);
      setPendingUpdate(true);
      onUpdatePosition(item.id, { 
        width: size.width, 
        height: size.height,
        position_x: position.x,
        position_y: position.y
      });
      setTimeout(() => setPendingUpdate(false), 300);
    }
    dragRef.current = null;
    resizeRef.current = null;
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
      startLeft: position.x,
      startTop: position.y,
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
  }, [isDragging, isResizing, position, size, resizeDirection]);

  // Sync position from props - but NOT when we're dragging or have a pending update
  useEffect(() => {
    if (!isDragging && !pendingUpdate && !isResizing) {
      setPosition({ x: item.position_x, y: item.position_y });
    }
  }, [item.position_x, item.position_y, isDragging, pendingUpdate, isResizing]);

  useEffect(() => {
    if (!isResizing && !pendingUpdate) {
      setSize({ width: item.width || 180, height: item.height || 80 });
    }
  }, [item.width, item.height, isResizing, pendingUpdate]);

  const resizeHandleClass = "resize-handle absolute opacity-0 group-hover:opacity-100 bg-transparent z-10 transition-opacity duration-150";

  return (
    <div
      className={cn(
        "absolute group",
        isDragging && "z-50 shadow-2xl",
        isResizing && "z-50",
        isSelected && !isDragging && "ring-2 ring-blue-400 ring-offset-1"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging || isResizing 
          ? 'box-shadow 0.15s ease-out, transform 0.15s ease-out' 
          : 'left 0.2s ease-out, top 0.2s ease-out, width 0.2s ease-out, height 0.2s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out',
        willChange: isDragging || isResizing ? 'left, top, width, height' : 'auto',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="h-full">{children}</div>
      
      {/* Edge resize handles */}
      <div className={cn(resizeHandleClass, "top-0 left-2 right-2 h-1 cursor-n-resize")} onMouseDown={(e) => handleResizeStart(e, 'n')} />
      <div className={cn(resizeHandleClass, "bottom-0 left-2 right-2 h-1 cursor-s-resize")} onMouseDown={(e) => handleResizeStart(e, 's')} />
      <div className={cn(resizeHandleClass, "left-0 top-2 bottom-2 w-1 cursor-w-resize")} onMouseDown={(e) => handleResizeStart(e, 'w')} />
      <div className={cn(resizeHandleClass, "right-0 top-2 bottom-2 w-1 cursor-e-resize")} onMouseDown={(e) => handleResizeStart(e, 'e')} />
      
      {/* Corner resize handles */}
      <div className={cn(resizeHandleClass, "top-0 left-0 w-2 h-2 cursor-nw-resize")} onMouseDown={(e) => handleResizeStart(e, 'nw')} />
      <div className={cn(resizeHandleClass, "top-0 right-0 w-2 h-2 cursor-ne-resize")} onMouseDown={(e) => handleResizeStart(e, 'ne')} />
      <div className={cn(resizeHandleClass, "bottom-0 left-0 w-2 h-2 cursor-sw-resize")} onMouseDown={(e) => handleResizeStart(e, 'sw')} />
      <div className={cn(resizeHandleClass, "bottom-0 right-0 w-2 h-2 cursor-se-resize flex items-end justify-end pr-0.5 pb-0.5")} onMouseDown={(e) => handleResizeStart(e, 'se')}>
        <Maximize2 className="h-2 w-2 text-gray-400 rotate-90" />
      </div>
    </div>
  );
};

// Course Card Component - smaller
const CourseCard = ({ item, course, onRemove, onDuplicate }: any) => (
  <div className="group relative h-full">
    <div className="p-2 rounded-lg bg-blue-50/90 border border-blue-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-blue-100/90 h-full">
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
      >
        <X className="h-2.5 w-2.5" />
      </button>
      {onDuplicate && (
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(item); }}
          className="absolute -top-1.5 right-4 w-4 h-4 rounded-full bg-blue-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
          title="Duplicate"
        >
          <Copy className="h-2.5 w-2.5" />
        </button>
      )}
      <div className="flex items-start gap-1.5">
        <GraduationCap className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs text-gray-800 line-clamp-2">{course.name_course}</div>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-600 flex-wrap">
            {course.code && <span className="font-mono">{course.code}</span>}
            {course.ects && <span className="bg-blue-200/60 px-1 py-0.5 rounded font-medium">{course.ects} ECTS</span>}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Lab Card Component - smaller
const LabCard = ({ item, lab, onRemove, onDuplicate }: any) => (
  <div className="group relative h-full">
    <div className="p-2 rounded-lg bg-purple-50/90 border border-purple-200 shadow-sm hover:shadow-md transition-shadow h-full">
      <button
        onClick={() => onRemove(item.id)}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
      >
        <X className="h-2.5 w-2.5" />
      </button>
      {onDuplicate && (
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(item); }}
          className="absolute -top-1.5 right-4 w-4 h-4 rounded-full bg-purple-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
          title="Duplicate"
        >
          <Copy className="h-2.5 w-2.5" />
        </button>
      )}
      <div className="flex items-start gap-1.5">
        <Beaker className="h-3.5 w-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs text-gray-800 line-clamp-2">{lab.name}</div>
          {lab.topics && (
            <div className="text-[10px] text-gray-600 mt-1 line-clamp-1">{lab.topics}</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Note Card Component with color picker - smaller
const NoteCard = ({ item, onRemove, onUpdate, onDuplicate }: any) => {
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
      <div className={cn("p-2 rounded-lg border shadow-sm h-full flex flex-col", currentColor.bg, currentColor.border)}>
        <button
          onClick={() => onRemove(item.id)}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
        >
          <X className="h-2.5 w-2.5" />
        </button>
        
        {/* Duplicate button */}
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(item); }}
            className="absolute -top-1.5 right-4 w-4 h-4 rounded-full bg-gray-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
            title="Duplicate"
          >
            <Copy className="h-2.5 w-2.5" />
          </button>
        )}
        
        {/* Color picker */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="absolute -top-1.5 left-2 w-4 h-4 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 border">
              <Palette className="h-2.5 w-2.5 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="grid grid-cols-4 gap-1">
              {Object.entries(allColors).map(([colorId, colorData]) => (
                <button
                  key={colorId}
                  onClick={() => onUpdate(item.id, { color: colorId })}
                  className={cn(
                    "w-5 h-5 rounded border-2 transition-all",
                    colorData.bg,
                    item.color === colorId ? 'ring-2 ring-gray-400 scale-110' : 'hover:scale-105'
                  )}
                  title={colorData.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <GripVertical className="h-2.5 w-2.5 text-gray-400 mb-1 opacity-50" />
        <Textarea
          value={item.content || ''}
          onChange={(e) => onUpdate(item.id, { content: e.target.value })}
          placeholder="Write your note..."
          className="bg-transparent border-none resize-none p-0 text-xs text-gray-700 focus-visible:ring-0 flex-1 min-h-[30px]"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

// Text Card Component - simple text directly on page with fast typing support
const TextCard = ({ item, onRemove, onUpdate, onDuplicate }: any) => {
  const [localContent, setLocalContent] = useState(item.content || '');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save for fast typing
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce the save
    timeoutRef.current = setTimeout(() => {
      onUpdate(item.id, { content: newContent });
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sync with prop changes (when item updates from server)
  useEffect(() => {
    setLocalContent(item.content || '');
  }, [item.content]);

  return (
    <div className="group relative h-full">
      <div className="p-2 rounded-lg bg-transparent h-full flex flex-col">
        <button
          onClick={() => onRemove(item.id)}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
        >
          <X className="h-2.5 w-2.5" />
        </button>
        
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(item); }}
            className="absolute -top-1.5 right-4 w-4 h-4 rounded-full bg-gray-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
            title="Duplicate"
          >
            <Copy className="h-2.5 w-2.5" />
          </button>
        )}

        <div className="flex items-center gap-1 opacity-50 mb-1 group-hover:opacity-70">
          <Type className="h-3 w-3 text-gray-600" />
          <GripVertical className="h-2.5 w-2.5 text-gray-400" />
        </div>
        <textarea
          value={localContent}
          onChange={handleChange}
          placeholder="Type here..."
          className="bg-transparent border-none resize-none p-0 text-sm text-gray-800 focus:outline-none flex-1 min-h-[30px] font-serif leading-relaxed"
          onClick={(e) => e.stopPropagation()}
          style={{ caretColor: '#374151' }}
        />
      </div>
    </div>
  );
};

// Module Wrapper Component - more compact
const ModuleWrapper = ({ item, onRemove, onUpdate, title, icon, children }: any) => (
  <div className="group relative h-full">
    <div className="rounded-lg border border-gray-300 bg-white/95 shadow-md overflow-hidden h-full flex flex-col">
      <button
        onClick={() => onRemove(item.id)}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
      >
        <X className="h-2.5 w-2.5" />
      </button>
      <div className="px-2 py-1.5 bg-gray-100/80 border-b border-gray-200 flex items-center gap-1.5">
        <GripVertical className="h-2.5 w-2.5 text-gray-400" />
        {icon}
        <span className="text-xs font-medium text-gray-700">{title}</span>
      </div>
      <div className="p-2 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  </div>
);