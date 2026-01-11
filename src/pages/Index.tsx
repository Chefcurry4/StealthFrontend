import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, Microscope, Bot, UserPlus, BookMarked, Compass, ArrowRight, Sparkles, Search, FileText, Users, MessageSquare, Bookmark, Globe, Panda } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTour } from "@/contexts/TourContext";
import { useUniversities } from "@/hooks/useUniversities";
import { useCourses } from "@/hooks/useCourses";
import { useLabs } from "@/hooks/useLabs";
import { GlobalSearch } from "@/components/GlobalSearch";
import { SEO } from "@/components/SEO";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import noisyGradientBg from "@/assets/noisy-gradient-bg.webp";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogFeature, setAuthDialogFeature] = useState("");
  const { data: universities } = useUniversities();
  const { data: courses } = useCourses({});
  const { data: labs } = useLabs();
  
  const { startTour } = useTour();

  // Fetch platform stats using RPC function
  const { data: platformStats } = useQuery({
    queryKey: ["platform-stats-home"],
    queryFn: async () => {
      const [usersCountRes, courseReviewsRes, labReviewsRes, savedCoursesRes, savedLabsRes] = await Promise.all([
        supabase.rpc("get_public_user_count"),
        supabase.from("course_reviews").select("id", { count: "exact", head: true }),
        supabase.from("lab_reviews").select("id", { count: "exact", head: true }),
        supabase.from("user_saved_courses(US-C)").select("id", { count: "exact", head: true }),
        supabase.from("user_saved_labs(US-L)").select("id", { count: "exact", head: true }),
      ]);

      return {
        users: usersCountRes.data || 0,
        reviews: (courseReviewsRes.count || 0) + (labReviewsRes.count || 0),
        savedItems: (savedCoursesRes.count || 0) + (savedLabsRes.count || 0),
      };
    },
  });

  const hubs = [
    {
      icon: GraduationCap,
      title: "Universities",
      description: `1 partner university`,
      href: "/universities",
      color: "text-blue-500",
    },
    {
      icon: BookOpen,
      title: "Courses",
      description: `${courses?.length || 1420}+ courses available`,
      href: "/courses",
      color: "text-green-500",
    },
    {
      icon: Microscope,
      title: "Labs",
      description: `${labs?.length || 424} research labs`,
      href: "/labs",
      color: "text-purple-500",
    },
    {
      icon: Bot,
      title: "Workbench",
      description: "AI advisor & saved items",
      href: "/workbench",
      color: "text-orange-500",
      authRequired: true,
    },
    {
      icon: BookMarked,
      title: "My Diary",
      description: "Plan your semester",
      href: "/diary",
      color: "text-rose-500",
      authRequired: true,
    },
  ];

  const journeySteps = [
    {
      icon: Search,
      title: "Explore",
      description: "Browse courses, labs & universities",
      color: "text-blue-500 bg-blue-500/20",
    },
    {
      icon: BookOpen,
      title: "Interact",
      description: "Filter, save and exchange reviews",
      color: "text-green-500 bg-green-500/20",
    },
    {
      icon: Panda,
      title: "AI integration",
      description: "Get personalized recommendations on every university doubt",
      color: "text-orange-500 bg-orange-500/20",
    },
    {
      icon: FileText,
      title: "Plan",
      description: "Create your semester & contact labs",
      color: "text-rose-500 bg-rose-500/20",
    },
  ];

  const handleHubClick = (hub: typeof hubs[0]) => {
    if (hub.authRequired && !user) {
      setAuthDialogFeature(hub.title);
      setAuthDialogOpen(true);
    } else {
      navigate(hub.href);
    }
  };

  return (
    <>
      <SEO 
        description="Plan your international study semester with AI-powered course recommendations. Explore universities, discover courses, find research labs, and build learning agreements."
        keywords={["study at EPFL", "semester", "university courses", "EPFL courses", "EPFL AI advisor", "ETH courses"]}
      />
      <div className="min-h-screen flex flex-col">
      {/* Hero Section with Central Search */}
      <section className="relative flex-1 flex items-center justify-center py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl xs:text-3xl md:text-4xl lg:text-6xl font-bold mb-4">
              UniPandan
            </h1>
            <p className="text-lg md:text-xl opacity-80 mb-8">
              AI-powered guidance for students & universities
            </p>

            {/* Central Search */}
            <div className="max-w-2xl mx-auto mb-12">
              <GlobalSearch 
                variant="hero" 
                placeholder="Search universities, courses, labs, teachers..."
              />
            </div>

            {/* Auth Button for non-logged users */}
            {!user && (
              <Button size="lg" asChild className="theme-btn-primary backdrop-blur mb-12">
                <Link to="/auth">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
            )}

            {/* Beta notice */}
            <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center max-w-2xl mx-auto">
              <p className="text-sm text-foreground">
                <strong>Beta Version:</strong> This is the Beta version of UniPandan. For now only EPFL is covered, but more universities and features to come in next versions (ETHZ is loading...)!
              </p>
            </div>

            {/* Navigation Hubs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {hubs.map((hub) => {
                const Icon = hub.icon;
                return (
                  <div 
                    key={hub.title} 
                    onClick={() => handleHubClick(hub)}
                    className="cursor-pointer"
                  >
                    <Card className="backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-lg h-full">
                      <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 bg-primary/10 ${hub.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold mb-1">{hub.title}</h3>
                        <p className="text-xs opacity-70">{hub.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      <RecentlyViewed />

      {/* How It Works Section - Redesigned with noisy gradient background */}
      <section className="py-12 relative overflow-hidden">
        {/* Noisy gradient background image with theme overlays */}
        <div className="absolute inset-0 -z-10">
          <img 
            src={noisyGradientBg} 
            alt="" 
            className="w-full h-full object-cover opacity-30 dark:opacity-20"
          />
          {/* Theme-coherent overlay for light/dark mode */}
          <div className="absolute inset-0 bg-background/70 dark:bg-background/80" />
          {/* Additional gradient blend for smoothness */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>

        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              How does UniPandax work?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your journey to the perfect semester
            </p>
          </div>

          {/* Compact Journey Steps */}
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={step.title}
                    className="group relative"
                  >
                    <div className="h-full p-3 rounded-xl bg-background/60 backdrop-blur-md border border-border/50 transition-all hover:shadow-lg hover:scale-[1.02] hover:bg-background/80">
                      {/* Step number badge */}
                      <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
                        {index + 1}
                      </div>

                      <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center mb-2`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <h3 className="font-semibold text-sm mb-0.5">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-tight">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Glass Tour Button */}
          <div className="mt-8 text-center">
            <Button 
              onClick={startTour}
              size="lg"
              className="bg-background/60 backdrop-blur-xl border border-primary/30 text-foreground hover:bg-background/80 hover:border-primary/50 shadow-lg hover:shadow-xl transition-all group"
            >
              <Compass className="h-5 w-5 mr-2 text-primary group-hover:rotate-45 transition-transform" />
              Take Interactive Tour
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform text-primary" />
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Statistics Section */}
      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Platform Overview
            </h2>
            <p className="text-muted-foreground">
              Real-time statistics from our community
            </p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-2.5 md:p-4 text-center">
                <Users className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-xl md:text-2xl font-bold">{platformStats?.users || 0}</div>
                <p className="text-[11px] md:text-xs text-muted-foreground">Users</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-2.5 md:p-4 text-center">
                <MessageSquare className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-2 text-green-500" />
                <div className="text-xl md:text-2xl font-bold">{platformStats?.reviews || 0}</div>
                <p className="text-[11px] md:text-xs text-muted-foreground">Reviews</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-2.5 md:p-4 text-center">
                <Bookmark className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-xl md:text-2xl font-bold">{platformStats?.savedItems || 0}</div>
                <p className="text-[11px] md:text-xs text-muted-foreground">Bookmarks</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-2.5 md:p-4 text-center">
                <BookOpen className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-2 text-emerald-500" />
                <div className="text-xl md:text-2xl font-bold">{courses?.length || 0}+</div>
                <p className="text-[11px] md:text-xs text-muted-foreground">Courses</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-2.5 md:p-4 text-center">
                <Microscope className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-xl md:text-2xl font-bold">{labs?.length || 0}</div>
                <p className="text-[11px] md:text-xs text-muted-foreground">Labs</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-2.5 md:p-4 text-center">
                <Globe className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-2 text-rose-500" />
                <div className="text-xl md:text-2xl font-bold">1</div>
                <p className="text-[11px] md:text-xs text-muted-foreground">Unis</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>

    <AuthRequiredDialog 
      open={authDialogOpen} 
      onOpenChange={setAuthDialogOpen}
      feature={authDialogFeature}
    />
    </>
  );
};

export default Index;
