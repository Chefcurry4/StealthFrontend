import { Link } from "react-router-dom";
import { useSavedCourses, useSavedLabs } from "@/hooks/useSavedItems";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FlaskConical, ExternalLink, Bot } from "lucide-react";
import { Loader } from "@/components/Loader";

export const WorkbenchSavedItems = () => {
  const { data: savedCourses, isLoading: loadingCourses } = useSavedCourses();
  const { data: savedLabs, isLoading: loadingLabs } = useSavedLabs();

  const isLoading = loadingCourses || loadingLabs;

  if (isLoading) {
    return <Loader />;
  }

  const totalSaved = (savedCourses?.length || 0) + (savedLabs?.length || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Saved Items</h3>
          <Badge variant="secondary">{totalSaved} total</Badge>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to="/workbench">
            <Bot className="h-4 w-4" />
            Open Workbench
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses ({savedCourses?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="labs" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Labs ({savedLabs?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4">
          {savedCourses?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No saved courses yet</p>
          ) : (
            <div className="grid gap-3">
              {savedCourses?.map((item: any) => (
                <Card key={item.id} className="bg-card/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.Courses?.name_course}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {item.Courses?.ects && (
                          <Badge variant="outline">{item.Courses.ects} ECTS</Badge>
                        )}
                        {item.Courses?.ba_ma && (
                          <Badge variant="secondary">{item.Courses.ba_ma}</Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/courses/${item.course_id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="labs" className="mt-4">
          {savedLabs?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No saved labs yet</p>
          ) : (
            <div className="grid gap-3">
              {savedLabs?.map((item: any) => (
                <Card key={item.id} className="bg-card/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.Labs?.name}</h4>
                      {item.Labs?.topics && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {item.Labs.topics}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/labs/${item.Labs?.slug || item.lab_id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
