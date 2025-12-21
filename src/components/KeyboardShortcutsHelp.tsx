import { useState, useEffect } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Diary shortcuts
  { keys: ["Ctrl", "Z"], description: "Undo last action", category: "Diary" },
  { keys: ["Ctrl", "Shift", "Z"], description: "Redo action", category: "Diary" },
  { keys: ["Ctrl", "C"], description: "Copy selected item", category: "Diary" },
  { keys: ["Ctrl", "V"], description: "Paste copied item", category: "Diary" },
  { keys: ["Delete"], description: "Delete selected item", category: "Diary" },
  { keys: ["G"], description: "Toggle grid overlay", category: "Diary" },
  { keys: ["←", "→"], description: "Navigate pages", category: "Diary" },
  
  // Workbench shortcuts
  { keys: ["Ctrl", "N"], description: "New conversation", category: "Workbench" },
  { keys: ["Ctrl", "Enter"], description: "Send message", category: "Workbench" },
  { keys: ["Escape"], description: "Close sidebar", category: "Workbench" },
  
  // General shortcuts
  { keys: ["?"], description: "Show keyboard shortcuts", category: "General" },
  { keys: ["Escape"], description: "Close dialogs/modals", category: "General" },
];

const KeyboardKey = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-medium bg-muted border border-border rounded shadow-sm">
    {children}
  </kbd>
);

interface KeyboardShortcutsHelpProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const KeyboardShortcutsHelp = ({ open, onOpenChange }: KeyboardShortcutsHelpProps) => {
  const categories = [...new Set(shortcuts.map(s => s.category))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{category}</h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <KeyboardKey>{key}</KeyboardKey>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          Press <KeyboardKey>?</KeyboardKey> anywhere to show this help
        </p>
      </DialogContent>
    </Dialog>
  );
};

// Hook to handle global keyboard shortcuts
export const useKeyboardShortcuts = () => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show help on ? key
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setShowHelp(true);
        }
      }
      
      // Close help on Escape
      if (e.key === "Escape" && showHelp) {
        setShowHelp(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showHelp]);

  return { showHelp, setShowHelp };
};
