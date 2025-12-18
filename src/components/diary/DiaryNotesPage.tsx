import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { StickyNote, Plus, X, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { DiaryPage, DiaryPageItem } from "@/types/diary";
import { useCreateDiaryPageItem, useUpdateDiaryPageItem, useDeleteDiaryPageItem } from "@/hooks/useDiaryPageItems";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DiaryNotesPageProps {
  page: DiaryPage;
  items: DiaryPageItem[];
  onRemoveItem: (id: string) => void;
  isLoading: boolean;
}

const NOTE_COLORS = [
  { id: 'yellow', bg: '#fef3c7', text: '#92400e' },
  { id: 'pink', bg: '#fce7f3', text: '#9d174d' },
  { id: 'blue', bg: '#dbeafe', text: '#1e40af' },
  { id: 'green', bg: '#d1fae5', text: '#065f46' },
  { id: 'purple', bg: '#ede9fe', text: '#5b21b6' },
];

export const DiaryNotesPage = ({ page, items, onRemoveItem, isLoading }: DiaryNotesPageProps) => {
  const { modeConfig } = useBackgroundTheme();
  const createItem = useCreateDiaryPageItem();
  const updateItem = useUpdateDiaryPageItem();
  const deleteItem = useDeleteDiaryPageItem();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const noteItems = items.filter(item => item.item_type === 'note');
  const todoItems = items.filter(item => item.item_type === 'todo');

  const { isOver, setNodeRef } = useDroppable({
    id: 'zone-notes',
  });

  const handleAddNote = (color: string) => {
    createItem.mutate({
      pageId: page.id,
      itemType: 'note',
      content: '',
      color,
      positionX: Math.random() * 200,
      positionY: Math.random() * 100,
    }, {
      onSuccess: (data) => {
        setEditingNote(data.id);
        setEditContent('');
        toast.success("Note added!");
      },
    });
  };

  const handleAddTodo = () => {
    createItem.mutate({
      pageId: page.id,
      itemType: 'todo',
      content: 'New task',
    }, {
      onSuccess: () => toast.success("Todo added!"),
    });
  };

  const handleSaveNote = (itemId: string) => {
    updateItem.mutate({
      id: itemId,
      pageId: page.id,
      content: editContent,
    }, {
      onSuccess: () => {
        setEditingNote(null);
        setEditContent("");
      },
    });
  };

  const handleToggleTodo = (item: DiaryPageItem) => {
    updateItem.mutate({
      id: item.id,
      pageId: page.id,
      is_completed: !item.is_completed,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem.mutate({ id: itemId, pageId: page.id }, {
      onSuccess: () => toast.success("Item deleted"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Notes & Todos
        </h3>
        <div className="flex items-center gap-2">
          {NOTE_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleAddNote(color.id)}
              className="w-6 h-6 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"
              style={{ background: color.bg }}
              title={`Add ${color.id} note`}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTodo}
            style={{ 
              borderColor: modeConfig.ui.cardBorder,
              background: modeConfig.ui.buttonSecondary,
              color: modeConfig.ui.buttonSecondaryText
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Todo
          </Button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[400px] rounded-lg border-2 border-dashed p-4 transition-all relative",
          isOver && "border-solid"
        )}
        style={{ 
          borderColor: isOver ? modeConfig.ui.buttonPrimary : modeConfig.ui.cardBorder,
          background: isOver ? modeConfig.ui.buttonPrimary + '10' : 'transparent'
        }}
      >
        {/* Sticky Notes */}
        <div className="flex flex-wrap gap-4">
          {noteItems.map((item) => {
            const colorConfig = NOTE_COLORS.find(c => c.id === item.color) || NOTE_COLORS[0];
            const isEditing = editingNote === item.id;

            return (
              <div
                key={item.id}
                className="w-48 min-h-[120px] p-3 rounded-lg shadow-md relative group"
                style={{ background: colorConfig.bg, color: colorConfig.text }}
              >
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>

                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px] bg-transparent border-none resize-none focus:ring-0 p-0"
                      style={{ color: colorConfig.text }}
                      autoFocus
                    />
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingNote(null)}
                        className="h-6 px-2"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveNote(item.id)}
                        className="h-6 px-2"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer min-h-[80px]"
                    onClick={() => {
                      setEditingNote(item.id);
                      setEditContent(item.content || '');
                    }}
                  >
                    {item.content || <span className="opacity-50 text-sm">Click to add note...</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Todo List */}
        {todoItems.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium opacity-70">Todo List</h4>
            {todoItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-lg group"
                style={{ background: modeConfig.ui.inputBackground }}
              >
                <button
                  onClick={() => handleToggleTodo(item)}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                    item.is_completed && "bg-green-500 border-green-500"
                  )}
                  style={{ borderColor: item.is_completed ? undefined : modeConfig.ui.cardBorder }}
                >
                  {item.is_completed && <Check className="h-3 w-3 text-white" />}
                </button>
                <span className={cn("flex-1", item.is_completed && "line-through opacity-50")}>
                  {item.content}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        {noteItems.length === 0 && todoItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-50">
            <div className="text-center">
              <StickyNote className="h-12 w-12 mx-auto mb-4" />
              <p>Add sticky notes or todos using the buttons above</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
