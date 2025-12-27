import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Microscope, GraduationCap, Clock, X } from "lucide-react";
import { useRecentlyViewed, RecentlyViewedItem } from "@/hooks/useRecentlyViewed";
import { formatDistanceToNow } from "date-fns";

const getIcon = (type: RecentlyViewedItem['type']) => {
  switch (type) {
    case 'course':
      return BookOpen;
    case 'lab':
      return Microscope;
    case 'program':
      return GraduationCap;
  }
};

const getColor = (type: RecentlyViewedItem['type']) => {
  switch (type) {
    case 'course':
      return 'text-green-500 bg-green-500/10';
    case 'lab':
      return 'text-purple-500 bg-purple-500/10';
    case 'program':
      return 'text-blue-500 bg-blue-500/10';
  }
};

const getLabel = (type: RecentlyViewedItem['type']) => {
  switch (type) {
    case 'course':
      return 'Course';
    case 'lab':
      return 'Lab';
    case 'program':
      return 'Program';
  }
};

export const RecentlyViewed = () => {
  const { items, clearItems } = useRecentlyViewed();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 opacity-70" />
            <h2 className="text-lg md:text-xl font-semibold">Recently Viewed</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearItems}
            className="text-xs opacity-70 hover:opacity-100"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {items.slice(0, 5).map((item) => {
            const Icon = getIcon(item.type);
            const colorClass = getColor(item.type);
            
            return (
              <Link key={`${item.type}-${item.id}`} to={item.href}>
                <Card className="h-full backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-lg">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`text-[10px] font-medium uppercase tracking-wide ${colorClass.split(' ')[0]}`}>
                          {getLabel(item.type)}
                        </span>
                        <h3 className="font-medium text-sm line-clamp-2 mt-0.5">
                          {item.name}
                        </h3>
                        {item.ects && (
                          <span className="text-[10px] opacity-60">{item.ects} ECTS</span>
                        )}
                        {item.code && !item.ects && (
                          <span className="text-[10px] opacity-60">{item.code}</span>
                        )}
                        <p className="text-[10px] opacity-50 mt-1">
                          {formatDistanceToNow(item.viewedAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
