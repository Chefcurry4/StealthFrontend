import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, BookOpen, GraduationCap, Microscope, Users, Globe, Star, Bookmark, MessageSquare, TrendingUp, Calendar } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { usePrograms } from "@/hooks/usePrograms";
import { useLabs } from "@/hooks/useLabs";
import { useTeachers } from "@/hooks/useTeachers";
import { useUniversities } from "@/hooks/useUniversities";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const Statistics = () => {
  const { data: courses } = useCourses({});
  const { data: programs } = usePrograms();
  const { data: labs } = useLabs();
  const { data: teachers } = useTeachers();
  const { data: universities } = useUniversities();

  // Fetch user-related stats with signup timeline
  const { data: userStats } = useQuery({
    queryKey: ["user-stats-enhanced"],
    queryFn: async () => {
      const [usersRes, reviewsRes, savedCoursesRes, savedLabsRes, usersTimelineRes] = await Promise.all([
        supabase.from("Users(US)").select("id", { count: "exact", head: true }),
        supabase.from("course_reviews").select("id, rating", { count: "exact" }),
        supabase.from("user_saved_courses(US-C)").select("id", { count: "exact", head: true }),
        supabase.from("user_saved_labs(US-L)").select("id", { count: "exact", head: true }),
        supabase.from("Users(US)").select("created_at"),
      ]);
      
      const reviews = reviewsRes.data || [];
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : "0";
      
      // Group users by month for timeline
      const usersTimeline: Record<string, number> = {};
      const now = new Date();
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const key = format(monthDate, 'MMM yyyy');
        usersTimeline[key] = 0;
      }
      
      // Count users per month
      (usersTimelineRes.data || []).forEach(user => {
        const date = new Date(user.created_at);
        const key = format(date, 'MMM yyyy');
        if (usersTimeline.hasOwnProperty(key)) {
          usersTimeline[key]++;
        }
      });
      
      const timelineData = Object.entries(usersTimeline).map(([month, count]) => ({
        month,
        users: count,
      }));
      
      return {
        totalUsers: usersRes.count || 0,
        totalReviews: reviewsRes.count || 0,
        totalSavedCourses: savedCoursesRes.count || 0,
        totalSavedLabs: savedLabsRes.count || 0,
        totalSavedPrograms: 0, // Table doesn't exist yet
        avgRating,
        timelineData,
      };
    },
  });

  // Course stats
  const baCourses = courses?.filter(c => c.ba_ma === "Bachelor's").length || 0;
  const maCourses = courses?.filter(c => c.ba_ma === "Master's").length || 0;
  const totalCourses = courses?.length || 1;
  
  // Language distribution for pie chart
  const languageStats = courses?.reduce((acc: Record<string, number>, course) => {
    const lang = course.language || 'Unknown';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {}) || {};
  
  const languagePieData = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Term distribution for bar chart
  const termStats = courses?.reduce((acc: Record<string, number>, course) => {
    const term = course.term || 'Unknown';
    acc[term] = (acc[term] || 0) + 1;
    return acc;
  }, {}) || {};

  const termBarData = Object.entries(termStats)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));

  // ECTS distribution
  const ectsStats = courses?.reduce((acc: Record<string, number>, course) => {
    const ects = course.ects || 0;
    if (ects <= 3) acc["1-3 ECTS"] = (acc["1-3 ECTS"] || 0) + 1;
    else if (ects <= 6) acc["4-6 ECTS"] = (acc["4-6 ECTS"] || 0) + 1;
    else if (ects <= 10) acc["7-10 ECTS"] = (acc["7-10 ECTS"] || 0) + 1;
    else acc["10+ ECTS"] = (acc["10+ ECTS"] || 0) + 1;
    return acc;
  }, {}) || {};

  const ectsPieData = Object.entries(ectsStats)
    .map(([name, value]) => ({ name, value }));

  // Bachelor/Master pie data
  const levelPieData = [
    { name: 'Bachelor', value: baCourses },
    { name: 'Master', value: maCourses },
  ].filter(d => d.value > 0);

  // Top research topics
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
  }, {}) || {};

  const countryDistribution = Object.entries(countryStats)
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

        {/* User Signups Timeline Chart */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              User Signups Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userStats?.timelineData || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="New Users"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Course Level Distribution Pie */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Courses by Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={levelPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {levelPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                  Bachelor: {baCourses}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                  Master: {maCourses}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Language Distribution Pie */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Courses by Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languagePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name.substring(0, 3)} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {languagePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2 text-xs">
                {languagePieData.map((item, index) => (
                  <span key={item.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {item.name}: {item.value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ECTS Distribution Pie */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                ECTS Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ectsPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name.replace(' ECTS', '')} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {ectsPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2 text-xs">
                {ectsPieData.map((item, index) => (
                  <span key={item.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {item.name}: {item.value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses by Term Bar Chart */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Courses by Term
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={termBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" name="Courses" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
