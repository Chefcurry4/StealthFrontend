import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap, User, LogOut, Bot, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
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
    <header className="sticky top-0 z-50 w-full border-b border-white/20 backdrop-blur-md bg-white/10">
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
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border-white/20">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-md bg-white/90">
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
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 border-white/20">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all active:scale-95"
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
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/20",
          mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-1 backdrop-blur-md bg-white/10">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-base font-medium opacity-70 hover:opacity-100 transition-opacity py-3 px-2 rounded-lg hover:bg-white/10 active:scale-98"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {user && (
            <div className="border-t border-white/20 my-2" />
          )}
          {user && userNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-base font-medium opacity-70 hover:opacity-100 transition-opacity flex items-center gap-2 py-3 px-2 rounded-lg hover:bg-white/10 active:scale-98"
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
          <div className="border-t border-white/20 my-2" />
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="default" className="w-full mb-2 active:scale-95 bg-white/10 border-white/20 hover:bg-white/20">
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
              </Link>
              <Button variant="secondary" size="default" className="w-full active:scale-95 bg-white/20 hover:bg-white/30" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="default" className="w-full active:scale-95 bg-white/20 hover:bg-white/30">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};