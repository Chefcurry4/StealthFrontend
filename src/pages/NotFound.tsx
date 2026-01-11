import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, GraduationCap, BookOpen, FlaskConical, Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();
  const { modeConfig } = useBackgroundTheme();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const suggestedLinks = [
    { icon: Home, label: "Home", href: "/", description: "Back to homepage" },
    { icon: GraduationCap, label: "Universities", href: "/universities", description: "Browse universities" },
    { icon: BookOpen, label: "Courses", href: "/courses", description: "Explore courses" },
    { icon: FlaskConical, label: "Labs", href: "/labs", description: "Discover research labs" },
  ];

  return (
    <>
      <SEO
        title="Page Not Found | UniPandan"
        description="The page you're looking for doesn't exist. Find universities, courses, and research labs on UniPandan."
      />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Display */}
          <div className="space-y-4">
            <div 
              className="text-[120px] sm:text-[160px] font-bold leading-none tracking-tighter opacity-20"
              style={{ color: modeConfig.textColor }}
            >
              404
            </div>
            <div className="space-y-2 -mt-8">
              <h1 
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: modeConfig.textColor }}
              >
                Page not found
              </h1>
              <p 
                className="text-base sm:text-lg opacity-70 max-w-md mx-auto"
                style={{ color: modeConfig.textColor }}
              >
                The page you're looking for doesn't exist or has been moved. 
                Try searching or explore the links below.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <GlobalSearch 
              variant="hero" 
              placeholder="Search for universities, courses, labs..."
            />
          </div>

          {/* Suggested Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            {suggestedLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: `${modeConfig.textColor}10`,
                  color: modeConfig.textColor,
                }}
              >
                <link.icon className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Back Button */}
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
              style={{
                borderColor: `${modeConfig.textColor}30`,
                color: modeConfig.textColor,
                background: `${modeConfig.textColor}05`,
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Button>
          </div>

          {/* Lost explorer illustration */}
          <div 
            className="flex items-center justify-center gap-2 text-sm opacity-50 pt-8"
            style={{ color: modeConfig.textColor }}
          >
            <Compass className="h-4 w-4 animate-pulse" />
            <span>Lost? We'll help you find your way.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
