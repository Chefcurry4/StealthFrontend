import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, BookOpen, Bookmark, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useProgram, useProgramCourses } from "@/hooks/usePrograms";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedPrograms, useToggleSaveProgram } from "@/hooks/useSavedItems";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: program, isLoading, error } = useProgram(slug!);
  const { data: courses, isLoading: coursesLoading } = useProgramCourses(program?.id || "");
  const { user } = useAuth();
  const { data: savedPrograms } = useSavedPrograms();
  const toggleSave = useToggleSaveProgram();

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

  const isSaved = savedPrograms?.some((saved: any) => saved.id_program === program?.id);

  // Group courses by year and type
  const groupedCourses = coursesWithInfo?.reduce((acc: any, course: any) => {
    const year = course.year || 'Other';
    if (!acc[year]) acc[year] = { mandatory: [], optional: [] };
    if (course.mandatoryOptional === 'Mandatory') {
      acc[year].mandatory.push(course);
    } else if (course.mandatoryOptional === 'Optional') {
      acc[year].optional.push(course);
    } else {
      acc[year].optional.push(course);
    }
    return acc;
  }, {});

  const years = Object.keys(groupedCourses || {}).sort();

  const handleSave = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (program) {
      toggleSave.mutate(program.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Link to="/programs">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
          </Link>
          <p className="text-muted-foreground">Program not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link to="/programs">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{program.name}</h1>
              {programInfo && (
                <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                  {programInfo.level && <Badge variant="outline">{programInfo.level}</Badge>}
                  {programInfo.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {programInfo.duration}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          {program.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {program.description}
            </p>
          )}
          {programInfo?.website && (
            <a
              href={programInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline mt-2 inline-block"
            >
              Visit Program Website →
            </a>
          )}
        </div>

        <div className="space-y-6">
          {years.length > 0 ? (
            <Accordion type="single" collapsible defaultValue="1" className="w-full">
              {years.map((year) => {
                const mandatory = groupedCourses[year].mandatory;
                const optional = groupedCourses[year].optional;
                const totalEcts = [...mandatory, ...optional].reduce((sum, c) => sum + (c.ects || 0), 0);

                return (
                  <AccordionItem key={year} value={year}>
                    <AccordionTrigger className="text-lg font-semibold">
                      Year {year} ({mandatory.length + optional.length} courses, {totalEcts} ECTS)
                    </AccordionTrigger>
                    <AccordionContent>
                      {mandatory.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Badge>Mandatory</Badge>
                            <span className="text-sm text-muted-foreground">
                              ({mandatory.reduce((sum, c) => sum + (c.ects || 0), 0)} ECTS)
                            </span>
                          </h3>
                          <div className="space-y-2">
                            {mandatory.map((course: any) => (
                              <Link
                                key={course.id_course}
                                to={`/courses/${course.id_course}`}
                                className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      {course.code && <Badge variant="secondary">{course.code}</Badge>}
                                      {course.ects && (
                                        <span className="text-sm text-muted-foreground">
                                          {course.ects} ECTS
                                        </span>
                                      )}
                                      {course.level && (
                                        <Badge variant="outline" className="text-xs">
                                          {course.level === 'Ba' ? 'Bachelor' : 'Master'}
                                        </Badge>
                                      )}
                                    </div>
                                    <h3 className="font-semibold">{course.name_course}</h3>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {optional.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="outline">Optional</Badge>
                            <span className="text-sm text-muted-foreground">
                              ({optional.reduce((sum, c) => sum + (c.ects || 0), 0)} ECTS)
                            </span>
                          </h3>
                          <div className="space-y-2">
                            {optional.map((course: any) => (
                              <Link
                                key={course.id_course}
                                to={`/courses/${course.id_course}`}
                                className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      {course.code && <Badge variant="secondary">{course.code}</Badge>}
                                      {course.ects && (
                                        <span className="text-sm text-muted-foreground">
                                          {course.ects} ECTS
                                        </span>
                                      )}
                                      {course.level && (
                                        <Badge variant="outline" className="text-xs">
                                          {course.level === 'Ba' ? 'Bachelor' : 'Master'}
                                        </Badge>
                                      )}
                                    </div>
                                    <h3 className="font-semibold">{course.name_course}</h3>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <Card>
              <CardContent className="py-8">
                {coursesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">No courses found for this program.</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleSave} disabled={toggleSave.isPending}>
              <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save Program'}
            </Button>
            <Button variant="outline" className="flex-1">
              Add to Learning Agreement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
