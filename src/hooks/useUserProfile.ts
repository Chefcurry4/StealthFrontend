import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch user profile
      const { data: profile, error } = await supabase
        .from("Users(US)")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (!profile) return null;

      // If user has a university_id, fetch university details separately
      let university = null;
      if (profile.university_id) {
        const { data: uniData } = await supabase
          .from("Universities(U)")
          .select("uuid, name, logo_url, slug")
          .eq("uuid", profile.university_id)
          .single();
        university = uniData;
      }

      return { ...profile, university };
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      username?: string;
      country?: string;
      birthday?: string;
      university_id?: string | null;
      student_level?: 'Bachelor' | 'Master' | null;
      flashcard_color_style?: 'gradient' | 'ocean' | 'sunset' | 'forest' | 'epic-orange' | 'epic-dark' | 'epic-pink' | 'epic-white' | 'epic-sunset';
      login_count?: number;
      guide_completed?: boolean;
    }) => {
      if (!user) throw new Error("Must be logged in");

      // Check if profile exists
      const { data: existing } = await supabase
        .from("Users(US)")
        .select("id")
        .eq("id", user.id)
        .single();

      let data, error;

      if (existing) {
        // Update existing profile
        const result = await supabase
          .from("Users(US)")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert new profile
        const result = await supabase
          .from("Users(US)")
          .insert({
            id: user.id,
            email: user.email!,
            username: updates.username || user.email!.split("@")[0],
            ...updates,
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated!");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });
};
