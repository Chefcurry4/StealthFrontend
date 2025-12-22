import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, Clock, BookOpen, Filter, ChevronRight, Users, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgram, useProgramCourses } from "@/hooks/usePrograms";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { TeacherLink } from "@/components/TeacherLink";

// Map of program slugs that have master structure pages
const MASTER_STRUCTURE_PROGRAMS: Record<string, string> = {
  "Life-Sc": "life-sciences-engineering",
  "Archi": "architecture",
  "CE": "civil-engineering",
  "US": "urban-systems",
  "SIE": "environmental-sciences-engineering",
};

const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: program, isLoading, error } = useProgram(slug!);
  const { data: courses, isLoading: coursesLoading } = useProgramCourses(program?.id || "");

  const [levelFilter, setLevelFilter] = useState<"all" | "Ba" | "Ma">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "Mandatory" | "Optional">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch course details with bridge table info
  const { data: coursesWithInfo } = useQuery({
    queryKey: ["programCoursesDetail", program?.id],
    queryFn: async () => {
      if (!program?.id) return [];
      
      const { data: bridgeData } = await supabase
        .from("bridge_cp(C-P)")
        .select("*")
        .eq("id_program", program.id);

      if (!bridgeData) return courses || [];

      return courses?.map(course => {
        const bridgeInfo = bridgeData.find(b => b.id_course === course.id_course);
        return {
          ...course,
          year: bridgeInfo?.Year,
          mandatoryOptional: bridgeInfo?.["Mandatory/Optional"],
          level: bridgeInfo?.["Ba/Ma"]
        };
      });
    },
    enabled: !!program?.id && !!courses,
  });

  // Fetch program info from bridge table
  const { data: programInfo } = useQuery({
    queryKey: ["programInfo", program?.id],
    queryFn: async () => {
      if (!program?.id) return null;
      
      const { data } = await supabase
        .from("bridge_up(U-P)")
        .select("*")
        .eq("id_program", program.id)
        .maybeSingle();

      return data;
    },
    enabled: !!program?.id,
  });

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    if (!coursesWithInfo) return [];
    
    return coursesWithInfo.filter((course: any) => {
      // Level filter
      if (levelFilter !== "all" && course.level !== levelFilter) return false;
      
      // Type filter
      if (typeFilter !== "all" && course.mandatoryOptional !== typeFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = course.name_course?.toLowerCase().includes(query);
        const matchesCode = course.code?.toLowerCase().includes(query);
        const matchesProf = course.professor_name?.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesProf) return false;
      }
      
      return true;
    });
  }, [coursesWithInfo, levelFilter, typeFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    if (!coursesWithInfo) return { total: 0, bachelor: 0, master: 0, mandatory: 0, optional: 0, totalEcts: 0 };
    
    return {
      total: coursesWithInfo.length,
      bachelor: coursesWithInfo.filter((c: any) => c.level === "Ba").length,
      master: coursesWithInfo.filter((c: any) => c.level === "Ma").length,
      mandatory: coursesWithInfo.filter((c: any) => c.mandatoryOptional === "Mandatory").length,
      optional: coursesWithInfo.filter((c: any) => c.mandatoryOptional === "Optional").length,
      totalEcts: coursesWithInfo.reduce((sum: number, c: any) => sum + (c.ects || 0), 0),
    };
  }, [coursesWithInfo]);

  const filteredEcts = useMemo(() => {
    return filteredCourses.reduce((sum: number, c: any) => sum + (c.ects || 0), 0);
  }, [filteredCourses]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full mb-6" />
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <p className="text-muted-foreground">Program not found</p>
        </div>
      </div>
    );
  }

  const hasMasterStructure = slug && MASTER_STRUCTURE_PROGRAMS[slug];

  return (
    <div className="min-h-screen py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          
          {/* View Master's Structure button - only show for programs with structure pages */}
          {hasMasterStructure && programInfo?.level?.toLowerCase().includes("master") && (
            <Button 
              onClick={() => navigate(`/programs/${slug}/structure`)}
              className="gap-2"
              size="lg"
            >
              <LayoutGrid className="h-5 w-5" />
              View Master's Structure
            </Button>
          )}
        </div>

        {/* Program Info */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-3">
            <div className="p-3 bg-primary/10 rounded-xl shrink-0">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{program.name}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                {programInfo?.level && (
                  <Badge variant="secondary" className="text-xs">
                    {programInfo.level}
                  </Badge>
                )}
                {programInfo?.duration && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {programInfo.duration}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  {stats.total} courses
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats.totalEcts} ECTS
                </span>
              </div>
            </div>
          </div>
          
          {program.description && (
            <p className="text-muted-foreground mb-3">{program.description}</p>
          )}
          
          {programInfo?.website && (
            <a
              href={programInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm inline-flex items-center gap-1"
            >
              Visit Program Website
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Filters */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Level Filter - Primary */}
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Level</label>
              <Tabs value={levelFilter} onValueChange={(v) => setLevelFilter(v as any)} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="all" className="text-xs">
                    All ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="Ba" className="text-xs">
                    Bachelor ({stats.bachelor})
                  </TabsTrigger>
                  <TabsTrigger value="Ma" className="text-xs">
                    Master ({stats.master})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Type Filter */}
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Type</label>
              <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
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
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Search</label>
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
              Showing <span className="font-medium text-foreground">{filteredCourses.length}</span> courses
            </span>
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{filteredEcts}</span> ECTS
            </span>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-2">
          {coursesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course: any) => (
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
                          variant={course.level === "Ba" ? "default" : "outline"} 
                          className="text-xs"
                        >
                          {course.level === "Ba" ? "Bachelor" : "Master"}
                        </Badge>
                      )}
                      {course.mandatoryOptional && (
                        <Badge 
                          variant={course.mandatoryOptional === "Mandatory" ? "destructive" : "secondary"}
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
                      {course.term && (
                        <span>{course.term}</span>
                      )}
                      {course.language && (
                        <span>{course.language}</span>
                      )}
                      {course.professor_name && (
                        <span 
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Users className="h-3.5 w-3.5" />
                          {course.professor_name.split(';').slice(0, 2).map((name: string, idx: number) => (
                            <span key={idx}>
                              <TeacherLink teacherName={name.trim()} />
                              {idx < Math.min(course.professor_name.split(';').length - 1, 1) && ", "}
                            </span>
                          ))}
                          {course.professor_name.split(';').length > 2 && (
                            <span className="text-muted-foreground">
                              +{course.professor_name.split(';').length - 2}
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
    </div>
  );
};

export default ProgramDetail;
