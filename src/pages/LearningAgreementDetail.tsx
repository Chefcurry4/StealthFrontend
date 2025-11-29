import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useLearningAgreement,
  useLearningAgreementCourses,
  useRemoveCourseFromAgreement,
  useDeleteLearningAgreement,
} from "@/hooks/useLearningAgreements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, BookOpen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LearningAgreementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: agreement, isLoading } = useLearningAgreement(id!);
  const { data: courses, isLoading: coursesLoading } = useLearningAgreementCourses(id!);
  const removeCourse = useRemoveCourseFromAgreement();
  const deleteAgreement = useDeleteLearningAgreement();

  const totalECTS = courses?.reduce((sum, item: any) => {
    return sum + (item.course?.ects || 0);
  }, 0);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this learning agreement?")) {
      deleteAgreement.mutate(id!, {
        onSuccess: () => navigate("/profile"),
      });
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">Learning agreement not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate("/profile")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{agreement.title}</CardTitle>
                {agreement.description && (
                  <p className="text-muted-foreground">{agreement.description}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Badge>{agreement.agreement_type}</Badge>
                  <Badge variant="outline">{agreement.status || "Draft"}</Badge>
                </div>
              </div>
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Courses ({courses?.length || 0}) • {totalECTS} ECTS Total
              </CardTitle>
              <Button asChild>
                <Link to="/courses">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Courses
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : courses?.length === 0 ? (
                <p className="text-muted-foreground">
                  No courses added yet. Browse courses and add them to your agreement.
                </p>
              ) : (
                <div className="space-y-3">
                  {courses?.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.course?.code && (
                            <Badge variant="secondary">{item.course.code}</Badge>
                          )}
                          {item.course?.ects && (
                            <span className="text-sm text-muted-foreground">
                              {item.course.ects} ECTS
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold">{item.course?.name_course}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCourse.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningAgreementDetail;
