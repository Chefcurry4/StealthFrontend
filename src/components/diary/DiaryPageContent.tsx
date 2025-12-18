import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { DiaryPage } from "@/types/diary";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { useDiaryPageItems, useCreateDiaryPageItem, useUpdateDiaryPageItem, useDeleteDiaryPageItem } from "@/hooks/useDiaryPageItems";
import { DiarySemesterPlanner } from "./DiarySemesterPlanner";
import { DiaryLabTracker } from "./DiaryLabTracker";
import { DiaryNotesPage } from "./DiaryNotesPage";
import { DraggableCourse } from "./DraggableCourse";
import { DraggableLab } from "./DraggableLab";
import { toast } from "sonner";

interface DiaryPageContentProps {
  page: DiaryPage;
  notebookId: string;
}

export const DiaryPageContent = ({ page, notebookId }: DiaryPageContentProps) => {
  const { modeConfig } = useBackgroundTheme();
  const { data: items, isLoading } = useDiaryPageItems(page.id);
  const createItem = useCreateDiaryPageItem();
  const updateItem = useUpdateDiaryPageItem();
  const deleteItem = useDeleteDiaryPageItem();
  const [activeData, setActiveData] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveData(null);
    const { active, over } = event;

    if (!over) return;

    const activeData = active.data.current;
    const overId = over.id as string;

    // Handle dropping on a zone
    if (overId.startsWith('zone-') || overId.startsWith('grid-')) {
      const zone = overId.replace('zone-', '').replace('grid-', '');
      
      if (activeData?.type === 'course') {
        createItem.mutate({
          pageId: page.id,
          itemType: 'course',
          referenceId: activeData.course.id_course,
          zone,
        }, {
          onSuccess: () => toast.success("Course added!"),
        });
      } else if (activeData?.type === 'lab') {
        createItem.mutate({
          pageId: page.id,
          itemType: 'lab',
          referenceId: activeData.lab.id_lab,
          zone,
        }, {
          onSuccess: () => toast.success("Lab added!"),
        });
      }
    }
  };

  const handleRemoveItem = (itemId: string) => {
    deleteItem.mutate({ id: itemId, pageId: page.id }, {
      onSuccess: () => toast.success("Item removed"),
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full">
        {page.page_type === 'semester_planner' && (
          <DiarySemesterPlanner
            page={page}
            items={items || []}
            onRemoveItem={handleRemoveItem}
            isLoading={isLoading}
          />
        )}

        {page.page_type === 'lab_tracker' && (
          <DiaryLabTracker
            page={page}
            items={items || []}
            onRemoveItem={handleRemoveItem}
            isLoading={isLoading}
          />
        )}

        {page.page_type === 'notes' && (
          <DiaryNotesPage
            page={page}
            items={items || []}
            onRemoveItem={handleRemoveItem}
            isLoading={isLoading}
          />
        )}
      </div>

      <DragOverlay>
        {activeData?.type === 'course' && (
          <DraggableCourse course={activeData.course} />
        )}
        {activeData?.type === 'lab' && (
          <DraggableLab lab={activeData.lab} />
        )}
      </DragOverlay>
    </DndContext>
  );
};
