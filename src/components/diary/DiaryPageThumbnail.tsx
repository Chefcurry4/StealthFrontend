import { useDiaryPageItems } from "@/hooks/useDiaryPageItems";
import { GraduationCap, Beaker, FileText, Type, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiaryPageThumbnailProps {
  pageId: string;
  title?: string;
  className?: string;
}

export const DiaryPageThumbnail = ({ pageId, title, className }: DiaryPageThumbnailProps) => {
  const { data: items } = useDiaryPageItems(pageId);

  // Get item type counts
  const itemCounts = items?.reduce((acc, item) => {
    acc[item.item_type] = (acc[item.item_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const renderMiniItems = () => {
    if (!items || items.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground/50">
          <Type className="h-4 w-4" />
        </div>
      );
    }

    // Render mini representations of items (max 6)
    const displayItems = items.slice(0, 6);
    
    return (
      <div className="relative w-full h-full p-1.5">
        {displayItems.map((item, idx) => {
          // Scale down positions to thumbnail size (roughly 1/10)
          const scale = 0.12;
          const x = Math.min(item.position_x * scale, 50);
          const y = Math.min(item.position_y * scale, 35);
          
          return (
            <div
              key={item.id}
              className="absolute"
              style={{
                left: `${x}px`,
                top: `${y}px`,
              }}
            >
              {item.item_type === "course" && (
                <div className="w-5 h-3 rounded-sm bg-blue-400/60 border border-blue-500/30" />
              )}
              {item.item_type === "lab" && (
                <div className="w-5 h-3 rounded-sm bg-emerald-400/60 border border-emerald-500/30" />
              )}
              {(item.item_type as string) === "text" && (
                <div className="w-6 h-4 rounded-sm bg-amber-400/40 border border-amber-500/20 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-amber-600/40 rounded" />
                </div>
              )}
              {item.item_type === "note" && (
                <div className="w-4 h-4 rounded-sm bg-yellow-300/60 border border-yellow-500/30" />
              )}
              {(item.item_type as string) === "semester_planner" && (
                <div className="w-8 h-6 rounded-sm bg-purple-400/40 border border-purple-500/20 grid grid-cols-2 gap-0.5 p-0.5">
                  <div className="bg-purple-500/30 rounded-[1px]" />
                  <div className="bg-purple-500/30 rounded-[1px]" />
                  <div className="bg-purple-500/30 rounded-[1px]" />
                  <div className="bg-purple-500/30 rounded-[1px]" />
                </div>
              )}
              {item.item_type === "lab_tracker" && (
                <div className="w-6 h-4 rounded-sm bg-teal-400/40 border border-teal-500/20" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden border border-border/50 bg-amber-50/80 dark:bg-amber-950/20",
      className
    )}>
      {/* Paper texture effect */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Book spine accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-800" />
      
      {/* Content area */}
      <div className="relative h-full ml-1">
        {renderMiniItems()}
      </div>
      
      {/* Item count badges */}
      <div className="absolute bottom-1 right-1 flex gap-0.5">
        {itemCounts.course && (
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-500/80 text-white text-[8px]">
            <GraduationCap className="h-2 w-2" />
            {itemCounts.course}
          </div>
        )}
        {itemCounts.lab && (
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-500/80 text-white text-[8px]">
            <Beaker className="h-2 w-2" />
            {itemCounts.lab}
          </div>
        )}
        {(itemCounts.text || itemCounts.note) && (
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/80 text-white text-[8px]">
            <FileText className="h-2 w-2" />
            {(itemCounts.text || 0) + (itemCounts.note || 0)}
          </div>
        )}
      </div>
    </div>
  );
};
