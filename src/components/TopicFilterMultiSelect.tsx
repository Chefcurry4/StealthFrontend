import { useState, useMemo } from "react";
import { Check, X, Search, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTopics, Topic } from "@/hooks/useTopics";

interface TopicFilterMultiSelectProps {
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
  className?: string;
}

export const TopicFilterMultiSelect = ({
  selectedTopics,
  onTopicsChange,
  className = "",
}: TopicFilterMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: topics, isLoading } = useTopics();

  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    if (!searchQuery.trim()) return topics;
    const query = searchQuery.toLowerCase();
    return topics.filter(
      (topic) =>
        topic.topic_name.toLowerCase().includes(query) ||
        topic.descriptions?.toLowerCase().includes(query)
    );
  }, [topics, searchQuery]);

  const toggleTopic = (topicName: string) => {
    if (selectedTopics.includes(topicName)) {
      onTopicsChange(selectedTopics.filter((t) => t !== topicName));
    } else {
      onTopicsChange([...selectedTopics, topicName]);
    }
  };

  const clearAll = () => {
    onTopicsChange([]);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between theme-input backdrop-blur-sm ${className}`}
        >
          <div className="flex items-center gap-2 truncate">
            <Tag className="h-4 w-4 shrink-0" />
            {selectedTopics.length === 0 ? (
              <span className="text-muted-foreground">Select Topics</span>
            ) : (
              <span className="truncate">
                {selectedTopics.length} topic{selectedTopics.length > 1 ? "s" : ""} selected
              </span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[calc(100vw-2rem)] sm:w-[320px] max-w-[320px] p-0 z-50" 
        align="start"
        sideOffset={4}
      >
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {selectedTopics.length > 0 && (
          <div className="p-3 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Selected ({selectedTopics.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
              {selectedTopics.map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="gap-1 pr-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors text-xs"
                  onClick={() => toggleTopic(topic)}
                >
                  <span className="truncate max-w-[120px]">{topic}</span>
                  <X className="h-3 w-3 shrink-0" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <ScrollArea className="h-[250px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading topics...
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No topics found
            </div>
          ) : (
            <div className="p-2">
              {filteredTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic.topic_name);
                return (
                  <button
                    key={topic.id_topic}
                    onClick={() => toggleTopic(topic.topic_name)}
                    className={`w-full flex items-start gap-3 p-2 rounded-md text-left hover:bg-muted transition-colors ${
                      isSelected ? "bg-primary/10" : ""
                    }`}
                  >
                    <div
                      className={`shrink-0 mt-0.5 h-4 w-4 rounded-sm border flex items-center justify-center ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {topic.topic_name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};