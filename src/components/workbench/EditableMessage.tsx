import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableMessageProps {
  content: string;
  isEditing: boolean;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  className?: string;
}

export const EditableMessage = ({
  content,
  isEditing,
  onSave,
  onCancel,
  className,
}: EditableMessageProps) => {
  const [editedContent, setEditedContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedContent, isEditing]);

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== content) {
      onSave(editedContent);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isEditing) {
    return <p className={cn("whitespace-pre-wrap text-left leading-relaxed", className)}>{content}</p>;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Textarea
        ref={textareaRef}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[60px] resize-none bg-primary-foreground/5 dark:bg-primary/5 border-primary/30 focus:border-primary/50"
        rows={3}
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!editedContent.trim() || editedContent === content}
          className="h-7 px-3"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="h-7 px-3"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Cancel
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">
          Ctrl+Enter to save • Esc to cancel
        </span>
      </div>
    </div>
  );
};
