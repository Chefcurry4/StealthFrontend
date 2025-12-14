import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Award, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacher, useTeacherCourses } from "@/hooks/useTeachers";

const TeacherDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: teacher, isLoading, error } = useTeacher(id!);
  const { data: courses, isLoading: coursesLoading } = useTeacherCourses(id!);

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

  if (error || !teacher) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <p className="text-muted-foreground">Teacher not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {teacher.full_name || teacher.name}
                  </h1>
                  {teacher.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${teacher.email}`} className="hover:underline">
                        {teacher.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {teacher.topics && teacher.topics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Research Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {teacher.topics.map((topic, idx) => (
                      <Badge key={idx} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Courses Taught ({courses?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                ) : courses && courses.length > 0 ? (
                  <div className="space-y-3">
                    {courses.map((course: any) => (
                      <Link
                        key={course.id_course}
                        to={`/courses/${course.id_course}`}
                        className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {course.code && <Badge variant="secondary">{course.code}</Badge>}
                              {course.ba_ma && <Badge variant="outline">{course.ba_ma}</Badge>}
                            </div>
                            <h3 className="font-semibold">{course.name_course}</h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              {course.ects && <span>{course.ects} ECTS</span>}
                              {course.term && <span>• {course.term}</span>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No courses found</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teacher["h-index"] && (
                  <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{teacher["h-index"]}</div>
                      <div className="text-sm text-muted-foreground">h-index</div>
                    </div>
                  </div>
                )}

                {teacher.citations && (
                  <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{teacher.citations}</div>
                      <div className="text-sm text-muted-foreground">Citations</div>
                    </div>
                  </div>
                )}

                {!teacher["h-index"] && !teacher.citations && (
                  <p className="text-sm text-muted-foreground">
                    No metrics available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
