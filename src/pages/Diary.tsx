import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Plus, ChevronLeft, ChevronRight, Trash2, Download, Copy } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { useDiaryNotebooks, useCreateDiaryNotebook } from "@/hooks/useDiaryNotebooks";
import { useDiaryPages, useCreateDiaryPage, useDeleteDiaryPage } from "@/hooks/useDiaryPages";
import { useDiaryPageItems, useCreateDiaryPageItem, useUpdateDiaryPageItem, useDeleteDiaryPageItem } from "@/hooks/useDiaryPageItems";
import { DiaryNotebook } from "@/components/diary/DiaryNotebook";
import { DiarySidebar } from "@/components/diary/DiarySidebar";
import { SEO } from "@/components/SEO";
import { Loader } from "@/components/Loader";
import { toast } from "sonner";
import { DiaryPageItem } from "@/types/diary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Diary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modeConfig } = useBackgroundTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeData, setActiveData] = useState<any>(null);

  const { data: notebooks, isLoading: notebooksLoading } = useDiaryNotebooks();
  const createNotebook = useCreateDiaryNotebook();
  const { data: pages, isLoading: pagesLoading } = useDiaryPages(selectedNotebookId || "");
  const createPage = useCreateDiaryPage();
  const deletePage = useDeleteDiaryPage();
  
  const currentPage = pages?.[currentPageIndex];
  const { data: pageItems } = useDiaryPageItems(currentPage?.id || "");
  const createItem = useCreateDiaryPageItem();
  const updateItem = useUpdateDiaryPageItem();
  const deleteItem = useDeleteDiaryPageItem();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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
      createNotebook.mutate("My Semester Planner", {
        onSuccess: (notebook) => {
          setSelectedNotebookId(notebook.id);
          createPage.mutate({
            notebookId: notebook.id,
            pageNumber: 1,
            pageType: "blank",
            title: "Page 1",
          });
        },
      });
    }
  }, [notebooks, notebooksLoading, selectedNotebookId]);

  const handleAddPage = () => {
    if (!selectedNotebookId || !pages) return;
    
    const nextPageNumber = pages.length + 1;

    createPage.mutate({
      notebookId: selectedNotebookId,
      pageNumber: nextPageNumber,
      pageType: "blank",
      title: `Page ${nextPageNumber}`,
    }, {
      onSuccess: () => {
        setCurrentPageIndex(nextPageNumber - 1);
        toast.success("New page added!");
      },
    });
  };

  const handleDeleteCurrentPage = () => {
    if (!currentPage || !selectedNotebookId || !pages) return;
    
    deletePage.mutate({ id: currentPage.id, notebookId: selectedNotebookId }, {
      onSuccess: () => {
        toast.success("Page deleted!");
        setDeleteDialogOpen(false);
        if (currentPageIndex > 0) {
          setCurrentPageIndex(currentPageIndex - 1);
        }
      },
    });
  };

  const handleDuplicatePage = () => {
    if (!currentPage || !selectedNotebookId || !pages || !pageItems) return;
    
    const nextPageNumber = pages.length + 1;
    
    createPage.mutate({
      notebookId: selectedNotebookId,
      pageNumber: nextPageNumber,
      pageType: currentPage.page_type as any,
      title: `${currentPage.title} (Copy)`,
      semester: currentPage.semester || undefined,
    }, {
      onSuccess: (newPage) => {
        // Duplicate all items from current page to new page
        pageItems.forEach((item) => {
          createItem.mutate({
            pageId: newPage.id,
            itemType: item.item_type as any,
            referenceId: item.reference_id || undefined,
            content: item.content || undefined,
            positionX: item.position_x + 20,
            positionY: item.position_y + 20,
            width: item.width || 200,
            height: item.height || 100,
            color: item.color || undefined,
            zone: item.zone || undefined,
          });
        });
        setCurrentPageIndex(nextPageNumber - 1);
        toast.success("Page duplicated!");
      },
    });
  };

  const handleDuplicateItem = (item: DiaryPageItem) => {
    if (!currentPage) return;
    
    createItem.mutate({
      pageId: currentPage.id,
      itemType: item.item_type as any,
      referenceId: item.reference_id || undefined,
      content: item.content || undefined,
      positionX: item.position_x + 30,
      positionY: item.position_y + 30,
      width: item.width || 200,
      height: item.height || 100,
      color: item.color || undefined,
      zone: item.zone || undefined,
    }, {
      onSuccess: () => toast.success("Item duplicated!"),
    });
  };

  const handleExportPdf = async () => {
    const element = document.getElementById('diary-page-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${currentPage?.title || 'diary-page'}.pdf`);
      toast.success("PDF exported!");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveData(null);

    if (!over || !currentPage) return;

    const activeDataCurrent = active.data.current;
    const overId = over.id as string;

    // Handle dropping on page canvas
    if (overId === 'diary-page-canvas') {
      const dropPosition = over.rect;
      const activeRect = active.rect.current.translated;
      
      // Calculate position relative to the drop zone
      const posX = activeRect ? Math.max(0, activeRect.left - dropPosition.left) : 100;
      const posY = activeRect ? Math.max(0, activeRect.top - dropPosition.top) : 100;

      if (activeDataCurrent?.type === 'course') {
        createItem.mutate({
          pageId: currentPage.id,
          itemType: 'course',
          referenceId: activeDataCurrent.course.id_course,
          positionX: Math.round(posX),
          positionY: Math.round(posY),
          width: 200,
          height: 80,
        }, {
          onSuccess: () => toast.success("Course added to page!"),
        });
      } else if (activeDataCurrent?.type === 'lab') {
        createItem.mutate({
          pageId: currentPage.id,
          itemType: 'lab',
          referenceId: activeDataCurrent.lab.id_lab,
          positionX: Math.round(posX),
          positionY: Math.round(posY),
          width: 200,
          height: 80,
        }, {
          onSuccess: () => toast.success("Lab added to page!"),
        });
      } else if (activeDataCurrent?.type === 'module') {
        createItem.mutate({
          pageId: currentPage.id,
          itemType: activeDataCurrent.moduleType,
          positionX: Math.round(posX),
          positionY: Math.round(posY),
          width: activeDataCurrent.moduleType === 'semester_planner' ? 600 : 300,
          height: activeDataCurrent.moduleType === 'semester_planner' ? 400 : 250,
        }, {
          onSuccess: () => toast.success(`${activeDataCurrent.label} added!`),
        });
      } else if (activeDataCurrent?.type === 'note') {
        createItem.mutate({
          pageId: currentPage.id,
          itemType: 'note',
          content: '',
          positionX: Math.round(posX),
          positionY: Math.round(posY),
          width: 200,
          height: 150,
          color: activeDataCurrent.color || 'yellow',
        }, {
          onSuccess: () => toast.success("Note added!"),
        });
      }
    }

    // Handle dropping on semester zones
    if (overId.startsWith('semester-zone-')) {
      const zone = overId.replace('semester-zone-', '');
      
      if (activeDataCurrent?.type === 'course') {
        createItem.mutate({
          pageId: currentPage.id,
          itemType: 'course',
          referenceId: activeDataCurrent.course.id_course,
          zone,
          positionX: 0,
          positionY: 0,
        }, {
          onSuccess: () => toast.success("Course added to semester!"),
        });
      }
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (!currentPage) return;
    deleteItem.mutate({ id: itemId, pageId: currentPage.id }, {
      onSuccess: () => toast.success("Item removed"),
    });
  };

  const handleUpdateItem = (itemId: string, updates: any) => {
    if (!currentPage) return;
    updateItem.mutate({ id: itemId, pageId: currentPage.id, ...updates });
  };

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
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <DiarySidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
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
                  onClick={handleAddPage}
                  style={{ 
                    borderColor: modeConfig.ui.cardBorder,
                    background: modeConfig.ui.buttonSecondary,
                    color: modeConfig.ui.buttonSecondaryText
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Page
                </Button>
                {pages && pages.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDuplicatePage}
                      style={{ 
                        borderColor: modeConfig.ui.cardBorder,
                        background: modeConfig.ui.buttonSecondary,
                        color: modeConfig.ui.buttonSecondaryText
                      }}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive hover:text-destructive"
                      style={{ 
                        borderColor: modeConfig.ui.cardBorder,
                        background: modeConfig.ui.buttonSecondary,
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Page
                    </Button>
                  </>
                )}
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
                  pageItems={pageItems || []}
                  onRemoveItem={handleRemoveItem}
                  onUpdateItem={handleUpdateItem}
                  onDuplicateItem={handleDuplicateItem}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Book className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg opacity-70">Your diary is empty</p>
                    <p className="text-sm opacity-50 mb-4">Add a page to get started</p>
                    <Button
                      onClick={handleAddPage}
                      style={{ 
                        background: modeConfig.ui.buttonPrimary,
                        color: modeConfig.ui.buttonPrimaryText
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Page
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

        {/* Drag Overlay */}
        <DragOverlay>
          {activeData && (
            <div 
              className="p-3 rounded-lg shadow-xl opacity-90"
              style={{ 
                background: modeConfig.ui.cardBackground,
                border: `2px solid ${modeConfig.ui.buttonPrimary}`
              }}
            >
              {activeData.type === 'course' && (
                <div className="text-sm font-medium">{activeData.course.name_course}</div>
              )}
              {activeData.type === 'lab' && (
                <div className="text-sm font-medium">{activeData.lab.name}</div>
              )}
              {activeData.type === 'module' && (
                <div className="text-sm font-medium">{activeData.label}</div>
              )}
              {activeData.type === 'note' && (
                <div className="text-sm font-medium">Sticky Note</div>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{currentPage?.title}" and all its contents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCurrentPage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Diary;
