import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { useProfilePictureUpload } from "@/hooks/useProfilePicture";
import { useUniversities } from "@/hooks/useUniversities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "@/components/Loader";
import { PreferencesSettings } from "@/components/profile/PreferencesSettings";
import UserFlashcard, { FlashcardColorStyle } from "@/components/UserFlashcard";
import {
  WorkbenchSavedItems,
  WorkbenchDocuments,
  WorkbenchAIHistory,
  WorkbenchEmailDrafts,
  WorkbenchLearningAgreements,
  WorkbenchActivity,
  WorkbenchDiaryPages,
} from "@/components/profile/workbench";
import { 
  User, 
  AlertTriangle, 
  Calendar,
  MapPin,
  Edit,
  BookOpen,
  FileText,
  MessageSquare,
  Mail,
  FileCheck,
  Activity,
  GraduationCap,
  Book,
  Building,
  X,
  Check,
  Settings,
  Palette,
  Trash2,
  LogOut,
  Heart
} from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type SectionId = 
  | "profile" 
  | "saved" 
  | "diary" 
  | "documents" 
  | "ai-history" 
  | "drafts" 
  | "agreements" 
  | "activity" 
  | "preferences" 
  | "appearance" 
  | "account";

interface NavSection {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  group: "personal" | "workbench" | "settings";
}

const navSections: NavSection[] = [
  // Personal
  { id: "profile", label: "Profile", icon: User, group: "personal" },
  // Workbench
  { id: "saved", label: "Saved Items", icon: Heart, group: "workbench" },
  { id: "diary", label: "Diary Pages", icon: Book, group: "workbench" },
  { id: "documents", label: "Documents", icon: FileText, group: "workbench" },
  { id: "ai-history", label: "AI Chats", icon: MessageSquare, group: "workbench" },
  { id: "drafts", label: "Email Drafts", icon: Mail, group: "workbench" },
  { id: "agreements", label: "Learning Agreements", icon: FileCheck, group: "workbench" },
  { id: "activity", label: "Activity", icon: Activity, group: "workbench" },
  // Settings
  { id: "preferences", label: "Preferences", icon: Settings, group: "settings" },
  { id: "appearance", label: "Appearance", icon: Palette, group: "settings" },
  { id: "account", label: "Account", icon: Trash2, group: "settings" },
];

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: universities } = useUniversities();
  const updateProfile = useUpdateProfile();
  const uploadPicture = useProfilePictureUpload();

  // Read section from URL params
  const sectionFromUrl = searchParams.get("section") as SectionId | null;
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromUrl || "profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    country: "",
    birthday: "",
    university_id: "" as string | null,
    student_level: null as 'Bachelor' | 'Master' | null,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update activeSection when URL params change
  useEffect(() => {
    if (sectionFromUrl && navSections.some(s => s.id === sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  if (authLoading || profileLoading) {
    return <Loader fullScreen />;
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleEdit = () => {
    setFormData({
      username: profile?.username || "",
      country: profile?.country || "",
      birthday: profile?.birthday || "",
      university_id: profile?.university_id || null,
      student_level: profile?.student_level as 'Bachelor' | 'Master' | null || null,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      username: formData.username,
      country: formData.country,
      birthday: formData.birthday,
      university_id: formData.university_id,
      student_level: formData.student_level,
    });
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    await uploadPicture.mutateAsync(file);
  };

  const handleDeleteAccount = async () => {
    try {
      const userId = user.id;
      const { supabase } = await import("@/integrations/supabase/client");
      
      await supabase.from("user_saved_courses(US-C)").delete().eq("user_id", userId);
      await supabase.from("user_saved_labs(US-L)").delete().eq("user_id", userId);
      await supabase.from("course_reviews").delete().eq("user_id", userId);
      await supabase.from("course_review_upvotes").delete().eq("user_id", userId);
      await supabase.from("email_drafts").delete().eq("user_id", userId);
      await supabase.from("ai_conversations").delete().eq("user_id", userId);
      await supabase.from("user_documents").delete().eq("user_id", userId);
      await supabase.from("diary_notebooks").delete().eq("user_id", userId);
      await supabase.from("Users(US)").delete().eq("id", userId);
      
      await signOut();
      
      toast.success("Account and all data deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  const createdDate = profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : null;
  
  const userUniversity = profile?.university 
    ? profile.university 
    : universities?.find(u => u.uuid === profile?.university_id);

  const renderNavButton = (section: NavSection) => (
    <button
      key={section.id}
      onClick={() => setActiveSection(section.id)}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all text-sm",
        activeSection === section.id
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <section.icon className="h-4 w-4" />
      <span>{section.label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your personal details</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} size="sm" disabled={updateProfile.isPending}>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{profile?.username || "Not set"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm font-medium text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Country
                  </Label>
                  {isEditing ? (
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{profile?.country || "Not set"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Birthday
                  </Label>
                  {isEditing ? (
                    <Input
                      id="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {profile?.birthday ? format(new Date(profile.birthday), "MMMM d, yyyy") : "Not set"}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    University
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.university_id || "none"}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        university_id: value === "none" ? null : value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="none">No university selected</SelectItem>
                        {universities?.map((uni) => (
                          <SelectItem key={uni.uuid} value={uni.uuid}>
                            {uni.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium">{userUniversity?.name || "Not set"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Student Level
                  </Label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formData.student_level === 'Bachelor' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setFormData({ 
                          ...formData, 
                          student_level: formData.student_level === 'Bachelor' ? null : 'Bachelor' 
                        })}
                      >
                        Bachelor
                      </Button>
                      <Button
                        type="button"
                        variant={formData.student_level === 'Master' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setFormData({ 
                          ...formData, 
                          student_level: formData.student_level === 'Master' ? null : 'Master' 
                        })}
                      >
                        Master
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">
                      {profile?.student_level ? `${profile.student_level} Student` : "Not set"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "saved":
        return <WorkbenchSavedItems />;
      case "diary":
        return <WorkbenchDiaryPages />;
      case "documents":
        return <WorkbenchDocuments />;
      case "ai-history":
        return <WorkbenchAIHistory />;
      case "drafts":
        return <WorkbenchEmailDrafts />;
      case "agreements":
        return (
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileCheck className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Learning Agreements</h3>
              <p className="text-muted-foreground max-w-md">
                This feature will be released in the next updates. Stay tuned for the ability to create and manage your learning agreements!
              </p>
            </CardContent>
          </Card>
        );
      case "activity":
        return <WorkbenchActivity />;

      case "preferences":
        return <PreferencesSettings />;

      case "appearance":
        return (
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how your profile looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Flashcard Color Style
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'gradient', label: 'Default', colors: 'from-violet-500 via-purple-500 to-fuchsia-500' },
                    { id: 'ocean', label: 'Ocean', colors: 'from-blue-600 via-cyan-500 to-teal-400' },
                    { id: 'sunset', label: 'Sunset', colors: 'from-orange-500 via-rose-500 to-pink-500' },
                    { id: 'forest', label: 'Forest', colors: 'from-emerald-600 via-green-500 to-teal-500' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => updateProfile.mutate({ flashcard_color_style: style.id as FlashcardColorStyle })}
                      className={cn(
                        "relative p-3 rounded-xl border-2 transition-all",
                        profile?.flashcard_color_style === style.id || (!profile?.flashcard_color_style && style.id === 'gradient')
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className={`h-12 w-full rounded-lg bg-gradient-to-br ${style.colors}`} />
                      <p className="text-xs text-center mt-2 font-medium">{style.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "account":
        return (
          <Card className="bg-background/50 backdrop-blur-sm border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-destructive/50 p-4">
                <h3 className="font-semibold mb-2">Delete Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. All your data will be permanently deleted.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Delete My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <Separator />

              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold mb-2">Sign Out</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign out of your account on this device.
                </p>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const activeNav = navSections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen">
      {/* Hero Header with Flashcard */}
      <div className="border-b border-border/50 backdrop-blur-md bg-background/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* User Flashcard */}
            <div className="flex-shrink-0">
              <UserFlashcard
                username={profile?.username || undefined}
                profilePhotoUrl={profile?.profile_photo_url}
                universityName={userUniversity?.name}
                universityLogo={userUniversity?.logo_url}
                studentLevel={profile?.student_level as 'Bachelor' | 'Master' | null}
                memberSince={createdDate || undefined}
                colorStyle={(profile?.flashcard_color_style as FlashcardColorStyle) || 'gradient'}
                isEditable
                onAvatarClick={() => fileInputRef.current?.click()}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadPicture.isPending}
              />
            </div>

            {/* Quick Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {profile?.username || "User"}
              </h1>
              <p className="text-muted-foreground text-sm mb-3">{user.email}</p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {profile?.student_level && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {profile.student_level}
                  </span>
                )}
                {userUniversity && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/50 text-accent-foreground text-xs font-medium">
                    <Building className="h-3.5 w-3.5" />
                    {userUniversity.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className={cn(
            "lg:w-64 flex-shrink-0",
            isMobile && "mb-4"
          )}>
            {isMobile ? (
              // Mobile: Horizontal scrollable pills
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {navSections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveSection(section.id)}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <section.icon className="h-4 w-4" />
                      {section.label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              // Desktop: Sidebar with grouped sections
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 sticky top-20">
                <CardContent className="p-3">
                  <div className="space-y-4">
                    {/* Personal */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                        Personal
                      </p>
                      <div className="space-y-0.5">
                        {navSections.filter(s => s.group === "personal").map(renderNavButton)}
                      </div>
                    </div>

                    <Separator />

                    {/* Workbench */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                        Workbench
                      </p>
                      <div className="space-y-0.5">
                        {navSections.filter(s => s.group === "workbench").map(renderNavButton)}
                      </div>
                    </div>

                    <Separator />

                    {/* Settings */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                        Settings
                      </p>
                      <div className="space-y-0.5">
                        {navSections.filter(s => s.group === "settings").map(renderNavButton)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            {/* Section Header (Mobile) */}
            {isMobile && activeNav && (
              <div className="flex items-center gap-2 mb-4">
                <activeNav.icon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{activeNav.label}</h2>
              </div>
            )}
            
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
