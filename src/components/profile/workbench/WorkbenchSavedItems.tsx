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
      {/* Header - responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base sm:text-lg font-semibold">Saved Items</h3>
          <Badge variant="secondary" className="text-xs">{totalSaved} total</Badge>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
          <Link to="/workbench">
            <Bot className="h-4 w-4" />
            Open Workbench
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="courses" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Courses ({savedCourses?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="labs" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
            <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Labs ({savedLabs?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-3 sm:mt-4">
          {savedCourses?.length === 0 ? (
            <p className="text-muted-foreground text-center py-6 text-sm">No saved courses yet</p>
          ) : (
            <div className="grid gap-2 sm:gap-3">
              {savedCourses?.map((item: any) => (
                <Card key={item.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-3 sm:p-4 flex items-start sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base leading-tight line-clamp-2 sm:truncate">
                        {item.Courses?.name_course}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {item.Courses?.code && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
                            {item.Courses.code}
                          </Badge>
                        )}
                        {item.Courses?.ects && (
                          <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                            {item.Courses.ects} ECTS
                          </Badge>
                        )}
                        {item.Courses?.ba_ma && (
                          <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                            {item.Courses.ba_ma}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
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

        <TabsContent value="labs" className="mt-3 sm:mt-4">
          {savedLabs?.length === 0 ? (
            <p className="text-muted-foreground text-center py-6 text-sm">No saved labs yet</p>
          ) : (
            <div className="grid gap-2 sm:gap-3">
              {savedLabs?.map((item: any) => (
                <Card key={item.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-3 sm:p-4 flex items-start sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base leading-tight line-clamp-2 sm:truncate">
                        {item.Labs?.name}
                      </h4>
                      {item.Labs?.slug && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 mt-1">
                          {item.Labs.slug}
                        </Badge>
                      )}
                      {item.Labs?.topics && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {item.Labs.topics}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
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
