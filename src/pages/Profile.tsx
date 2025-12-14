import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { useProfilePictureUpload } from "@/hooks/useProfilePicture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/Loader";
import { PreferencesSettings } from "@/components/profile/PreferencesSettings";
import {
  WorkbenchSavedItems,
  WorkbenchDocuments,
  WorkbenchAIHistory,
  WorkbenchEmailDrafts,
  WorkbenchLearningAgreements,
  WorkbenchActivity,
} from "@/components/profile/workbench";
import { 
  User, 
  AlertTriangle, 
  Upload,
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
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const uploadPicture = useProfilePictureUpload();

  const [activeTab, setActiveTab] = useState("profile");
  const [workbenchSection, setWorkbenchSection] = useState("saved");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    country: "",
    birthday: "",
  });

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
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync(formData);
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
      await signOut();
      toast.success("Account deleted");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const userInitial = profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U";
  const createdDate = profile?.created_at ? format(new Date(profile.created_at), "MMMM d, yyyy") : null;

  const workbenchSections = [
    { id: "saved", label: "Saved", icon: BookOpen },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "ai-history", label: "AI Chats", icon: MessageSquare },
    { id: "drafts", label: "Drafts", icon: Mail },
    { id: "agreements", label: "Agreements", icon: FileCheck },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={profile?.profile_photo_url || ""} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                <Upload className="h-6 w-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadPicture.isPending}
                />
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile?.username || "User"}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              {createdDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  Joined on {createdDate}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 gap-1">
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
            <Card>
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
                        Cancel
                      </Button>
                      <Button onClick={handleSave} size="sm" disabled={updateProfile.isPending}>
                        Save Changes
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
            <Card>
              <CardContent className="p-6">
                {workbenchSection === "saved" && <WorkbenchSavedItems />}
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
            <Card className="border-destructive/50">
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
