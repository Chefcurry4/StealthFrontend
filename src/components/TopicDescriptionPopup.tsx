import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TopicDescriptionPopupProps {
  topicName: string;
  variant?: "badge" | "text";
  className?: string;
}

interface TopicData {
  id_topic: string;
  topic_name: string;
  descriptions: string | null;
}

export const TopicDescriptionPopup = ({
  topicName,
  variant = "badge",
  className = "",
}: TopicDescriptionPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTopicDescription = async () => {
    if (topicData) return; // Already fetched
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("Topics(TOP)")
        .select("*")
        .ilike("topic_name", topicName)
        .maybeSingle();

      if (!error && data) {
        setTopicData(data as TopicData);
      }
    } catch (err) {
      console.error("Error fetching topic:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !topicData) {
      fetchTopicDescription();
    }
  }, [isOpen]);

  const content = (
    <>
      {isLoading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : topicData?.descriptions ? (
        <p className="text-sm leading-relaxed">{topicData.descriptions}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No description available for this topic.
        </p>
      )}
    </>
  );

  // For mobile: use dialog
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <>
        {variant === "badge" ? (
          <Badge
            variant="secondary"
            className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 ${className}`}
            onClick={() => {
              setIsOpen(true);
              if (!topicData) fetchTopicDescription();
            }}
          >
            {topicName}
          </Badge>
        ) : (
          <span
            className={`cursor-pointer hover:text-primary transition-colors ${className}`}
            onClick={() => {
              setIsOpen(true);
              if (!topicData) fetchTopicDescription();
            }}
          >
            {topicName}
          </span>
        )}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                {topicName}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="pt-2">{content}</div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // For desktop: use hover card that follows mouse position
  return (
    <HoverCard openDelay={200} closeDelay={100} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        {variant === "badge" ? (
          <Badge
            variant="secondary"
            className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 ${className}`}
          >
            {topicName}
          </Badge>
        ) : (
          <span
            className={`cursor-pointer hover:text-primary transition-colors underline decoration-dotted ${className}`}
          >
            {topicName}
          </span>
        )}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-72 z-50" 
        align="start"
        side="right"
        sideOffset={8}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">{topicName}</h4>
          </div>
          {content}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
