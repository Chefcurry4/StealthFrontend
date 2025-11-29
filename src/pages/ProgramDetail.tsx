import { useParams, Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgram, useProgramCourses } from "@/hooks/usePrograms";

const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: program, isLoading, error } = useProgram(slug!);
  const { data: courses, isLoading: coursesLoading } = useProgramCourses(program?.id || "");

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
            <h1 className="text-4xl font-bold">{program.name}</h1>
          </div>
          {program.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {program.description}
            </p>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Courses in This Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : courses?.length === 0 ? (
                <p className="text-muted-foreground">No courses found for this program.</p>
              ) : (
                <div className="space-y-3">
                  {courses?.map((course: any) => (
                    <Link
                      key={course.id_course}
                      to={`/courses/${course.id_course}`}
                      className="block p-4 border rounded-lg hover:bg-accent transition-colors"
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
                          </div>
                          <h3 className="font-semibold">{course.name_course}</h3>
                          {course.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {course.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button className="flex-1">Save Program</Button>
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
