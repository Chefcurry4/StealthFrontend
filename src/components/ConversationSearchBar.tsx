import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  ChevronUp, 
  ChevronDown,
  MessageSquare,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  messageId: string;
  messageIndex: number;
  role: "user" | "assistant";
  snippet: string;
  matchStart: number;
  matchEnd: number;
}

interface ConversationSearchBarProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  results: SearchResult[];
  activeResultIndex: number;
  onNextResult: () => void;
  onPrevResult: () => void;
  onResultClick: (messageIndex: number) => void;
}

export const ConversationSearchBar = ({
  isOpen,
  searchQuery,
  onSearchChange,
  onClose,
  results,
  activeResultIndex,
  onNextResult,
  onPrevResult,
  onResultClick,
}: ConversationSearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && e.shiftKey) {
        onPrevResult();
      } else if (e.key === "Enter") {
        onNextResult();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNextResult, onPrevResult]);

  if (!isOpen) return null;

  const highlightMatch = (snippet: string, start: number, end: number) => {
    return (
      <>
        {snippet.substring(0, start)}
        <mark className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">
          {snippet.substring(start, end)}
        </mark>
        {snippet.substring(end)}
      </>
    );
  };

  return (
    <div className="absolute top-[140px] left-4 right-4 z-20 bg-popover border rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-top-2 max-w-sm ml-auto">
      {/* Search input */}
      <div className="flex items-center gap-2 p-2 border-b">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="border-0 bg-transparent p-0 h-6 text-sm focus-visible:ring-0"
        />
        {results.length > 0 && (
          <Badge variant="secondary" className="shrink-0 text-xs px-1.5 py-0.5">
            {activeResultIndex + 1}/{results.length}
          </Badge>
        )}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onPrevResult}
            disabled={results.length === 0}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onNextResult}
            disabled={results.length === 0}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Search results */}
      {searchQuery.length >= 2 && (
        <div className="max-h-48 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No results found
            </p>
          ) : (
            <div className="divide-y">
              {results.slice(0, 5).map((result, idx) => (
                <button
                  key={`${result.messageId}-${idx}`}
                  className={cn(
                    "w-full text-left p-2 hover:bg-accent/50 transition-colors",
                    idx === activeResultIndex && "bg-accent"
                  )}
                  onClick={() => onResultClick(result.messageIndex)}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {result.role === "assistant" ? (
                      <MessageSquare className="h-2.5 w-2.5 text-primary" />
                    ) : (
                      <User className="h-2.5 w-2.5 text-muted-foreground" />
                    )}
                    <span className="text-[10px] font-medium capitalize">
                      {result.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {highlightMatch(result.snippet, result.matchStart, result.matchEnd)}
                  </p>
                </button>
              ))}
              {results.length > 5 && (
                <p className="text-[10px] text-muted-foreground text-center py-1.5">
                  +{results.length - 5} more results
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationSearchBar;
