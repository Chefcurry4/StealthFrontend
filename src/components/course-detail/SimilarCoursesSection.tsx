import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimilarCourses } from "@/hooks/useSimilarCourses";
import { useRef } from "react";

interface SimilarCoursesSectionProps {
  courseId: string;
  topics: string | null;
}

export const SimilarCoursesSection = ({ courseId, topics }: SimilarCoursesSectionProps) => {
  const { data: similarCourses, isLoading } = useSimilarCourses(courseId, topics);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Similar Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[280px]">
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!similarCourses || similarCourses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Similar Courses</CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => scroll("left")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => scroll("right")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {similarCourses.map((course) => {
            const courseTopics = course.topics?.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) || [];
            
            return (
              <div
                key={course.id_course}
                className="min-w-[280px] max-w-[280px] flex-shrink-0"
              >
                <div className="border rounded-lg p-4 h-full flex flex-col hover:border-primary/50 transition-colors bg-card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {course.code && (
                      <Badge variant="secondary" className="text-xs">
                        {course.code}
                      </Badge>
                    )}
                    {course.ects && (
                      <Badge variant="outline" className="text-xs">
                        {course.ects} ECTS
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-sm line-clamp-2 mb-2 flex-grow">
                    {course.name_course}
                  </h3>
                  
                  {courseTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {courseTopics.map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Link to={`/courses/${course.id_course}`}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <BookOpen className="h-4 w-4" />
                      Open
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
