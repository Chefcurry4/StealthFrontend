import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSavedCourses, useSavedLabs, useSavedPrograms } from "@/hooks/useSavedItems";
import { useLearningAgreements } from "@/hooks/useLearningAgreements";
import { useAICourseRecommendations } from "@/hooks/useAI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Beaker, FileText, User, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: savedCourses, isLoading: coursesLoading } = useSavedCourses();
  const { data: savedLabs, isLoading: labsLoading } = useSavedLabs();
  const { data: savedPrograms, isLoading: programsLoading } = useSavedPrograms();
  const { data: agreements, isLoading: agreementsLoading } = useLearningAgreements();
  const aiRecommendations = useAICourseRecommendations();

  const handleGetRecommendations = async () => {
    try {
      await aiRecommendations.mutateAsync({
        savedCourses: savedCourses || [],
        academicLevel: "Undergraduate",
      });
      toast.success("Recommendations generated!");
    } catch (error) {
      toast.error("Failed to get recommendations");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-primary/10 rounded-full">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Saved Courses</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="labs">Saved Labs</TabsTrigger>
            <TabsTrigger value="programs">Saved Programs</TabsTrigger>
            <TabsTrigger value="agreements">Learning Agreements</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Saved Courses ({savedCourses?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : savedCourses?.length === 0 ? (
                  <p className="text-muted-foreground">No saved courses yet</p>
                ) : (
                  <div className="space-y-3">
                    {savedCourses?.map((saved: any) => (
                      <Link
                        key={saved.id}
                        to={`/courses/${saved.course_id}`}
                        className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold">{saved.Courses?.name_course || 'Course'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {saved.Courses?.code && (
                                <Badge variant="secondary" className="text-xs">{saved.Courses.code}</Badge>
                              )}
                              {saved.Courses?.ects && (
                                <span className="text-xs text-muted-foreground">{saved.Courses.ects} ECTS</span>
                              )}
                              {saved.Courses?.ba_ma && (
                                <Badge variant="outline" className="text-xs">{saved.Courses.ba_ma === 'Ba' ? 'Bachelor' : 'Master'}</Badge>
                              )}
                            </div>
                            {saved.note && (
                              <p className="text-sm text-muted-foreground mt-2">{saved.note}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Course Recommendations
                  </CardTitle>
                  <Button 
                    onClick={handleGetRecommendations}
                    disabled={aiRecommendations.isPending}
                  >
                    {aiRecommendations.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Recommendations
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!aiRecommendations.data ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Get Recommendations" to discover courses tailored to your interests!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiRecommendations.data.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.skills?.map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5" />
                  Saved Labs ({savedLabs?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {labsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : savedLabs?.length === 0 ? (
                  <p className="text-muted-foreground">No saved labs yet</p>
                ) : (
                  <div className="space-y-3">
                    {savedLabs?.map((saved: any) => (
                      <Link
                        key={saved.id}
                        to={`/labs/${saved.Labs?.slug || saved.lab_id}`}
                        className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <p className="font-semibold">{saved.Labs?.name || 'Lab'}</p>
                        {saved.Labs?.topics && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {saved.Labs.topics.split(',').slice(0, 3).map((topic: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {topic.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {saved.note && (
                          <p className="text-sm text-muted-foreground mt-2">{saved.note}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Saved Programs ({savedPrograms?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {programsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : savedPrograms?.length === 0 ? (
                  <p className="text-muted-foreground">No saved programs yet</p>
                ) : (
                  <div className="space-y-3">
                    {savedPrograms?.map((saved: any) => (
                      <Link
                        key={saved.id}
                        to={`/programs/${saved.Programs?.slug || saved.id_program}`}
                        className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <p className="font-semibold">{saved.Programs?.name || 'Program'}</p>
                        {saved.Programs?.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {saved.Programs.description}
                          </p>
                        )}
                        {saved.note && (
                          <p className="text-sm text-muted-foreground mt-2 italic">{saved.note}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agreements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Learning Agreements ({agreements?.length || 0})
                </CardTitle>
                <Button onClick={() => navigate("/learning-agreements/new")}>
                  Create New
                </Button>
              </CardHeader>
              <CardContent>
                {agreementsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : agreements?.length === 0 ? (
                  <p className="text-muted-foreground">No learning agreements yet</p>
                ) : (
                  <div className="space-y-3">
                    {agreements?.map((agreement: any) => (
                      <Link
                        key={agreement.id}
                        to={`/learning-agreements/${agreement.id}`}
                        className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <h3 className="font-semibold">{agreement.title}</h3>
                        {agreement.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {agreement.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Type: {agreement.agreement_type} • Status: {agreement.status || "Draft"}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
