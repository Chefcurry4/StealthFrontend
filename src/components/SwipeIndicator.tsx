import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ROUTES = [
  { path: '/universities', label: 'Unis' },
  { path: '/courses', label: 'Courses' },
  { path: '/labs', label: 'Labs' },
];

export const SwipeIndicator = () => {
  const location = useLocation();
  const currentIndex = NAV_ROUTES.findIndex(route => 
    location.pathname.startsWith(route.path)
  );

  // Only show on catalog pages
  if (currentIndex === -1) return null;

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < NAV_ROUTES.length - 1;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden">
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border/30 shadow-lg">
        {/* Left Arrow */}
        {hasPrevious ? (
          <Link
            to={NAV_ROUTES[currentIndex - 1].path}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 text-muted-foreground/60 hover:text-muted-foreground active:scale-95 transition-all touch-manipulation"
            aria-label={`Previous: ${NAV_ROUTES[currentIndex - 1].label}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <div className="w-5" />
        )}

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {NAV_ROUTES.map((route, index) => (
            <Link
              key={route.path}
              to={route.path}
              className={cn(
                "rounded-full transition-all duration-300 flex items-center justify-center touch-manipulation",
                index === currentIndex 
                  ? "bg-primary min-h-[44px] px-3 min-w-[44px]" 
                  : "bg-muted-foreground/60 hover:bg-muted-foreground/70 min-h-[44px] min-w-[44px]"
              )}
              title={route.label}
            >
              {index === currentIndex && (
                <span className="text-primary-foreground text-xs font-medium whitespace-nowrap">
                  {route.label}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        {hasNext ? (
          <Link
            to={NAV_ROUTES[currentIndex + 1].path}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] -mr-2 text-muted-foreground/60 hover:text-muted-foreground active:scale-95 transition-all touch-manipulation"
            aria-label={`Next: ${NAV_ROUTES[currentIndex + 1].label}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <div className="w-5" />
        )}
      </div>
      <p className="text-[11px] text-center mt-1.5 opacity-50 font-medium">Swipe to navigate</p>
    </div>
  );
};
