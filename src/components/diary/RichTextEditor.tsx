import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2,
  Link,
  CheckSquare,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  autoFocus?: boolean;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  minHeight = 80,
  autoFocus = false,
}: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const insertMarkdown = useCallback((prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = 
      value.substring(0, start) + 
      prefix + 
      (selectedText || "text") + 
      suffix + 
      value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after the operation
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + (selectedText?.length || 4);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    
    // Find the start of the current line
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    
    const newText = 
      value.substring(0, lineStart) + 
      prefix + 
      value.substring(lineStart);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Bold: Ctrl+B
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**');
    }
    // Italic: Ctrl+I
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*');
    }
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: "Bold (Ctrl+B)" },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: "Italic (Ctrl+I)" },
    { icon: Heading2, action: () => insertAtLineStart('## '), title: "Heading" },
    { icon: List, action: () => insertAtLineStart('- '), title: "Bullet list" },
    { icon: ListOrdered, action: () => insertAtLineStart('1. '), title: "Numbered list" },
    { icon: CheckSquare, action: () => insertAtLineStart('- [ ] '), title: "Checkbox" },
    { icon: Minus, action: () => insertAtLineStart('---\n'), title: "Divider" },
    { icon: Link, action: () => insertMarkdown('[', '](url)'), title: "Link" },
  ];

  return (
    <div 
      className={cn("relative group", className)}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      {/* Floating toolbar */}
      <div 
        className={cn(
          "absolute -top-9 left-0 flex items-center gap-0.5 p-1 rounded-lg bg-popover border shadow-md z-10 transition-opacity",
          showToolbar ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {toolbarButtons.map((btn, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              btn.action();
            }}
            title={btn.title}
          >
            <btn.icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="resize-none font-mono text-sm"
        style={{ minHeight }}
      />

      {/* Help text */}
      <p className="text-[10px] text-muted-foreground mt-1 opacity-60">
        Supports Markdown: **bold**, *italic*, - bullet, [ ] checkbox
      </p>
    </div>
  );
};

export default RichTextEditor;