import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, GraduationCap, BookOpen, FlaskConical, Users, Layers, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGlobalSearch, SearchResult } from "@/hooks/useGlobalSearch";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { TeacherPopup } from "@/components/TeacherPopup";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  variant?: "default" | "hero";
}

const typeIcons: Record<SearchResult["type"], React.ReactNode> = {
  university: <GraduationCap className="h-4 w-4" />,
  course: <BookOpen className="h-4 w-4" />,
  lab: <FlaskConical className="h-4 w-4" />,
  teacher: <Users className="h-4 w-4" />,
  program: <Layers className="h-4 w-4" />,
};

const typeLabels: Record<SearchResult["type"], string> = {
  university: "University",
  course: "Course",
  lab: "Lab",
  teacher: "Teacher",
  program: "Program",
};

export const GlobalSearch = ({ 
  className, 
  placeholder = "Search universities, courses, labs...",
  variant = "default"
}: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [teacherPopupOpen, setTeacherPopupOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const { results, isLoading } = useGlobalSearch(query);
  const { modeConfig } = useBackgroundTheme();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "teacher") {
      setSelectedTeacherId(result.id);
      setTeacherPopupOpen(true);
    } else {
      navigate(result.href);
    }
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<SearchResult["type"], SearchResult[]>);

  const typeOrder: SearchResult["type"][] = ["university", "course", "lab", "program", "teacher"];

  return (
    <>
      <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search 
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
            variant === "hero" ? "h-5 w-5 left-4" : ""
          )} 
          style={{ color: modeConfig.textColor, opacity: 0.5 }}
        />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 border-border/50 transition-all",
            variant === "hero" 
              ? "h-14 pl-12 pr-12 text-lg rounded-2xl shadow-lg" 
              : "h-9 text-sm rounded-lg"
          )}
          style={{
            background: modeConfig.ui.inputBackground,
            borderColor: modeConfig.ui.inputBorder,
            color: modeConfig.textColor,
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity",
              variant === "hero" ? "right-4" : ""
            )}
            style={{ color: modeConfig.textColor }}
          >
            <X className={cn("h-4 w-4", variant === "hero" ? "h-5 w-5" : "")} />
          </button>
        )}
        {isLoading && (
          <Loader2 
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin",
              variant === "hero" ? "right-4 h-5 w-5" : ""
            )} 
            style={{ color: modeConfig.textColor, opacity: 0.5 }}
          />
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.length >= 2 && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-xl overflow-hidden z-50",
            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
            variant === "hero" ? "max-h-[400px]" : "max-h-[320px]"
          )}
        >
          {results.length === 0 && !isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[inherit]">
              {typeOrder.map((type) => {
                const typeResults = groupedResults[type];
                if (!typeResults || typeResults.length === 0) return null;

                return (
                  <div key={type}>
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 sticky top-0 bg-white dark:bg-gray-800">
                      {typeLabels[type]}s
                    </div>
                    {typeResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-gray-700 dark:text-gray-200"
                      >
                        <span className="shrink-0 text-gray-400 dark:text-gray-500">
                          {typeIcons[result.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-gray-800 dark:text-white">{result.title}</div>
                          {result.subtitle && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.subtitle}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </div>

      <TeacherPopup
        teacherId={selectedTeacherId}
        open={teacherPopupOpen}
        onOpenChange={setTeacherPopupOpen}
      />
    </>
  );
};
