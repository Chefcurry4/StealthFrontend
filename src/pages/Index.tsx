import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, Microscope, Bot, UserPlus, BookMarked, Compass, ArrowRight, Sparkles, Search, FileText, Mail, Users, MessageSquare, Bookmark, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversities } from "@/hooks/useUniversities";
import { useCourses } from "@/hooks/useCourses";
import { useLabs } from "@/hooks/useLabs";
import { GlobalSearch } from "@/components/GlobalSearch";
import { SEO } from "@/components/SEO";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { useGuide } from "@/hooks/useGuide";
import { WebsiteGuide } from "@/components/guide/WebsiteGuide";
import { GuidePromptDialog } from "@/components/guide/GuidePromptDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogFeature, setAuthDialogFeature] = useState("");
  const { data: universities } = useUniversities();
  const { data: courses } = useCourses({});
  const { data: labs } = useLabs();
  
  const {
    showPrompt,
    showGuide,
    startGuide,
    closePrompt,
    closeGuide,
    completeGuide,
    openGuide,
  } = useGuide();

  // Fetch platform stats
  const { data: platformStats } = useQuery({
    queryKey: ["platform-stats-home"],
    queryFn: async () => {
      const [usersRes, courseReviewsRes, labReviewsRes, savedCoursesRes, savedLabsRes] = await Promise.all([
        supabase.from("Users(US)").select("id", { count: "exact", head: true }),
        supabase.from("course_reviews").select("id", { count: "exact", head: true }),
        supabase.from("lab_reviews").select("id", { count: "exact", head: true }),
        supabase.from("user_saved_courses(US-C)").select("id", { count: "exact", head: true }),
        supabase.from("user_saved_labs(US-L)").select("id", { count: "exact", head: true }),
      ]);

      return {
        users: usersRes.count || 0,
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
      description: "Browse universities, courses, and labs",
      details: "Use our powerful search to find exactly what you need across 12+ universities and 1400+ courses.",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: BookOpen,
      title: "Discover",
      description: "Find courses that match your interests",
      details: "Filter by topic, read student reviews, and compare options to build your perfect course list.",
      color: "bg-green-500/10 text-green-500",
    },
    {
      icon: Sparkles,
      title: "Get AI Help",
      description: "Personalized recommendations",
      details: "Our AI advisor understands your goals and suggests the best courses, labs, and opportunities.",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      icon: FileText,
      title: "Plan",
      description: "Organize your semester",
      details: "Use the diary to visually plan your courses, track lab communications, and stay organized.",
      color: "bg-rose-500/10 text-rose-500",
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
        keywords={["study abroad", "exchange semester", "university courses", "learning agreement", "AI advisor"]}
      />
      <div className="min-h-screen flex flex-col">
      {/* Hero Section with Central Search */}
      <section className="relative flex-1 flex items-center justify-center py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Student Hub
            </h1>
            <p className="text-lg md:text-xl opacity-80 mb-8">
              Plan your international study semester with AI-powered guidance
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
                <strong>Beta Version:</strong> This is the Beta version of Student Hub. For now only EPFL is covered, but more universities and features to come in next versions!
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

      {/* How It Works Section - Enhanced */}
      <section className="py-16 backdrop-blur-sm theme-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Your journey to the perfect exchange semester in four simple steps
            </p>
            <Button 
              onClick={openGuide}
              variant="outline"
              className="group"
            >
              <Compass className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform" />
              Take the Interactive Tour
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Journey Steps */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={step.title}
                    className="group relative"
                  >
                    {/* Connector line */}
                    {index < journeySteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-border to-transparent" />
                    )}
                    
                    <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] backdrop-blur-md">
                      <CardContent className="p-6">
                        {/* Step number */}
                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                          {index + 1}
                        </div>

                        <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                          <Icon className="h-7 w-7" />
                        </div>

                        <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                        <p className="text-sm font-medium text-foreground mb-2">{step.description}</p>
                        <p className="text-xs text-muted-foreground">{step.details}</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature highlights */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: GraduationCap, label: "12+ Universities", color: "text-blue-500" },
              { icon: BookOpen, label: "1400+ Courses", color: "text-green-500" },
              { icon: Microscope, label: "400+ Labs", color: "text-purple-500" },
              { icon: Mail, label: "AI Email Composer", color: "text-orange-500" },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.label} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 backdrop-blur">
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              );
            })}
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{platformStats?.users || 0}</div>
                <p className="text-xs text-muted-foreground">Users</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{platformStats?.reviews || 0}</div>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-4 text-center">
                <Bookmark className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{platformStats?.savedItems || 0}</div>
                <p className="text-xs text-muted-foreground">Saved Items</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                <div className="text-2xl font-bold">{courses?.length || 0}+</div>
                <p className="text-xs text-muted-foreground">Courses</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-4 text-center">
                <Microscope className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{labs?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Labs</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/50 border-border/50">
              <CardContent className="p-4 text-center">
                <Globe className="h-6 w-6 mx-auto mb-2 text-rose-500" />
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Universities</p>
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

    {/* Guide Components */}
    <GuidePromptDialog
      isOpen={showPrompt}
      onClose={closePrompt}
      onStartGuide={startGuide}
    />
    <WebsiteGuide
      isOpen={showGuide}
      onClose={closeGuide}
      onComplete={completeGuide}
    />
    </>
  );
};

export default Index;
