import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdatePreferences } from "@/hooks/useUserPreferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Globe, LayoutGrid, Mail, Star, FileText } from "lucide-react";
import { Loader } from "@/components/Loader";

export const PreferencesSettings = () => {
  const { data: profile, isLoading } = useUserProfile();
  const updatePreferences = useUpdatePreferences();

  const [preferences, setPreferences] = useState({
    notification_email: true,
    notification_reviews: true,
    notification_agreements: true,
    language_preference: "en",
    display_compact: false,
    display_items_per_page: 20,
  });

  useEffect(() => {
    if (profile) {
      setPreferences({
        notification_email: profile.notification_email ?? true,
        notification_reviews: profile.notification_reviews ?? true,
        notification_agreements: profile.notification_agreements ?? true,
        language_preference: profile.language_preference ?? "en",
        display_compact: profile.display_compact ?? false,
        display_items_per_page: profile.display_items_per_page ?? 20,
      });
    }
  }, [profile]);

  const handleToggle = async (key: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    await updatePreferences.mutateAsync({ [key]: value });
  };

  const handleSelect = async (key: string, value: string | number) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    await updatePreferences.mutateAsync({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates via email
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notification_email}
              onCheckedChange={(checked) => handleToggle("notification_email", checked)}
              disabled={updatePreferences.isPending}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-base">Review Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about replies to your reviews
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notification_reviews}
              onCheckedChange={(checked) => handleToggle("notification_reviews", checked)}
              disabled={updatePreferences.isPending}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-base">Agreement Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about learning agreement changes
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notification_agreements}
              onCheckedChange={(checked) => handleToggle("notification_agreements", checked)}
              disabled={updatePreferences.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Language</CardTitle>
          </div>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Display Language</Label>
              <p className="text-sm text-muted-foreground">
                Select the language for the interface
              </p>
            </div>
            <Select
              value={preferences.language_preference}
              onValueChange={(value) => handleSelect("language_preference", value)}
              disabled={updatePreferences.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <CardTitle>Display</CardTitle>
          </div>
          <CardDescription>Customize how content is displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Compact View</Label>
              <p className="text-sm text-muted-foreground">
                Show more items with less spacing
              </p>
            </div>
            <Switch
              checked={preferences.display_compact}
              onCheckedChange={(checked) => handleToggle("display_compact", checked)}
              disabled={updatePreferences.isPending}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Items Per Page</Label>
              <p className="text-sm text-muted-foreground">
                Number of items to show in lists
              </p>
            </div>
            <Select
              value={String(preferences.display_items_per_page)}
              onValueChange={(value) => handleSelect("display_items_per_page", parseInt(value))}
              disabled={updatePreferences.isPending}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
