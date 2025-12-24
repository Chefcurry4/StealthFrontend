import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, BookOpen, GraduationCap, Microscope, Users, Globe, Star, Bookmark, MessageSquare, TrendingUp } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { usePrograms } from "@/hooks/usePrograms";
import { useLabs } from "@/hooks/useLabs";
import { useTeachers } from "@/hooks/useTeachers";
import { useUniversities } from "@/hooks/useUniversities";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

const Statistics = () => {
  const { data: courses } = useCourses({});
  const { data: programs } = usePrograms();
  const { data: labs } = useLabs();
  const { data: teachers } = useTeachers();
  const { data: universities } = useUniversities();

  // Fetch user-related stats
  const { data: userStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const [usersRes, reviewsRes, savedCoursesRes, savedLabsRes, savedProgramsRes] = await Promise.all([
        supabase.from("Users(US)").select("id", { count: "exact", head: true }),
        supabase.from("course_reviews").select("id, rating", { count: "exact" }),
        supabase.from("user_saved_courses(US-C)").select("id", { count: "exact", head: true }),
        supabase.from("user_saved_labs(US-L)").select("id", { count: "exact", head: true }),
        supabase.from("user_saved_programs(US-P)").select("id", { count: "exact", head: true }),
      ]);
      
      const reviews = reviewsRes.data || [];
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : "0";
      
      return {
        totalUsers: usersRes.count || 0,
        totalReviews: reviewsRes.count || 0,
        totalSavedCourses: savedCoursesRes.count || 0,
        totalSavedLabs: savedLabsRes.count || 0,
        totalSavedPrograms: savedProgramsRes.count || 0,
        avgRating,
      };
    },
  });

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

  // ECTS distribution
  const ectsStats = courses?.reduce((acc: Record<string, number>, course) => {
    const ects = course.ects || 0;
    if (ects <= 3) acc["1-3 ECTS"] = (acc["1-3 ECTS"] || 0) + 1;
    else if (ects <= 6) acc["4-6 ECTS"] = (acc["4-6 ECTS"] || 0) + 1;
    else if (ects <= 10) acc["7-10 ECTS"] = (acc["7-10 ECTS"] || 0) + 1;
    else acc["10+ ECTS"] = (acc["10+ ECTS"] || 0) + 1;
    return acc;
  }, {});

  const ectsDistribution = Object.entries(ectsStats || {}).sort(([a], [b]) => {
    const order = ["1-3 ECTS", "4-6 ECTS", "7-10 ECTS", "10+ ECTS"];
    return order.indexOf(a) - order.indexOf(b);
  });

  const topicStats: Record<string, number> = {};
  teachers?.forEach(teacher => {
    teacher.topics?.forEach(topic => {
      topicStats[topic] = (topicStats[topic] || 0) + 1;
    });
  });

  const topResearchTopics = Object.entries(topicStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Country distribution
  const countryStats = universities?.reduce((acc: Record<string, number>, uni) => {
    const country = uni.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  const countryDistribution = Object.entries(countryStats || {})
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="h-10 w-10" />
            Platform Statistics
          </h1>
          <p className="text-lg opacity-80">
            Comprehensive overview of academic resources and community activity
          </p>
        </div>

        {/* Academic Resources Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-2">
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 opacity-70" />
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses?.length || 0}</div>
              <p className="text-xs opacity-70 mt-1">
                {baCourses} Ba • {maCourses} Ma
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-2">
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
            <CardHeader className="pb-2">
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

        {/* Community Stats */}
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Community Activity
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 opacity-70" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
              <p className="text-xs opacity-70 mt-1">Registered members</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 opacity-70" />
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalReviews || 0}</div>
              <p className="text-xs opacity-70 mt-1">Course reviews</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 opacity-70" />
                Avg Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.avgRating || "0"}/5</div>
              <p className="text-xs opacity-70 mt-1">Average course rating</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bookmark className="h-4 w-4 opacity-70" />
                Saved Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalSavedCourses || 0}</div>
              <p className="text-xs opacity-70 mt-1">Bookmarked by users</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bookmark className="h-4 w-4 opacity-70" />
                Saved Labs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalSavedLabs || 0}</div>
              <p className="text-xs opacity-70 mt-1">Bookmarked by users</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Courses by Level */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle>Courses by Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Bachelor (Ba)</span>
                  <span className="text-sm opacity-70">{baCourses} ({((baCourses / (courses?.length || 1)) * 100).toFixed(0)}%)</span>
                </div>
                <Progress value={(baCourses / (courses?.length || 1)) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Master (Ma)</span>
                  <span className="text-sm opacity-70">{maCourses} ({((maCourses / (courses?.length || 1)) * 100).toFixed(0)}%)</span>
                </div>
                <Progress value={(maCourses / (courses?.length || 1)) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* ECTS Distribution */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle>ECTS Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ectsDistribution.map(([range, count]) => (
                <div key={range}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{range}</span>
                    <span className="text-sm opacity-70">{count}</span>
                  </div>
                  <Progress value={(count / (courses?.length || 1)) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Languages */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle>Courses by Language</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLanguages.map(([lang, count]) => (
                <div key={lang}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{lang}</span>
                    <span className="text-sm opacity-70">{count}</span>
                  </div>
                  <Progress value={(count / (courses?.length || 1)) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Courses by Term */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle>Courses by Term</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topTerms.map(([term, count]) => (
                <div key={term}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{term}</span>
                    <span className="text-sm opacity-70">{count}</span>
                  </div>
                  <Progress value={(count / (courses?.length || 1)) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Universities by Country */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Universities by Country
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {countryDistribution.map(([country, count]) => (
                <div key={country}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{country}</span>
                    <span className="text-sm opacity-70">{count}</span>
                  </div>
                  <Progress value={(count / (universities?.length || 1)) * 100} className="h-2" />
                </div>
              ))}
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
