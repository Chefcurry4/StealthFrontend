import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePublicUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ["public-user-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Users(US)")
        .select("id, username, profile_photo_url, email, email_public, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
