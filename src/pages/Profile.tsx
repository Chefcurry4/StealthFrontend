import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { useProfilePictureUpload } from "@/hooks/useProfilePicture";
import { useUniversities } from "@/hooks/useUniversities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Briefcase,
  Shield,
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
  Check
} from "lucide-react";
import { Palette } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: universities } = useUniversities();
  const updateProfile = useUpdateProfile();
  const uploadPicture = useProfilePictureUpload();

  const [activeTab, setActiveTab] = useState("profile");
  const [workbenchSection, setWorkbenchSection] = useState("saved");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    country: "",
    birthday: "",
    university_id: "" as string | null,
    student_level: null as 'Bachelor' | 'Master' | null,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Delete all user data from related tables
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Delete saved courses
      await supabase.from("user_saved_courses(US-C)").delete().eq("user_id", userId);
      
      // Delete saved labs
      await supabase.from("user_saved_labs(US-L)").delete().eq("user_id", userId);
      
      // Delete saved programs
      await supabase.from("user_saved_programs(US-P)").delete().eq("user_id", userId);
      
      // Delete course reviews
      await supabase.from("course_reviews").delete().eq("user_id", userId);
      
      // Delete course review upvotes
      await supabase.from("course_review_upvotes").delete().eq("user_id", userId);
      
      // Delete email drafts
      await supabase.from("email_drafts").delete().eq("user_id", userId);
      
      // Delete AI messages (via conversations cascade)
      await supabase.from("ai_conversations").delete().eq("user_id", userId);
      
      // Delete user documents
      await supabase.from("user_documents").delete().eq("user_id", userId);
      
      // Delete learning agreement courses first (foreign key dependency)
      const { data: agreements } = await supabase
        .from("Learning_agreements(LA)")
        .select("id")
        .eq("user_id", userId);
      
      if (agreements && agreements.length > 0) {
        const agreementIds = agreements.map(a => a.id);
        await supabase.from("learning_agreement_courses").delete().in("agreement_id", agreementIds);
      }
      
      // Delete learning agreements
      await supabase.from("Learning_agreements(LA)").delete().eq("user_id", userId);
      
      // Delete user profile
      await supabase.from("Users(US)").delete().eq("id", userId);
      
      // Sign out the user
      await signOut();
      
      toast.success("Account and all data deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  const createdDate = profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : null;
  
  // Get university details for display
  const userUniversity = profile?.university 
    ? profile.university 
    : universities?.find(u => u.uuid === profile?.university_id);

  const workbenchSections = [
    { id: "saved", label: "Saved", icon: BookOpen },
    { id: "diary", label: "Diary Pages", icon: Book },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "ai-history", label: "AI Chats", icon: MessageSquare },
    { id: "drafts", label: "Drafts", icon: Mail },
    { id: "agreements", label: "Agreements", icon: FileCheck },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Header with Flashcard */}
      <div className="border-b border-border/50 backdrop-blur-md bg-background/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
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

            {/* Quick Info & Actions */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {profile?.username || "User"}
              </h1>
              <p className="text-foreground/70 mb-4">{user.email}</p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {profile?.student_level && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    <GraduationCap className="h-4 w-4" />
                    {profile.student_level} Student
                  </span>
                )}
                {userUniversity && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent-foreground text-sm">
                    <Building className="h-4 w-4" />
                    {userUniversity.name}
                  </span>
                )}
              </div>
              
              {createdDate && (
                <p className="text-sm text-foreground/50 mt-4">
                  Member since {createdDate}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 gap-1 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile & Settings</span>
            </TabsTrigger>
            <TabsTrigger value="workbench" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Workbench</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile & Settings Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Personal Information */}
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

                {/* University & Student Level */}
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

                <Separator />

                {/* Flashcard Color Style */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Flashcard Color Style
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
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
                        className={`relative p-3 rounded-xl border-2 transition-all ${
                          profile?.flashcard_color_style === style.id || (!profile?.flashcard_color_style && style.id === 'gradient')
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`h-12 w-full rounded-lg bg-gradient-to-br ${style.colors}`} />
                        <p className="text-xs text-center mt-2 font-medium">{style.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences & Theme */}
            <PreferencesSettings />
          </TabsContent>

          {/* Workbench Tab */}
          <TabsContent value="workbench" className="space-y-6">
            {/* Workbench Sub-Navigation */}
            <div className="flex flex-wrap gap-2">
              {workbenchSections.map((section) => (
                <Button
                  key={section.id}
                  variant={workbenchSection === section.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWorkbenchSection(section.id)}
                  className="flex items-center gap-2"
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </Button>
              ))}
            </div>

            {/* Workbench Content */}
            <Card className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                {workbenchSection === "saved" && <WorkbenchSavedItems />}
                {workbenchSection === "diary" && <WorkbenchDiaryPages />}
                {workbenchSection === "documents" && <WorkbenchDocuments />}
                {workbenchSection === "ai-history" && <WorkbenchAIHistory />}
                {workbenchSection === "drafts" && <WorkbenchEmailDrafts />}
                {workbenchSection === "agreements" && <WorkbenchLearningAgreements />}
                {workbenchSection === "activity" && <WorkbenchActivity />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
