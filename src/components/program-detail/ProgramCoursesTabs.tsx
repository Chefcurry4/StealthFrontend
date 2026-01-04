import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FlaskConical, Lightbulb, Building2, ExternalLink, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProgramCourse, ProgramSpecialization } from "@/hooks/useProgramStructure";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProgramCoursesTabsProps {
  courses: ProgramCourse[];
  specializations: ProgramSpecialization[];
}

export const ProgramCoursesTabs = ({ courses, specializations }: ProgramCoursesTabsProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch DB courses to enable linking
  const { data: dbCourses } = useQuery({
    queryKey: ["allCoursesForStructure"],
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

    // Try word-based matching
    const courseWords = normalized.split(/\s+/).filter((w) => w.length > 3);
    const wordMatch = dbCourses.find((c) => {
      const dbWords = (c.name_course?.toLowerCase() || "")
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const matchCount = courseWords.filter((w) =>
        dbWords.some((dw) => dw.includes(w) || w.includes(dw))
      ).length;
      return matchCount >= Math.min(3, courseWords.length);
    });
    if (wordMatch) return `/courses/${wordMatch.id_course}`;

    return null;
  };

  const getSpecializationBadge = (code: string) => {
    const spec = specializations.find((s) => s.code === code);
    if (!spec) return null;
    return (
      <Tooltip key={code}>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className={`${spec.color} text-white text-xs px-1.5 py-0`}
          >
            {code}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{spec.name}</TooltipContent>
      </Tooltip>
    );
  };

  // Group courses by category
  const coursesByCategory = useMemo(() => {
    const filtered = searchQuery
      ? courses.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : courses;

    return {
      core: filtered.filter((c) => c.category === "core"),
      transversal: filtered.filter((c) => c.category === "transversal"),
      optional: filtered.filter((c) => c.category === "optional"),
      innovation: filtered.filter((c) => c.category === "innovation"),
    };
  }, [courses, searchQuery]);

  const hasCore = coursesByCategory.core.length > 0;
  const hasTransversal = coursesByCategory.transversal.length > 0;
  const hasOptional = coursesByCategory.optional.length > 0;
  const hasInnovation = coursesByCategory.innovation.length > 0;

  const defaultTab = hasCore
    ? "core"
    : hasTransversal
    ? "transversal"
    : hasOptional
    ? "optional"
    : "innovation";

  const CourseRow = ({ course }: { course: ProgramCourse }) => {
    const courseLink = findCourseLink(course.name);

    const content = (
      <div className="flex items-center gap-3 flex-wrap flex-1">
        <span
          className={`font-medium ${
            courseLink ? "group-hover:text-primary transition-colors" : ""
          }`}
        >
          {course.name}
        </span>
        {courseLink && (
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {course.specialization_codes && course.specialization_codes.length > 0 && (
          <div className="flex gap-1">
            {course.specialization_codes.map((s) => getSpecializationBadge(s))}
          </div>
        )}
      </div>
    );

    if (courseLink) {
      return (
        <Link
          to={courseLink}
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
        >
          {content}
          <Badge variant="secondary" className="shrink-0">
            {course.credits} ECTS
          </Badge>
        </Link>
      );
    }

    return (
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
        {content}
        <Badge variant="secondary" className="shrink-0">
          {course.credits} ECTS
        </Badge>
      </div>
    );
  };

  const tabCount =
    (hasCore ? 1 : 0) +
    (hasTransversal ? 1 : 0) +
    (hasOptional ? 1 : 0) +
    (hasInnovation ? 1 : 0);

  return (
    <div className="mb-6">
      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className={`grid w-full grid-cols-${Math.min(tabCount, 4)}`}>
          {hasCore && (
            <TabsTrigger value="core" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Core</span> ({coursesByCategory.core.length})
            </TabsTrigger>
          )}
          {hasTransversal && (
            <TabsTrigger value="transversal" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Transversal</span> ({coursesByCategory.transversal.length})
            </TabsTrigger>
          )}
          {hasOptional && (
            <TabsTrigger value="optional" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Options</span> ({coursesByCategory.optional.length})
            </TabsTrigger>
          )}
          {hasInnovation && (
            <TabsTrigger value="innovation" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Innovation</span> ({coursesByCategory.innovation.length})
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
                <div className="space-y-2">
                  {coursesByCategory.core.map((course) => (
                    <CourseRow key={course.id} course={course} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasTransversal && (
          <TabsContent value="transversal">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compulsory Transversal Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {coursesByCategory.transversal.map((course) => (
                    <CourseRow key={course.id} course={course} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasOptional && (
          <TabsContent value="optional">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Option Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {coursesByCategory.optional.map((course) => (
                    <CourseRow key={course.id} course={course} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasInnovation && (
          <TabsContent value="innovation">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Innovation & Entrepreneurship</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {coursesByCategory.innovation.map((course) => (
                    <CourseRow key={course.id} course={course} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
