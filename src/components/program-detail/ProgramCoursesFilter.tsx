import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TeacherLink } from "@/components/TeacherLink";

interface CourseWithInfo {
  id_course: string;
  name_course: string;
  code?: string;
  ects?: number;
  term?: string;
  language?: string;
  professor_name?: string;
  year?: string;
  mandatoryOptional?: string;
  level?: string;
}

interface ProgramCoursesFilterProps {
  courses: CourseWithInfo[] | undefined;
  isLoading: boolean;
  showLevelFilter?: boolean;
}

export const ProgramCoursesFilter = ({
  courses,
  isLoading,
  showLevelFilter = true,
}: ProgramCoursesFilterProps) => {
  const [levelFilter, setLevelFilter] = useState<"all" | "Bachelor" | "Master">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "Mandatory" | "Optional">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const stats = useMemo(() => {
    if (!courses) return { total: 0, bachelor: 0, master: 0, mandatory: 0, optional: 0, totalEcts: 0 };

    return {
      total: courses.length,
      bachelor: courses.filter((c) => c.level === "Bachelor").length,
      master: courses.filter((c) => c.level === "Master").length,
      mandatory: courses.filter((c) => c.mandatoryOptional === "Mandatory").length,
      optional: courses.filter((c) => c.mandatoryOptional === "Optional").length,
      totalEcts: courses.reduce((sum, c) => sum + (c.ects || 0), 0),
    };
  }, [courses]);

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      if (levelFilter !== "all" && course.level !== levelFilter) return false;
      if (typeFilter !== "all" && course.mandatoryOptional !== typeFilter) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = course.name_course?.toLowerCase().includes(query);
        const matchesCode = course.code?.toLowerCase().includes(query);
        const matchesProf = course.professor_name?.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesProf) return false;
      }

      return true;
    });
  }, [courses, levelFilter, typeFilter, searchQuery]);

  const filteredEcts = useMemo(() => {
    return filteredCourses.reduce((sum, c) => sum + (c.ects || 0), 0);
  }, [filteredCourses]);

  return (
    <div>
      {/* Filters */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Level Filter */}
          {showLevelFilter && (
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Level
              </label>
              <Tabs
                value={levelFilter}
                onValueChange={(v) => setLevelFilter(v as "all" | "Bachelor" | "Master")}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="all" className="text-xs">
                    All ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="Bachelor" className="text-xs">
                    Bachelor ({stats.bachelor})
                  </TabsTrigger>
                  <TabsTrigger value="Master" className="text-xs">
                    Master ({stats.master})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Type Filter */}
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Type
            </label>
            <Tabs
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as "all" | "Mandatory" | "Optional")}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="Mandatory" className="text-xs">
                  Mandatory ({stats.mandatory})
                </TabsTrigger>
                <TabsTrigger value="Optional" className="text-xs">
                  Optional ({stats.optional})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Search
            </label>
            <Input
              placeholder="Search courses, codes, professors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredCourses.length}
            </span>{" "}
            courses
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{filteredEcts}</span>{" "}
            ECTS
          </span>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Link
              key={course.id_course}
              to={`/courses/${course.id_course}`}
              className="block bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:bg-card/80 hover:border-border transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Top row: badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {course.code && (
                      <Badge variant="secondary" className="text-xs font-mono">
                        {course.code}
                      </Badge>
                    )}
                    {course.level && (
                      <Badge
                        variant={course.level === "Bachelor" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {course.level}
                      </Badge>
                    )}
                    {course.mandatoryOptional && (
                      <Badge
                        variant={
                          course.mandatoryOptional === "Mandatory"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {course.mandatoryOptional}
                      </Badge>
                    )}
                    {course.year && (
                      <span className="text-xs text-muted-foreground">
                        Year {course.year}
                      </span>
                    )}
                  </div>

                  {/* Course name */}
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                    {course.name_course}
                  </h3>

                  {/* Bottom row: details */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    {course.ects && (
                      <span className="font-medium">{course.ects} ECTS</span>
                    )}
                    {course.term && <span>{course.term}</span>}
                    {course.language && <span>{course.language}</span>}
                    {course.professor_name && (
                      <span
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Users className="h-3.5 w-3.5" />
                        {course.professor_name
                          .split(";")
                          .slice(0, 2)
                          .map((name: string, idx: number) => (
                            <span key={idx}>
                              <TeacherLink teacherName={name.trim()} />
                              {idx <
                                Math.min(
                                  course.professor_name!.split(";").length - 1,
                                  1
                                ) && ", "}
                            </span>
                          ))}
                        {course.professor_name.split(";").length > 2 && (
                          <span className="text-muted-foreground">
                            +{course.professor_name.split(";").length - 2}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No courses found matching your filters.</p>
            <Button
              variant="link"
              onClick={() => {
                setLevelFilter("all");
                setTypeFilter("all");
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
