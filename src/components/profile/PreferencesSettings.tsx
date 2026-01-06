import { useState, useEffect } from "react";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { useUpdatePreferences } from "@/hooks/useUserPreferences";
import { useUserReviewCount } from "@/hooks/useUserReviewCount";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Globe, LayoutGrid, Mail, Star, Palette, Sun, Moon, Lock, User, Crown } from "lucide-react";
import { Loader } from "@/components/Loader";
import { ThemePreviewCard } from "./ThemePreviewCard";
import { ThemeId, ThemeMode } from "@/themes/types";
import { THEMES } from "@/themes/constants";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { FlashcardColorStyle } from "@/components/UserFlashcard";
import { cn } from "@/lib/utils";

export const PreferencesSettings = () => {
  const { data: profile, isLoading } = useUserProfile();
  const updatePreferences = useUpdatePreferences();
  const updateProfile = useUpdateProfile();
  const { data: reviewStats } = useUserReviewCount();
  const { themeId: currentThemeId, mode: currentMode, setBackgroundTheme, toggleMode } = useBackgroundTheme();

  const [preferences, setPreferences] = useState({
    notification_email: true,
    notification_reviews: true,
    notification_agreements: true,
    language_preference: "en",
    display_compact: false,
    display_items_per_page: 20,
    email_public: false,
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
        email_public: (profile as any).email_public ?? false,
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

  const handleThemeSelect = async (themeId: ThemeId, mode: ThemeMode) => {
    await setBackgroundTheme(themeId);
    if (mode !== currentMode) {
      await toggleMode();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="backdrop-blur-md border" style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
          <CardContent className="flex items-center justify-center py-12">
            <Loader />
          </CardContent>
        </Card>
      </div>
    );
  }

  const themeIds = Object.values(ThemeId);

  return (
    <div className="space-y-6">
      {/* Background Theme */}
      <Card className="backdrop-blur-md border" style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Background Theme</CardTitle>
            </div>
            {/* Day/Night Toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--theme-btn-secondary)' }}>
              <Sun className="h-4 w-4" style={{ opacity: currentMode === 'day' ? 1 : 0.4 }} />
              <Switch
                checked={currentMode === 'night'}
                onCheckedChange={toggleMode}
                className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-amber-400"
              />
              <Moon className="h-4 w-4" style={{ opacity: currentMode === 'night' ? 1 : 0.4 }} />
            </div>
          </div>
          <CardDescription>Choose your preferred animated background style and mode</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Day Themes */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-4 w-4" />
              <span className="text-sm font-medium">Day Mode</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {themeIds.map((id) => (
                <ThemePreviewCard
                  key={`${id}-day`}
                  themeId={id}
                  mode="day"
                  isSelected={currentThemeId === id && currentMode === 'day'}
                  onClick={() => handleThemeSelect(id, 'day')}
                />
              ))}
            </div>
          </div>
          
          {/* Night Themes */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4" />
              <span className="text-sm font-medium">Night Mode</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {themeIds.map((id) => (
                <ThemePreviewCard
                  key={`${id}-night`}
                  themeId={id}
                  mode="night"
                  isSelected={currentThemeId === id && currentMode === 'night'}
                  onClick={() => handleThemeSelect(id, 'night')}
                />
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg border" style={{ background: 'var(--theme-btn-secondary)', borderColor: 'var(--theme-card-border)' }}>
            <div className="flex items-center gap-2">
              {currentMode === 'day' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <p className="text-sm font-medium">{THEMES[currentThemeId].name} ({currentMode})</p>
            </div>
            <p className="text-xs opacity-70 mt-1">
              {THEMES[currentThemeId].description}
            </p>
            <div className="flex gap-1 mt-2">
              {THEMES[currentThemeId].colors.map((color, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border"
                  style={{ backgroundColor: color, borderColor: 'var(--theme-card-border)' }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="backdrop-blur-md border" style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Privacy</CardTitle>
          </div>
          <CardDescription>Control what others can see on your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 opacity-70" />
              <div>
                <Label className="text-base">Make Email Public</Label>
                <p className="text-sm opacity-70">
                  Allow other users to see your email on your profile
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.email_public}
              onCheckedChange={(checked) => handleToggle("email_public", checked)}
              disabled={updatePreferences.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="backdrop-blur-md border" style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 opacity-70" />
              <div>
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm opacity-70">
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

          <Separator style={{ background: 'var(--theme-card-border)' }} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 opacity-70" />
              <div>
                <Label className="text-base">Review Notifications</Label>
                <p className="text-sm opacity-70">
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

        </CardContent>
      </Card>

      {/* Language */}
      <Card className="backdrop-blur-md border" style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Language</CardTitle>
          </div>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Display Language</Label>
              <p className="text-sm opacity-70">
                Select the language for the interface
              </p>
            </div>
            <Select
              value={preferences.language_preference}
              onValueChange={(value) => handleSelect("language_preference", value)}
              disabled={updatePreferences.isPending}
            >
              <SelectTrigger className="w-[220px]" style={{ background: 'var(--theme-input-bg)', borderColor: 'var(--theme-input-border)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr" disabled>
                  <span className="flex items-center gap-2">
                    Français
                    <span className="text-xs text-muted-foreground">(coming soon)</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display */}
      <Card className="backdrop-blur-md border" style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            <CardTitle>Display</CardTitle>
          </div>
          <CardDescription>Customize how content is displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Compact View</Label>
              <p className="text-sm opacity-70">
                Show more items with less spacing
              </p>
            </div>
            <Switch
              checked={preferences.display_compact}
              onCheckedChange={(checked) => handleToggle("display_compact", checked)}
              disabled={updatePreferences.isPending}
            />
          </div>

          <Separator style={{ background: 'var(--theme-card-border)' }} />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Items Per Page</Label>
              <p className="text-sm opacity-70">
                Number of items to show in lists
              </p>
            </div>
            <Select
              value={String(preferences.display_items_per_page)}
              onValueChange={(value) => handleSelect("display_items_per_page", parseInt(value))}
              disabled={updatePreferences.isPending}
            >
              <SelectTrigger className="w-[100px]" style={{ background: 'var(--theme-input-bg)', borderColor: 'var(--theme-input-border)' }}>
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

      {/* Appearance - Flashcard Style */}
      <Card className="backdrop-blur-md border" style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Appearance</CardTitle>
          </div>
          <CardDescription>Customize how your profile card looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Flashcard Color Style
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {([
                { id: 'gradient' as FlashcardColorStyle, label: 'Default', colors: 'from-violet-500 via-purple-500 to-fuchsia-500', epicOnly: false },
                { id: 'ocean' as FlashcardColorStyle, label: 'Ocean', colors: 'from-blue-600 via-cyan-500 to-teal-400', epicOnly: false },
                { id: 'sunset' as FlashcardColorStyle, label: 'Sunset', colors: 'from-orange-500 via-rose-500 to-pink-500', epicOnly: false },
                { id: 'forest' as FlashcardColorStyle, label: 'Forest', colors: 'from-emerald-600 via-green-500 to-teal-500', epicOnly: false },
                { id: 'epic-orange' as FlashcardColorStyle, label: 'Epic Orange', colors: 'from-amber-500 via-orange-500 to-yellow-500', epicOnly: true },
                { id: 'epic-dark' as FlashcardColorStyle, label: 'Epic Dark', colors: 'from-zinc-900 via-neutral-800 to-stone-900', epicOnly: true },
              ]).map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => updateProfile.mutate({ flashcard_color_style: style.id as FlashcardColorStyle })}
                  disabled={style.epicOnly && !reviewStats?.isEpic}
                  className={cn(
                    "relative p-3 rounded-xl border-2 transition-all",
                    profile?.flashcard_color_style === style.id || (!profile?.flashcard_color_style && style.id === 'gradient')
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50',
                    style.epicOnly && !reviewStats?.isEpic && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className={`h-12 w-full rounded-lg bg-gradient-to-br ${style.colors} ${style.epicOnly && !reviewStats?.isEpic ? 'grayscale' : ''}`} />
                  <p className="text-xs text-center mt-2 font-medium">{style.label}</p>
                  {style.epicOnly && (
                    <span className={`absolute top-1 right-1 flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      reviewStats?.isEpic 
                        ? 'bg-amber-500/80 text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {reviewStats?.isEpic ? (
                        <Crown className="h-2.5 w-2.5" />
                      ) : (
                        <Lock className="h-2.5 w-2.5" />
                      )}
                      Epic
                    </span>
                  )}
                </button>
              ))}
            </div>
            {!reviewStats?.isEpic && (
              <p className="text-xs text-muted-foreground mt-2">
                🔒 Epic color styles are unlocked when you reach EPIC status (10+ reviews)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
