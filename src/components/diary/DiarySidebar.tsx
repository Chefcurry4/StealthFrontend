import { useState } from "react";
import { 
  Book, ChevronLeft, ChevronRight, GraduationCap, Beaker, 
  Search, Plus, StickyNote, Mail 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { useSavedCourses, useSavedLabs } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";
import { DraggableCourse } from "./DraggableCourse";
import { DraggableLab } from "./DraggableLab";

interface DiarySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddCourse?: (courseId: string) => void;
}

export const DiarySidebar = ({ isOpen, onToggle, onAddCourse }: DiarySidebarProps) => {
  const { modeConfig } = useBackgroundTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'courses' | 'labs' | 'notes'>('courses');

  const { data: savedCoursesData, isLoading: coursesLoading } = useSavedCourses();
  const { data: savedLabsData, isLoading: labsLoading } = useSavedLabs();
  
  const isLoading = coursesLoading || labsLoading;
  
  // Transform the data to match expected format
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
            onClick={() => setActiveTab('courses')}
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1",
              activeTab === 'courses' ? "border-b-2" : "opacity-60 hover:opacity-100"
            )}
            style={{ 
              borderColor: activeTab === 'courses' ? modeConfig.ui.buttonPrimary : 'transparent' 
            }}
          >
            <GraduationCap className="h-4 w-4" />
            Courses
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1",
              activeTab === 'labs' ? "border-b-2" : "opacity-60 hover:opacity-100"
            )}
            style={{ 
              borderColor: activeTab === 'labs' ? modeConfig.ui.buttonPrimary : 'transparent' 
            }}
          >
            <Beaker className="h-4 w-4" />
            Labs
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1",
              activeTab === 'notes' ? "border-b-2" : "opacity-60 hover:opacity-100"
            )}
            style={{ 
              borderColor: activeTab === 'notes' ? modeConfig.ui.buttonPrimary : 'transparent' 
            }}
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {activeTab === 'courses' && (
              <>
                {isLoading ? (
                  <div className="text-center py-8 opacity-50">Loading...</div>
                ) : filteredCourses && filteredCourses.length > 0 ? (
                  filteredCourses.map((item) => (
                    item.course && (
                      <DraggableCourse
                        key={item.id}
                        course={item.course}
                      />
                    )
                  ))
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
                  filteredLabs.map((item) => (
                    item.lab && (
                      <DraggableLab
                        key={item.id}
                        lab={item.lab}
                      />
                    )
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Beaker className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm opacity-50">No saved labs</p>
                    <p className="text-xs opacity-40">Save labs to add them here</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  style={{ 
                    borderColor: modeConfig.ui.cardBorder,
                    background: modeConfig.ui.buttonSecondary,
                    color: modeConfig.ui.buttonSecondaryText
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sticky Note
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  style={{ 
                    borderColor: modeConfig.ui.cardBorder,
                    background: modeConfig.ui.buttonSecondary,
                    color: modeConfig.ui.buttonSecondaryText
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Add Email Draft
                </Button>
                <p className="text-xs text-center opacity-50 py-4">
                  Drag notes to the page to place them
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div 
          className="p-3 border-t text-xs text-center opacity-50"
          style={{ borderColor: modeConfig.ui.cardBorder }}
        >
          Drag items to the page
        </div>
      </div>
    </>
  );
};
