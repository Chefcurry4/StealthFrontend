import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Plus, ChevronLeft, ChevronRight, FileText, Beaker, StickyNote, Mail, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { useDiaryNotebooks, useCreateDiaryNotebook } from "@/hooks/useDiaryNotebooks";
import { useDiaryPages, useCreateDiaryPage } from "@/hooks/useDiaryPages";
import { DiaryNotebook } from "@/components/diary/DiaryNotebook";
import { DiarySidebar } from "@/components/diary/DiarySidebar";
import { DiaryPageContent } from "@/components/diary/DiaryPageContent";
import { SEO } from "@/components/SEO";
import { Loader } from "@/components/Loader";
import { toast } from "sonner";

const Diary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modeConfig } = useBackgroundTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  const { data: notebooks, isLoading: notebooksLoading } = useDiaryNotebooks();
  const createNotebook = useCreateDiaryNotebook();
  const { data: pages, isLoading: pagesLoading } = useDiaryPages(selectedNotebookId || "");
  const createPage = useCreateDiaryPage();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Auto-select first notebook or create one
  useEffect(() => {
    if (notebooks && notebooks.length > 0 && !selectedNotebookId) {
      setSelectedNotebookId(notebooks[0].id);
    } else if (notebooks && notebooks.length === 0 && !notebooksLoading) {
      // Create initial notebook
      createNotebook.mutate("My Semester Planner", {
        onSuccess: (notebook) => {
          setSelectedNotebookId(notebook.id);
          // Create first page
          createPage.mutate({
            notebookId: notebook.id,
            pageNumber: 1,
            pageType: "semester_planner",
            title: "Fall 2024",
            semester: "Fall 2024",
          });
        },
      });
    }
  }, [notebooks, notebooksLoading, selectedNotebookId]);

  const handleAddPage = (type: 'semester_planner' | 'lab_tracker' | 'notes') => {
    if (!selectedNotebookId || !pages) return;
    
    const nextPageNumber = pages.length + 1;
    const titles: Record<string, string> = {
      semester_planner: `Semester ${nextPageNumber}`,
      lab_tracker: "Lab Tracker",
      notes: "Notes",
    };

    createPage.mutate({
      notebookId: selectedNotebookId,
      pageNumber: nextPageNumber,
      pageType: type,
      title: titles[type],
    }, {
      onSuccess: () => {
        setCurrentPageIndex(nextPageNumber - 1);
        toast.success("Page added!");
      },
    });
  };

  const currentPage = pages?.[currentPageIndex];

  if (!user) {
    return <Loader fullScreen />;
  }

  if (notebooksLoading) {
    return <Loader fullScreen />;
  }

  return (
    <>
      <SEO
        title="Diary - Students Hub"
        description="Plan your semester with an interactive notebook. Drag and drop courses, track lab communications, and visualize your academic journey."
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <DiarySidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onAddCourse={(courseId) => {
            // Will be handled by drag and drop
            toast.info("Drag courses to the planner to add them!");
          }}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ 
              borderColor: modeConfig.ui.cardBorder,
              background: modeConfig.ui.cardBackground 
            }}
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                <Book className="h-4 w-4" />
              </Button>
              
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Book className="h-5 w-5" />
                {notebooks?.find(n => n.id === selectedNotebookId)?.name || "Diary"}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddPage('semester_planner')}
                style={{ 
                  borderColor: modeConfig.ui.cardBorder,
                  background: modeConfig.ui.buttonSecondary,
                  color: modeConfig.ui.buttonSecondaryText
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Semester
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddPage('lab_tracker')}
                style={{ 
                  borderColor: modeConfig.ui.cardBorder,
                  background: modeConfig.ui.buttonSecondary,
                  color: modeConfig.ui.buttonSecondaryText
                }}
              >
                <Beaker className="h-4 w-4 mr-1" />
                Lab Tracker
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddPage('notes')}
                style={{ 
                  borderColor: modeConfig.ui.cardBorder,
                  background: modeConfig.ui.buttonSecondary,
                  color: modeConfig.ui.buttonSecondaryText
                }}
              >
                <StickyNote className="h-4 w-4 mr-1" />
                Notes
              </Button>
            </div>
          </div>

          {/* Notebook Area */}
          <div className="flex-1 overflow-hidden">
            {pagesLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader />
              </div>
            ) : pages && pages.length > 0 ? (
              <DiaryNotebook
                pages={pages}
                currentPageIndex={currentPageIndex}
                onPageChange={setCurrentPageIndex}
                notebookId={selectedNotebookId || ""}
              >
                {currentPage && (
                  <DiaryPageContent
                    page={currentPage}
                    notebookId={selectedNotebookId || ""}
                  />
                )}
              </DiaryNotebook>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Book className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg opacity-70">Your diary is empty</p>
                  <p className="text-sm opacity-50 mb-4">Add a page to get started</p>
                  <Button
                    onClick={() => handleAddPage('semester_planner')}
                    style={{ 
                      background: modeConfig.ui.buttonPrimary,
                      color: modeConfig.ui.buttonPrimaryText
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Semester Planner
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Page Navigation */}
          {pages && pages.length > 0 && (
            <div 
              className="flex items-center justify-center gap-4 p-4 border-t"
              style={{ 
                borderColor: modeConfig.ui.cardBorder,
                background: modeConfig.ui.cardBackground 
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                style={{ color: modeConfig.textColor }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <span className="text-sm font-medium">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === pages.length - 1}
                style={{ color: modeConfig.textColor }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Diary;
