import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Plus, Trash2, Download, Copy, Type, Maximize2, Minimize2, Undo2, Redo2 } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { useDiaryNotebooks, useCreateDiaryNotebook } from "@/hooks/useDiaryNotebooks";
import { useDiaryPages, useCreateDiaryPage, useDeleteDiaryPage, useUpdateDiaryPage, useReorderDiaryPages } from "@/hooks/useDiaryPages";
import { useDiaryPageItems, useCreateDiaryPageItem, useUpdateDiaryPageItem, useDeleteDiaryPageItem } from "@/hooks/useDiaryPageItems";
import { useDiaryUndoRedo, DiaryAction } from "@/hooks/useDiaryHistory";
import { DiaryNotebook } from "@/components/diary/DiaryNotebook";
import { DiarySidebar } from "@/components/diary/DiarySidebar";
import { KeyboardShortcutsHelp, useKeyboardShortcuts } from "@/components/KeyboardShortcutsHelp";
import { SEO } from "@/components/SEO";
import { DiaryFullSkeleton, DiaryPageSkeleton } from "@/components/skeletons/DiaryPageSkeleton";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import html2canvas from "html2canvas";

const Diary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modeConfig } = useBackgroundTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeData, setActiveData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const { showHelp, setShowHelp } = useKeyboardShortcuts();
  const { canUndo, canRedo, pushAction, getUndoAction, getRedoAction } = useDiaryUndoRedo();

  const { data: notebooks, isLoading: notebooksLoading } = useDiaryNotebooks();
  const createNotebook = useCreateDiaryNotebook();
  const { data: pages, isLoading: pagesLoading } = useDiaryPages(selectedNotebookId || "");
  const createPage = useCreateDiaryPage();
  const deletePage = useDeleteDiaryPage();
  const updatePage = useUpdateDiaryPage();
  const reorderPages = useReorderDiaryPages();
  
  const currentPage = pages?.[currentPageIndex];
  const { data: pageItems } = useDiaryPageItems(currentPage?.id || "");
  const createItem = useCreateDiaryPageItem();
  const updateItem = useUpdateDiaryPageItem();
  const deleteItem = useDeleteDiaryPageItem();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Keyboard shortcuts for diary
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key === "Z" || e.key === "y")) {
        e.preventDefault();
        handleRedo();
      }
      // Page navigation with arrow keys
      if (e.key === "ArrowLeft" && !e.target) {
        if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
      }
      if (e.key === "ArrowRight" && !e.target) {
        if (pages && currentPageIndex < pages.length - 1) setCurrentPageIndex(currentPageIndex + 1);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPageIndex, pages, canUndo, canRedo]);

  const handleUndo = useCallback(() => {
    const action = getUndoAction();
    if (!action || !currentPage) return;
    
    if (action.type === "REMOVE_ITEM") {
      // Re-create the item
      createItem.mutate({
        pageId: currentPage.id,
        itemType: action.item.item_type,
        referenceId: action.item.reference_id || undefined,
        content: action.item.content || undefined,
        positionX: action.item.position_x,
        positionY: action.item.position_y,
        width: action.item.width,
        height: action.item.height,
        color: action.item.color || undefined,
      });
      toast.success("Undo: Item restored");
    }
  }, [getUndoAction, currentPage, createItem]);

  const handleRedo = useCallback(() => {
    const action = getRedoAction();
    if (!action || !currentPage) return;
    
    if (action.type === "REMOVE_ITEM") {
      deleteItem.mutate({ id: action.itemId, pageId: currentPage.id });
      toast.success("Redo: Item removed");
    }
  }, [getRedoAction, currentPage, deleteItem]);

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
            width: item.width || 180,
            height: item.height || 80,
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
      positionX: item.position_x + 20,
      positionY: item.position_y + 20,
      width: item.width || 180,
      height: item.height || 80,
      color: item.color || undefined,
      zone: item.zone || undefined,
    }, {
      onSuccess: () => toast.success("Item duplicated!"),
    });
  };

  // Export as PNG
  const handleExportPng = async () => {
    const element = document.getElementById('diary-page-content');
    if (!element) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#fdf8e8',
        useCORS: true,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${currentPage?.title || 'diary-page'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("PNG exported!");
    } catch (error) {
      toast.error("Failed to export PNG");
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddQuickText = () => {
    if (!currentPage) return;
    
    const posX = 20 + (pageItems?.length || 0) * 20;
    const posY = 60 + (pageItems?.length || 0) * 20;
    
    createItem.mutate({
      pageId: currentPage.id,
      itemType: 'text' as any,
      content: '',
      positionX: Math.round(posX),
      positionY: Math.round(posY),
      width: 200,
      height: 100,
    }, {
      onSuccess: () => toast.success("Text added!"),
    });
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
      // Calculate a visible position - always start near the top-left visible area
      const posX = 20 + (pageItems?.length || 0) * 20;
      const posY = 50 + (pageItems?.length || 0) * 20;

      if (activeDataCurrent?.type === 'course') {
        createItem.mutate({
          pageId: currentPage.id,
          itemType: 'course',
          referenceId: activeDataCurrent.course.id_course,
          positionX: Math.round(posX),
          positionY: Math.round(posY),
          width: 180,
          height: 70,
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
          width: 180,
          height: 70,
        }, {
          onSuccess: () => toast.success("Lab added to page!"),
        });
      } else if (activeDataCurrent?.type === 'module') {
        // Handle text module separately
        if (activeDataCurrent.moduleType === 'text') {
          createItem.mutate({
            pageId: currentPage.id,
            itemType: 'text' as any,
            content: '',
            positionX: Math.round(posX),
            positionY: Math.round(posY),
            width: 200,
            height: 100,
          }, {
            onSuccess: () => toast.success("Text added!"),
          });
        } else {
          // Smaller default sizes for modules - fully visible on screen
          const moduleSize = {
            semester_planner: { width: 380, height: 320 },
            lab_tracker: { width: 280, height: 200 },
          }[activeDataCurrent.moduleType] || { width: 280, height: 200 };
          
          createItem.mutate({
            pageId: currentPage.id,
            itemType: activeDataCurrent.moduleType,
            positionX: Math.round(posX),
            positionY: Math.round(posY),
            width: moduleSize.width,
            height: moduleSize.height,
          }, {
            onSuccess: () => toast.success(`${activeDataCurrent.label} added!`),
          });
        }
      }
    }

    // Handle dropping on semester zones (both old format and new module-specific format)
    // New format: semester-{moduleId}-{winter|summer}
    // Old format: semester-zone-{winter|summer}
    if (overId.startsWith('semester-')) {
      let zone = overId;
      
      // Handle old format for backward compatibility
      if (overId.startsWith('semester-zone-')) {
        zone = overId.replace('semester-zone-', '');
      }
      
      if (activeDataCurrent?.type === 'course') {
        createItem.mutate({
          pageId: currentPage.id,
          itemType: 'course',
          referenceId: activeDataCurrent.course.id_course,
          zone, // Full zone including module prefix
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

  const handleUpdatePage = (pageId: string, updates: { title?: string; semester?: string }) => {
    if (!selectedNotebookId) return;
    updatePage.mutate({ id: pageId, notebookId: selectedNotebookId, ...updates });
  };

  const handleReorderPages = (activeId: string, overId: string) => {
    if (!pages || !selectedNotebookId) return;
    
    const oldIndex = pages.findIndex(p => p.id === activeId);
    const newIndex = pages.findIndex(p => p.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    // Create new order
    const reorderedPages = [...pages];
    const [movedPage] = reorderedPages.splice(oldIndex, 1);
    reorderedPages.splice(newIndex, 0, movedPage);
    
    // Update page numbers
    const updates = reorderedPages.map((page, index) => ({
      id: page.id,
      page_number: index + 1,
    }));
    
    reorderPages.mutate({ pages: updates, notebookId: selectedNotebookId }, {
      onSuccess: () => {
        // Update current index if needed
        if (currentPageIndex === oldIndex) {
          setCurrentPageIndex(newIndex);
        } else if (currentPageIndex > oldIndex && currentPageIndex <= newIndex) {
          setCurrentPageIndex(currentPageIndex - 1);
        } else if (currentPageIndex < oldIndex && currentPageIndex >= newIndex) {
          setCurrentPageIndex(currentPageIndex + 1);
        }
      },
    });
  };

  if (!user || notebooksLoading) {
    return <DiaryFullSkeleton />;
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
              className="flex items-center justify-between p-3 border-b"
              style={{ 
                borderColor: modeConfig.ui.cardBorder,
                background: modeConfig.ui.cardBackground 
              }}
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden"
                >
                  <Book className="h-4 w-4" />
                </Button>
                
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  {notebooks?.find(n => n.id === selectedNotebookId)?.name || "Diary"}
                </h1>

                {/* Quick add button when sidebar is closed */}
                {!sidebarOpen && (
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleUndo}
                            disabled={!canUndo}
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleRedo}
                            disabled={!canRedo}
                          >
                            <Redo2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 ml-1"
                            onClick={() => handleAddQuickText()}
                            disabled={!currentPage}
                          >
                            <Type className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                            Add Text
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add text to page</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPage}
                  className="h-8 text-xs"
                  style={{ 
                    borderColor: modeConfig.ui.cardBorder,
                    background: modeConfig.ui.buttonSecondary,
                    color: modeConfig.ui.buttonSecondaryText
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Page
                </Button>
                {pages && pages.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDuplicatePage}
                      className="h-8 text-xs"
                      style={{ 
                        borderColor: modeConfig.ui.cardBorder,
                        background: modeConfig.ui.buttonSecondary,
                        color: modeConfig.ui.buttonSecondaryText
                      }}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFullView(!isFullView)}
                      className="h-8 text-xs"
                      style={{ 
                        borderColor: modeConfig.ui.cardBorder,
                        background: modeConfig.ui.buttonSecondary,
                        color: modeConfig.ui.buttonSecondaryText
                      }}
                    >
                      {isFullView ? <Minimize2 className="h-3.5 w-3.5 mr-1" /> : <Maximize2 className="h-3.5 w-3.5 mr-1" />}
                      {isFullView ? 'Exit Full View' : 'Full View'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPng}
                      disabled={isExporting}
                      className="h-8 text-xs"
                      style={{ 
                        borderColor: modeConfig.ui.cardBorder,
                        background: modeConfig.ui.buttonSecondary,
                        color: modeConfig.ui.buttonSecondaryText
                      }}
                    >
                      {isExporting ? (
                        <>
                          <span className="animate-spin h-3.5 w-3.5 mr-1 border-2 border-current border-t-transparent rounded-full inline-block" />
                          <span className="ml-1">Exporting...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Export PNG
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive hover:text-destructive h-8 text-xs"
                      style={{ 
                        borderColor: modeConfig.ui.cardBorder,
                        background: modeConfig.ui.buttonSecondary,
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Notebook Area */}
            <div className="flex-1 overflow-hidden">
              {pagesLoading ? (
                <DiaryPageSkeleton />
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
                  onUpdatePage={handleUpdatePage}
                  onReorderPages={handleReorderPages}
                  isFullView={isFullView}
                  onToggleFullView={() => setIsFullView(!isFullView)}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Book className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base opacity-70">Your diary is empty</p>
                    <p className="text-sm opacity-50 mb-3">Add a page to get started</p>
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

            {/* Page Navigation - moved inside notebook */}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeData && (
            <div className="opacity-80 transform scale-105 rotate-2 shadow-xl pointer-events-none">
              {activeData.type === 'course' && (
                <div className="p-2 rounded-lg bg-blue-100 border-2 border-blue-300 shadow-lg">
                  <p className="text-xs font-medium">{activeData.course?.name_course}</p>
                </div>
              )}
              {activeData.type === 'lab' && (
                <div className="p-2 rounded-lg bg-purple-100 border-2 border-purple-300 shadow-lg">
                  <p className="text-xs font-medium">{activeData.lab?.name}</p>
                </div>
              )}
              {activeData.type === 'module' && (
                <div className="p-2 rounded-lg bg-amber-50 border-2 border-amber-300 shadow-lg">
                  <p className="text-xs font-medium">{activeData.label}</p>
                </div>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Delete Confirmation */}
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
            <AlertDialogAction
              onClick={handleDeleteCurrentPage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Diary;