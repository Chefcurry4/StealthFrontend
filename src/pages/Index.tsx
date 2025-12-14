import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, Microscope, Bot, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversities } from "@/hooks/useUniversities";
import { useCourses } from "@/hooks/useCourses";
import { useLabs } from "@/hooks/useLabs";
import { GlobalSearch } from "@/components/GlobalSearch";

const Index = () => {
  const { user } = useAuth();
  const { data: universities } = useUniversities();
  const { data: courses } = useCourses({});
  const { data: labs } = useLabs();

  const hubs = [
    {
      icon: GraduationCap,
      title: "Universities",
      description: `${universities?.length || 12} partner universities`,
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
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Central Search */}
      <section className="relative flex-1 flex items-center justify-center py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Students Hub
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

            {/* Navigation Hubs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {hubs.map((hub) => {
                const Icon = hub.icon;
                return (
                  <Link key={hub.title} to={hub.href}>
                    <Card className="backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-lg h-full">
                      <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 bg-primary/10 ${hub.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold mb-1">{hub.title}</h3>
                        <p className="text-xs opacity-70">{hub.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 backdrop-blur-sm theme-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Browse", description: "Explore universities & programs" },
              { step: "2", title: "Discover", description: "Find courses & labs" },
              { step: "3", title: "Build", description: "Create learning agreements" },
              { step: "4", title: "Get Guidance", description: "AI-powered recommendations" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 backdrop-blur rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 theme-badge">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-xs opacity-80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;