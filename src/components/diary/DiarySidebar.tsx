import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { 
  Book, ChevronLeft, ChevronRight, GraduationCap, Beaker, 
  Search, LayoutGrid, Calendar, Type, Clock, Target, StickyNote, ListTodo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { useSavedCourses, useSavedLabs } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";

interface DiarySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const DiarySidebar = ({ isOpen, onToggle }: DiarySidebarProps) => {
  const { modeConfig } = useBackgroundTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'modules' | 'courses' | 'labs'>('modules');

  const { data: savedCoursesData, isLoading: coursesLoading } = useSavedCourses();
  const { data: savedLabsData, isLoading: labsLoading } = useSavedLabs();
  
  const isLoading = coursesLoading || labsLoading;
  
  const savedCourses = savedCoursesData?.map(item => ({
    id: item.id,
    course: item.Courses as any
  }));
  
  const savedLabs = savedLabsData?.map(item => ({
    id: item.id,
    lab: item.Labs as any
  }));

  const filteredCourses = savedCourses?.filter(item => 
    item.course?.name_course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.course?.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLabs = savedLabs?.filter(item =>
    item.lab?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modules = [
    { id: 'text', label: 'Add Text', icon: Type, color: 'bg-amber-50 text-amber-700 border-amber-200', description: 'Free-form text block' },
    { id: 'semester_planner', label: 'Semester Planner', icon: Calendar, color: 'bg-blue-100 text-blue-700 border-blue-200', description: 'Plan courses by semester' },
    { id: 'lab_tracker', label: 'Lab Tracker', icon: Beaker, color: 'bg-purple-100 text-purple-700 border-purple-200', description: 'Track lab applications' },
    { id: 'weekly_schedule', label: 'Weekly Schedule', icon: Clock, color: 'bg-green-100 text-green-700 border-green-200', description: 'Organize your week' },
    { id: 'deadline_tracker', label: 'Deadline Tracker', icon: Target, color: 'bg-red-100 text-red-700 border-red-200', description: 'Track due dates' },
    { id: 'sticky_note', label: 'Sticky Note', icon: StickyNote, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', description: 'Quick notes & reminders' },
    { id: 'checklist', label: 'Checklist', icon: ListTodo, color: 'bg-cyan-100 text-cyan-700 border-cyan-200', description: 'To-do list' },
  ];

  return (
    <>
      {/* Toggle button when collapsed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-1/2 -translate-y-1/2 z-30 shadow-lg"
          onClick={onToggle}
          style={{ 
            background: modeConfig.ui.cardBackground,
            color: modeConfig.textColor 
          }}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "h-full border-r flex flex-col transition-all duration-300",
          isOpen ? "w-72" : "w-0 overflow-hidden"
        )}
        style={{ 
          borderColor: modeConfig.ui.cardBorder,
          background: modeConfig.ui.cardBackground 
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: modeConfig.ui.cardBorder }}>
          <h2 className="font-semibold flex items-center gap-2">
            <Book className="h-4 w-4" />
            Resources
          </h2>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 border-b" style={{ borderColor: modeConfig.ui.cardBorder }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              style={{ 
                background: modeConfig.ui.inputBackground,
                borderColor: modeConfig.ui.inputBorder 
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: modeConfig.ui.cardBorder }}>
          <button
            onClick={() => setActiveTab('modules')}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1",
              activeTab === 'modules' ? "border-b-2" : "opacity-60 hover:opacity-100"
            )}
            style={{ 
              borderColor: activeTab === 'modules' ? modeConfig.ui.buttonPrimary : 'transparent' 
            }}
          >
            <LayoutGrid className="h-3 w-3" />
            Modules
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1",
              activeTab === 'courses' ? "border-b-2" : "opacity-60 hover:opacity-100"
            )}
            style={{ 
              borderColor: activeTab === 'courses' ? modeConfig.ui.buttonPrimary : 'transparent' 
            }}
          >
            <GraduationCap className="h-3 w-3" />
            Courses
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1",
              activeTab === 'labs' ? "border-b-2" : "opacity-60 hover:opacity-100"
            )}
            style={{ 
              borderColor: activeTab === 'labs' ? modeConfig.ui.buttonPrimary : 'transparent' 
            }}
          >
            <Beaker className="h-3 w-3" />
            Labs
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {activeTab === 'modules' && (
              <>
                <p className="text-xs text-muted-foreground mb-3">Drag modules to the page</p>
                {modules.map((module) => (
                  <DraggableModule key={module.id} module={module} />
                ))}
              </>
            )}

            {activeTab === 'courses' && (
              <>
                {isLoading ? (
                  <div className="text-center py-8 opacity-50">Loading...</div>
                ) : filteredCourses && filteredCourses.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">Drag courses to the page or semester planner</p>
                    <div className="space-y-2">
                      {filteredCourses.map((item) => (
                        item.course && (
                          <DraggableCourseItem key={item.id} course={item.course} />
                        )
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm opacity-50">No saved courses</p>
                    <p className="text-xs opacity-40">Save courses to add them here</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'labs' && (
              <>
                {isLoading ? (
                  <div className="text-center py-8 opacity-50">Loading...</div>
                ) : filteredLabs && filteredLabs.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">Drag labs to the page</p>
                    <div className="space-y-2">
                      {filteredLabs.map((item) => (
                        item.lab && (
                          <DraggableLabItem key={item.id} lab={item.lab} />
                        )
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Beaker className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm opacity-50">No saved labs</p>
                    <p className="text-xs opacity-40">Save labs to add them here</p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

// Draggable Module Component with improved styling
const DraggableModule = ({ module }: { module: any }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `module-${module.id}`,
    data: { type: 'module', moduleType: module.id, label: module.label },
  });

  const Icon = module.icon;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:scale-[1.02]",
        module.color,
        isDragging && "opacity-50 scale-95 shadow-lg"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-md bg-white/50">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium block">{module.label}</span>
          {module.description && (
            <span className="text-[10px] opacity-70 block mt-0.5">{module.description}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Draggable Course Item - FIXED to show full content
const DraggableCourseItem = ({ course }: { course: any }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `course-${course.id_course}`,
    data: { type: 'course', course },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "p-3 rounded-lg bg-blue-50 border border-blue-200 cursor-grab active:cursor-grabbing transition-all w-full",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div className="flex items-start gap-2">
        <GraduationCap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-800 break-words leading-tight">{course.name_course}</div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 flex-wrap">
            {course.code && <span className="font-mono bg-gray-100 px-1 rounded">{course.code}</span>}
            {course.ects && <span className="bg-blue-100 px-1.5 py-0.5 rounded font-medium">{course.ects} ECTS</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Draggable Lab Item
const DraggableLabItem = ({ lab }: { lab: any }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lab-${lab.id_lab}`,
    data: { type: 'lab', lab },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "p-3 rounded-lg bg-purple-50 border border-purple-200 cursor-grab active:cursor-grabbing transition-all w-full",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div className="flex items-start gap-2">
        <Beaker className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-800 break-words leading-tight">{lab.name}</div>
          {lab.topics && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{lab.topics}</div>
          )}
        </div>
      </div>
    </div>
  );
};
