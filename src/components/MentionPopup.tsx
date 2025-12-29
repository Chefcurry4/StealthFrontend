import { useState, useEffect, useRef } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { GraduationCap, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";

interface MentionItem {
  id: string;
  type: 'course' | 'lab';
  name: string;
  code?: string;
  description?: string;
}

interface MentionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MentionItem) => void;
  courses: MentionItem[];
  labs: MentionItem[];
  searchQuery: string;
  position?: { top: number; left: number };
}

export const MentionPopup = ({
  isOpen,
  onClose,
  onSelect,
  courses,
  labs,
  searchQuery,
  position,
}: MentionPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);

  // Filter items based on search query
  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLabs = labs.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = filteredCourses.length > 0 || filteredLabs.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className={cn(
        "absolute z-50 w-80 max-h-64 overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
      )}
      style={position ? { bottom: position.top, left: position.left } : { bottom: '100%', left: 0, marginBottom: '8px' }}
    >
      <Command className="bg-transparent">
        <CommandList className="max-h-60">
          {!hasResults && (
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No saved courses or labs found
            </CommandEmpty>
          )}
          
          {filteredCourses.length > 0 && (
            <CommandGroup heading="Saved Courses" className="px-2">
              {filteredCourses.slice(0, 5).map((course) => (
                <CommandItem
                  key={course.id}
                  value={course.name}
                  onSelect={() => onSelect(course)}
                  className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-lg hover:bg-accent"
                >
                  <GraduationCap className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {course.code && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {course.code}
                        </span>
                      )}
                      <span className="text-sm truncate">{course.name}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredLabs.length > 0 && (
            <CommandGroup heading="Saved Labs" className="px-2">
              {filteredLabs.slice(0, 5).map((lab) => (
                <CommandItem
                  key={lab.id}
                  value={lab.name}
                  onSelect={() => onSelect(lab)}
                  className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-lg hover:bg-accent"
                >
                  <Beaker className="h-4 w-4 text-purple-500 shrink-0" />
                  <span className="text-sm truncate">{lab.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        
        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> to navigate, <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> to select, <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> to close
        </div>
      </Command>
    </div>
  );
};
