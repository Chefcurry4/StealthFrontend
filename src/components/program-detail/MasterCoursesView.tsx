import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FlaskConical, Search, ExternalLink, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { JsonCourse } from "@/hooks/useMasterProgramData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MasterCoursesViewProps {
  courses: JsonCourse[];
  specializations: string[];
}

// Generate a color for a specialization based on its index
const specializationColors = [
  "bg-blue-500",
  "bg-green-500", 
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-cyan-500",
  "bg-amber-500",
];

export const MasterCoursesView = ({ courses, specializations }: MasterCoursesViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);

  // Create a stable color mapping for specializations
  const specColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    specializations.forEach((spec, idx) => {
      map[spec] = specializationColors[idx % specializationColors.length];
    });
    return map;
  }, [specializations]);

  // Fetch DB courses to enable linking
  const { data: dbCourses } = useQuery({
    queryKey: ["allCoursesForMaster"],
    queryFn: async () => {
      const { data } = await supabase
        .from("Courses(C)")
        .select("id_course, name_course, code");
      return data || [];
    },
  });

  // Find matching course in DB by name
  const findCourseLink = (courseName: string): string | null => {
    if (!dbCourses) return null;

    const normalized = courseName.toLowerCase().trim();

    // Try exact match first
    const exactMatch = dbCourses.find(
      (c) => c.name_course?.toLowerCase().trim() === normalized
    );
    if (exactMatch) return `/courses/${exactMatch.id_course}`;

    // Try partial match
    const partialMatch = dbCourses.find((c) => {
      const dbName = c.name_course?.toLowerCase().trim() || "";
      return dbName.includes(normalized) || normalized.includes(dbName);
    });
    if (partialMatch) return `/courses/${partialMatch.id_course}`;

    return null;
  };

  // Filter courses
  const filteredCourses = useMemo(() => {
    let result = courses;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.course_name.toLowerCase().includes(query) ||
          c.specialization?.toLowerCase().includes(query)
      );
    }

    // Filter by specialization
    if (selectedSpec) {
      result = result.filter(
        (c) => c.specialization?.includes(selectedSpec)
      );
    }

    return result;
  }, [courses, searchQuery, selectedSpec]);

  // Group courses by type
  const coursesByType = useMemo(() => {
    return {
      core: filteredCourses.filter((c) => c.course_type === "core"),
      option: filteredCourses.filter((c) => c.course_type === "option"),
    };
  }, [filteredCourses]);

  const hasCore = coursesByType.core.length > 0;
  const hasOptions = coursesByType.option.length > 0;

  const CourseRow = ({ course }: { course: JsonCourse }) => {
    const courseLink = findCourseLink(course.course_name);

    const content = (
      <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
        <span
          className={`font-medium truncate ${
            courseLink ? "group-hover:text-primary transition-colors" : ""
          }`}
        >
          {course.course_name}
        </span>
        {courseLink && (
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        )}
        {course.specialization && (
          <div className="flex gap-1 flex-wrap">
            {course.specialization.split(", ").map((spec) => {
              const color = specColorMap[spec] || "bg-muted";
              // Create short code from specialization name
              const shortCode = spec
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 3)
                .toUpperCase();
              return (
                <Tooltip key={spec}>
                  <TooltipTrigger>
                    <Badge
                      variant="outline"
                      className={`${color} text-white text-xs px-1.5 py-0 cursor-pointer`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSpec(selectedSpec === spec ? null : spec);
                      }}
                    >
                      {shortCode}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">{spec}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    );

    if (courseLink) {
      return (
        <Link
          to={courseLink}
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer gap-2"
        >
          {content}
          <Badge variant="secondary" className="shrink-0">
            {course.ects_credits} ECTS
          </Badge>
        </Link>
      );
    }

    return (
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors gap-2">
        {content}
        <Badge variant="secondary" className="shrink-0">
          {course.ects_credits} ECTS
        </Badge>
      </div>
    );
  };

  return (
    <div className="mb-6">
      {/* Search and Specialization Filter */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Specialization Legend/Filter */}
        {specializations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1 mr-2">
              <GraduationCap className="h-4 w-4" />
              Specializations:
            </span>
            {specializations.map((spec) => {
              const color = specColorMap[spec];
              const isActive = selectedSpec === spec;
              const shortCode = spec
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 3)
                .toUpperCase();
              return (
                <Tooltip key={spec}>
                  <TooltipTrigger>
                    <Badge
                      variant={isActive ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isActive
                          ? `${color} text-white ring-2 ring-offset-2 ring-primary`
                          : `${color} text-white opacity-70 hover:opacity-100`
                      }`}
                      onClick={() =>
                        setSelectedSpec(isActive ? null : spec)
                      }
                    >
                      {shortCode}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">{spec}</TooltipContent>
                </Tooltip>
              );
            })}
            {selectedSpec && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setSelectedSpec(null)}
              >
                Clear filter
              </Badge>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue={hasCore ? "core" : "option"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          {hasCore && (
            <TabsTrigger value="core" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Core</span> ({coursesByType.core.length})
            </TabsTrigger>
          )}
          {hasOptions && (
            <TabsTrigger value="option" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Options</span> ({coursesByType.option.length})
            </TabsTrigger>
          )}
        </TabsList>

        {hasCore && (
          <TabsContent value="core">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Core Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-2 pr-4">
                    {coursesByType.core.map((course, idx) => (
                      <CourseRow key={`${course.course_name}-${idx}`} course={course} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasOptions && (
          <TabsContent value="option">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Option Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[600px]">
                  <div className="space-y-2 pr-4">
                    {coursesByType.option.map((course, idx) => (
                      <CourseRow key={`${course.course_name}-${idx}`} course={course} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Empty state */}
      {!hasCore && !hasOptions && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No courses match your search criteria</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSpec(null);
            }}
            className="text-primary hover:underline mt-2"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
