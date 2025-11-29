import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, GraduationCap, User, Globe, Calendar, Wrench, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/useCourses";
import { useTeacherIdByCourse } from "@/hooks/useTeachers";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedCourses, useToggleSaveCourse } from "@/hooks/useSavedItems";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading, error } = useCourse(id!);
  const { data: teacherId } = useTeacherIdByCourse(id!);
  const { user } = useAuth();
  const { data: savedCourses } = useSavedCourses();
  const toggleSave = useToggleSaveCourse();

  const isSaved = savedCourses?.some((saved: any) => saved.course_id === id);

  const handleSave = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    toggleSave.mutate(id!);
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

  if (error || !course) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Link to="/courses">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
          <p className="text-muted-foreground">Course not found</p>
        </div>
      </div>
    );
  }

  const topics = course.topics?.split(',').map(t => t.trim()).filter(Boolean) || [];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link to="/courses">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            {course.code && <Badge variant="secondary">{course.code}</Badge>}
            {course.ba_ma && <Badge variant="outline">{course.ba_ma}</Badge>}
          </div>
          <h1 className="text-4xl font-bold mb-4">{course.name_course}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{course.description}</p>
                  </div>
                )}

                {topics.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Topics Covered</h3>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic, idx) => (
                        <Badge key={idx} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {course.type_exam && (
                  <div>
                    <h3 className="font-semibold mb-2">Examination</h3>
                    <p className="text-muted-foreground">{course.type_exam}</p>
                  </div>
                )}

                {course.software_equipment && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Software & Equipment
                    </h3>
                    <p className="text-muted-foreground">{course.software_equipment}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {course.professor_name && (
              <Card>
                <CardHeader>
                  <CardTitle>Teaching Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  {teacherId ? (
                    <Link to={`/teachers/${teacherId}`}>
                      <div className="flex items-center gap-2 hover:text-primary transition-colors">
                        <User className="h-4 w-4" />
                        <span className="hover:underline">{course.professor_name}</span>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{course.professor_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Course Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Course reviews coming soon. Sign up to be the first to review this course!
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.ects && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{course.ects}</strong> ECTS Credits
                    </span>
                  </div>
                )}

                {course.language && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.language}</span>
                  </div>
                )}

                {course.term && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.term}</span>
                  </div>
                )}

                {course.year && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.year}</span>
                  </div>
                )}

                {course.ba_ma && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.ba_ma}</span>
                  </div>
                )}

                {course.mandatory_optional && (
                  <div className="text-sm">
                    <strong>Type:</strong> {course.mandatory_optional}
                  </div>
                )}

                {course.which_year && (
                  <div className="text-sm">
                    <strong>Year of Study:</strong> {course.which_year}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button className="w-full" onClick={handleSave} disabled={toggleSave.isPending}>
                <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save Course'}
              </Button>
              <Button variant="outline" className="w-full">
                Add to Learning Agreement
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
