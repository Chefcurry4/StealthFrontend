import * as React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileFilterSheetProps {
  children: React.ReactNode;
  activeFiltersCount?: number;
  onApply?: () => void;
  onReset?: () => void;
  className?: string;
}

/**
 * Mobile-optimized filter sheet that slides up from the bottom
 * Shows active filter count badge and provides apply/reset actions
 */
export const MobileFilterSheet = ({
  children,
  activeFiltersCount = 0,
  onApply,
  onReset,
  className,
}: MobileFilterSheetProps) => {
  const [open, setOpen] = React.useState(false);

  const handleApply = () => {
    onApply?.();
    setOpen(false);
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <div className={cn("md:hidden", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full relative min-h-[44px]"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-2 px-2 py-0.5 text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[min(85vh,800px)] flex flex-col">
          <SheetHeader>
            <SheetTitle>Filter Results</SheetTitle>
            <SheetDescription>
              Refine your search with the filters below
            </SheetDescription>
          </SheetHeader>
          
          {/* Scrollable filter content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {children}
          </div>

          {/* Sticky footer with actions */}
          <SheetFooter className="flex-row gap-2 border-t pt-4">
            {onReset && activeFiltersCount > 0 && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex-1 min-h-[44px]"
              >
                Reset
              </Button>
            )}
            <Button 
              onClick={handleApply}
              className="flex-1 min-h-[44px]"
            >
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
