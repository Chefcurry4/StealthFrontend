import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { DiaryPage } from "@/types/diary";
import { cn } from "@/lib/utils";

interface DiaryNotebookProps {
  pages: DiaryPage[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  notebookId: string;
  children: React.ReactNode;
}

export const DiaryNotebook = ({
  pages,
  currentPageIndex,
  onPageChange,
  notebookId,
  children,
}: DiaryNotebookProps) => {
  const { mode, modeConfig } = useBackgroundTheme();
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);

  const handlePageTurn = (direction: 'left' | 'right') => {
    if (isFlipping) return;

    const newIndex = direction === 'right' 
      ? Math.min(pages.length - 1, currentPageIndex + 1)
      : Math.max(0, currentPageIndex - 1);

    if (newIndex !== currentPageIndex) {
      setFlipDirection(direction);
      setIsFlipping(true);
      
      setTimeout(() => {
        onPageChange(newIndex);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 300);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-4 perspective-1000">
      {/* Book container */}
      <div 
        className="relative w-full max-w-5xl h-full flex"
        style={{ perspective: "2000px" }}
      >
        {/* Spiral binding visual */}
        <div 
          className="absolute left-8 top-0 bottom-0 w-4 z-10 flex flex-col justify-around py-8"
          style={{ background: modeConfig.ui.cardBorder }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-2 rounded-full"
              style={{ background: modeConfig.ui.inputBorder }}
            />
          ))}
        </div>

        {/* Page */}
        <div 
          className={cn(
            "flex-1 ml-12 rounded-r-lg shadow-2xl transition-transform duration-300 overflow-hidden",
            isFlipping && flipDirection === 'right' && "animate-flip-right",
            isFlipping && flipDirection === 'left' && "animate-flip-left",
          )}
          style={{ 
            background: mode === 'day' 
              ? 'linear-gradient(to right, #f5f5f0, #fafaf7)'
              : 'linear-gradient(to right, hsl(var(--card)), hsl(var(--card)))',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Paper lines */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                transparent,
                transparent 31px,
                ${modeConfig.ui.cardBorder} 31px,
                ${modeConfig.ui.cardBorder} 32px
              )`,
              backgroundPosition: '0 60px',
            }}
          />

          {/* Red margin line */}
          <div 
            className="absolute top-0 bottom-0 left-16 w-px opacity-30"
            style={{ background: '#e74c3c' }}
          />

          {/* Page content */}
          <div className="relative h-full overflow-auto p-6 pl-20">
            {/* Page header */}
            <div className="mb-6 pb-4 border-b" style={{ borderColor: modeConfig.ui.cardBorder }}>
              <h2 className="text-xl font-semibold" style={{ color: modeConfig.textColor }}>
                {pages[currentPageIndex]?.title || `Page ${currentPageIndex + 1}`}
              </h2>
              {pages[currentPageIndex]?.semester && (
                <span className="text-sm opacity-60">{pages[currentPageIndex].semester}</span>
              )}
            </div>

            {/* Page children */}
            {children}
          </div>
        </div>

        {/* Page turn buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 opacity-50 hover:opacity-100"
          onClick={() => handlePageTurn('left')}
          disabled={currentPageIndex === 0 || isFlipping}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 opacity-50 hover:opacity-100"
          onClick={() => handlePageTurn('right')}
          disabled={currentPageIndex === pages.length - 1 || isFlipping}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>

        {/* Page thumbnails */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => onPageChange(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                index === currentPageIndex 
                  ? "scale-125" 
                  : "opacity-50 hover:opacity-100"
              )}
              style={{ 
                background: index === currentPageIndex 
                  ? modeConfig.ui.buttonPrimary 
                  : modeConfig.ui.cardBorder 
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
