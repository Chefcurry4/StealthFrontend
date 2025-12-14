import { useLocation, Link } from 'react-router-dom';
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

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border/30 shadow-lg">
        {NAV_ROUTES.map((route, index) => (
          <Link
            key={route.path}
            to={route.path}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "w-6 bg-primary" 
                : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
            )}
            title={route.label}
          />
        ))}
      </div>
      <p className="text-[10px] text-center mt-1 opacity-50">Swipe to navigate</p>
    </div>
  );
};
