import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ThemeId, ThemeMode } from "@/themes/types";

interface UserPreferences {
  notification_email?: boolean;
  notification_reviews?: boolean;
  notification_agreements?: boolean;
  language_preference?: string;
  display_compact?: boolean;
  display_items_per_page?: number;
  background_theme?: ThemeId;
  background_theme_mode?: ThemeMode;
  email_public?: boolean;
}

export const useUpdatePreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("Users(US)")
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Preferences updated!");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });
};
