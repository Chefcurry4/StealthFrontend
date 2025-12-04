import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, BookOpen, GraduationCap, Microscope, Users, Globe } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { usePrograms } from "@/hooks/usePrograms";
import { useLabs } from "@/hooks/useLabs";
import { useTeachers } from "@/hooks/useTeachers";
import { useUniversities } from "@/hooks/useUniversities";
import { Badge } from "@/components/ui/badge";

const Statistics = () => {
  const { data: courses } = useCourses({});
  const { data: programs } = usePrograms();
  const { data: labs } = useLabs();
  const { data: teachers } = useTeachers();
  const { data: universities } = useUniversities();

  const baCourses = courses?.filter(c => c.ba_ma === 'Ba').length || 0;
  const maCourses = courses?.filter(c => c.ba_ma === 'Ma').length || 0;
  
  const languageStats = courses?.reduce((acc: Record<string, number>, course) => {
    const lang = course.language || 'Unknown';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});
  
  const topLanguages = Object.entries(languageStats || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const termStats = courses?.reduce((acc: Record<string, number>, course) => {
    const term = course.term || 'Unknown';
    acc[term] = (acc[term] || 0) + 1;
    return acc;
  }, {});

  const topTerms = Object.entries(termStats || {})
    .sort(([, a], [, b]) => b - a);

  const topicStats: Record<string, number> = {};
  teachers?.forEach(teacher => {
    teacher.topics?.forEach(topic => {
      topicStats[topic] = (topicStats[topic] || 0) + 1;
    });
  });

  const topResearchTopics = Object.entries(topicStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="h-10 w-10" />
            Platform Statistics
          </h1>
          <p className="text-lg opacity-80">
            Comprehensive overview of academic resources across our partner network
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 opacity-70" />
                Universities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{universities?.length || 0}</div>
              <p className="text-xs opacity-70 mt-1">Partner institutions</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 opacity-70" />
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses?.length || 0}</div>
              <p className="text-xs opacity-70 mt-1">
                {baCourses} Bachelor • {maCourses} Master
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 opacity-70" />
                Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{programs?.length || 0}</div>
              <p className="text-xs opacity-70 mt-1">Academic programs</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Microscope className="h-4 w-4 opacity-70" />
                Research Labs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{labs?.length || 0}</div>
              <p className="text-xs opacity-70 mt-1">Active laboratories</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Courses by Level */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle>Courses by Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Bachelor (Ba)</span>
                    <span className="text-sm opacity-70">{baCourses}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/40" 
                      style={{ width: `${(baCourses / (courses?.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Master (Ma)</span>
                    <span className="text-sm opacity-70">{maCourses}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/60" 
                      style={{ width: `${(maCourses / (courses?.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Languages */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle>Courses by Language</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topLanguages.map(([lang, count]) => (
                  <div key={lang}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{lang}</span>
                      <span className="text-sm opacity-70">{count}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white/40" 
                        style={{ width: `${(count / (courses?.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Courses by Term */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle>Courses by Term</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTerms.map(([term, count]) => (
                  <div key={term}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{term}</span>
                      <span className="text-sm opacity-70">{count}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white/60" 
                        style={{ width: `${(count / (courses?.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Research Topics */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Research Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topResearchTopics.map(([topic, count]) => (
                  <Badge key={topic} variant="secondary" className="text-xs bg-white/20">
                    {topic} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;