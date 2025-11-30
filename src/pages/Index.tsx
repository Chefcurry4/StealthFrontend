import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientBackground } from "@/components/GradientBackground";
import { GraduationCap, BookOpen, Microscope, Bot, FileText, ArrowRight, UserPlus, BarChart3 } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversities } from "@/hooks/useUniversities";
import { useCourses } from "@/hooks/useCourses";
import { usePrograms } from "@/hooks/usePrograms";
import { useLabs } from "@/hooks/useLabs";

const Index = () => {
  const { user } = useAuth();
  const { data: universities } = useUniversities();
  const { data: courses } = useCourses({});
  const { data: programs } = usePrograms();
  const { data: labs } = useLabs();
  
  const features = [
    {
      icon: GraduationCap,
      title: "Global University Network",
      description: "Access 100+ partner universities across Europe and worldwide",
    },
    {
      icon: BookOpen,
      title: `${courses?.length || 1420}+ Courses`,
      description: "Comprehensive course catalog with detailed information and reviews",
    },
    {
      icon: Microscope,
      title: "Research Labs",
      description: `Explore ${labs?.length || 424} cutting-edge research facilities and opportunities`,
    },
    {
      icon: BarChart3,
      title: "Data & Statistics",
      description: "View comprehensive statistics and insights about all academic resources",
    },
    {
      icon: Bot,
      title: "AI Study Advisor",
      description: "Get personalized course recommendations and planning guidance",
    },
    {
      icon: FileText,
      title: "Learning Agreement Builder",
      description: "Create and manage your study abroad agreements effortlessly",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <GradientBackground variant="aurora">
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0 opacity-10">
            <img 
              src={heroImage} 
              alt="Students collaborating" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Plan Your International Study Semester
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Discover universities, explore courses, and build your learning agreement with AI-powered guidance
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user && (
                  <Button size="lg" asChild>
                    <Link to="/auth">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Get Started Free
                    </Link>
                  </Button>
                )}
                <Button size="lg" variant={user ? "default" : "outline"} asChild>
                  <Link to="/universities">
                    Browse Universities
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/courses">Explore Courses</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </GradientBackground>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Study Planning
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse {universities?.length || 12} universities, {courses?.length || 1420} courses, {programs?.length || 33} programs, and {labs?.length || 424} research labs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to plan your perfect exchange semester
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: "1", title: "Browse Universities", description: "Explore partner universities and their programs" },
              { step: "2", title: "Find Courses", description: "Search and filter courses that match your interests" },
              { step: "3", title: "Build Agreement", description: "Create your learning agreement with selected courses" },
              { step: "4", title: "Get AI Guidance", description: "Consult our AI advisor for personalized recommendations" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Planning?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students who have successfully planned their exchange semesters with Students Hub
          </p>
          <Button size="lg" variant="secondary">
            Create Free Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
