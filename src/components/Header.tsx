import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap, User, LogOut, Bot, Mail, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { mode, modeConfig, toggleMode } = useBackgroundTheme();
  const navigate = useNavigate();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Universities", href: "/universities" },
    { name: "Programs", href: "/programs" },
    { name: "Courses", href: "/courses" },
    { name: "Teachers", href: "/teachers" },
    { name: "Labs", href: "/labs" },
  ];

  const userNavigation = [
    { name: "AI Advisor", href: "/ai-advisor", icon: Bot },
    { name: "Email Drafts", href: "/email-drafts", icon: Mail },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md"
      style={{ 
        borderColor: modeConfig.ui.cardBorder,
        backgroundColor: modeConfig.ui.cardBackground,
        color: modeConfig.textColor
      }}
    >
      <nav className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          <span className="text-xl font-bold">Students Hub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
            >
              {item.name}
            </Link>
          ))}
          {user && userNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
          
          {/* Day/Night Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMode}
            className="rounded-full"
            style={{ 
              background: modeConfig.ui.buttonSecondary,
              color: modeConfig.ui.buttonSecondaryText
            }}
          >
            {mode === 'day' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex items-center gap-2"
                  style={{ 
                    background: modeConfig.ui.buttonSecondary,
                    color: modeConfig.ui.buttonSecondaryText
                  }}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-md">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button 
                variant="secondary" 
                size="sm"
                style={{ 
                  background: modeConfig.ui.buttonPrimary,
                  color: modeConfig.ui.buttonPrimaryText
                }}
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {/* Day/Night Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMode}
            className="rounded-full"
            style={{ 
              background: modeConfig.ui.buttonSecondary,
              color: modeConfig.ui.buttonSecondaryText
            }}
          >
            {mode === 'day' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          
          <button
            className="rounded-lg p-3 transition-all active:scale-95"
            style={{ 
              background: modeConfig.ui.buttonSecondary,
              color: modeConfig.ui.buttonSecondaryText
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t",
        )}
        style={{
          maxHeight: mobileMenuOpen ? '100vh' : '0',
          opacity: mobileMenuOpen ? 1 : 0,
          borderColor: modeConfig.ui.cardBorder
        }}
      >
        <div 
          className="container mx-auto px-4 py-4 flex flex-col gap-1 backdrop-blur-md"
          style={{ background: modeConfig.ui.cardBackground }}
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-base font-medium opacity-70 hover:opacity-100 transition-opacity py-3 px-2 rounded-lg active:scale-98"
              style={{ color: modeConfig.textColor }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {user && (
            <div style={{ borderTopColor: modeConfig.ui.cardBorder }} className="border-t my-2" />
          )}
          {user && userNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-base font-medium opacity-70 hover:opacity-100 transition-opacity flex items-center gap-2 py-3 px-2 rounded-lg active:scale-98"
              style={{ color: modeConfig.textColor }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
          <div style={{ borderTopColor: modeConfig.ui.cardBorder }} className="border-t my-2" />
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button 
                  variant="outline" 
                  size="default" 
                  className="w-full mb-2 active:scale-95"
                  style={{ 
                    background: modeConfig.ui.buttonSecondary,
                    borderColor: modeConfig.ui.cardBorder,
                    color: modeConfig.ui.buttonSecondaryText
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
              </Link>
              <Button 
                variant="secondary" 
                size="default" 
                className="w-full active:scale-95"
                style={{ 
                  background: modeConfig.ui.buttonPrimary,
                  color: modeConfig.ui.buttonPrimaryText
                }}
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant="secondary" 
                size="default" 
                className="w-full active:scale-95"
                style={{ 
                  background: modeConfig.ui.buttonPrimary,
                  color: modeConfig.ui.buttonPrimaryText
                }}
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
