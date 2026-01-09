import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap, User, LogOut, Briefcase, Sun, Moon, Search, Bookmark, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { useSectionNavigation } from "@/contexts/SectionNavigationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { GlobalSearch } from "@/components/GlobalSearch";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogFeature, setAuthDialogFeature] = useState("");
  const { user, signOut } = useAuth();
  const { mode, modeConfig, toggleMode } = useBackgroundTheme();
  const { getNavigationTarget, hasNestedRoute, hasWorkbenchState } = useSectionNavigation();
  const { data: profile } = useUserProfile();
  const navigate = useNavigate();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Universities", href: "/universities" },
    { name: "Courses", href: "/courses" },
    { name: "Labs", href: "/labs" },
  ];

  const userNavigation = [
    { name: "Workbench", href: "/workbench", icon: Briefcase },
    { name: "Diary", href: "/diary", icon: Book },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // In-session section restore: navigate to last visited route in section
  const handleSectionNavClick = (sectionRoot: string) => {
    const target = getNavigationTarget(sectionRoot);
    navigate(target);
  };

  const handleProtectedNavClick = (name: string, sectionRoot: string) => {
    if (user) {
      const target = getNavigationTarget(sectionRoot);
      navigate(target);
    } else {
      setAuthDialogFeature(name);
      setAuthDialogOpen(true);
    }
  };

  const userInitial = profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

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
        {/* Logo - always goes to root "/" */}
        <button 
          onClick={() => handleSectionNavClick("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <GraduationCap className="h-4 w-8" />
          <span className="text-xl font-bold">Student Hub</span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleSectionNavClick(item.href)}
              className="relative text-sm font-medium opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            >
              {item.name}
              {hasNestedRoute(item.href) && (
                <span 
                  className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-current opacity-60"
                  title="You'll return to a subpage"
                />
              )}
            </button>
          ))}
          {userNavigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleProtectedNavClick(item.name, item.href)}
              className="relative text-sm font-medium opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {(hasNestedRoute(item.href) || (item.href === '/workbench' && hasWorkbenchState())) && (
                <span 
                  className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-current opacity-60"
                  title="You'll return to a subpage"
                />
              )}
            </button>
          ))}
          
          {/* Global Search */}
          <GlobalSearch className="w-48 lg:w-64" />
          
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
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile?.profile_photo_url || ""} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-md">
                <DropdownMenuItem onClick={() => handleSectionNavClick("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile?section=saved")}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Saved Items
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
          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="rounded-full"
            style={{ 
              background: modeConfig.ui.buttonSecondary,
              color: modeConfig.ui.buttonSecondaryText
            }}
          >
            <Search className="h-4 w-4" />
          </Button>

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

      {/* Mobile Search Bar */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
        )}
        style={{
          maxHeight: mobileSearchOpen ? '80px' : '0',
          opacity: mobileSearchOpen ? 1 : 0,
        }}
      >
        <div 
          className="container mx-auto px-4 py-3"
          style={{ background: modeConfig.ui.cardBackground }}
        >
          <GlobalSearch 
            className="w-full" 
            placeholder="Search..."
          />
        </div>
      </div>

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
            <button
              key={item.name}
              className="relative text-base font-medium opacity-70 hover:opacity-100 transition-opacity py-4 px-4 min-h-[56px] rounded-lg active:scale-[0.97] active:bg-primary/10 w-full text-left flex items-center justify-between touch-manipulation"
              style={{ color: modeConfig.textColor }}
              onClick={() => {
                setMobileMenuOpen(false);
                handleSectionNavClick(item.href);
              }}
            >
              {item.name}
              {hasNestedRoute(item.href) && (
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
                  title="You'll return to a subpage"
                />
              )}
            </button>
          ))}
          <div style={{ borderTopColor: modeConfig.ui.cardBorder }} className="border-t my-2" />
          {userNavigation.map((item) => (
            <button
              key={item.name}
              className="relative text-base font-medium opacity-70 hover:opacity-100 transition-opacity flex items-center gap-2 py-4 px-4 min-h-[56px] rounded-lg active:scale-[0.97] active:bg-primary/10 w-full text-left touch-manipulation"
              style={{ color: modeConfig.textColor }}
              onClick={() => {
                setMobileMenuOpen(false);
                handleProtectedNavClick(item.name, item.href);
              }}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {(hasNestedRoute(item.href) || (item.href === '/workbench' && hasWorkbenchState())) && (
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
                  title="You'll return to a subpage"
                />
              )}
            </button>
          ))}
          <div style={{ borderTopColor: modeConfig.ui.cardBorder }} className="border-t my-2" />
          {user ? (
            <>
              <Button 
                variant="outline" 
                size="default" 
                className="w-full mb-2 active:scale-95"
                style={{ 
                  background: modeConfig.ui.buttonSecondary,
                  borderColor: modeConfig.ui.cardBorder,
                  color: modeConfig.ui.buttonSecondaryText
                }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSectionNavClick("/profile");
                }}
              >
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarImage src={profile?.profile_photo_url || ""} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                My Profile
              </Button>
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

      <AuthRequiredDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        feature={authDialogFeature}
      />
    </header>
  );
};
