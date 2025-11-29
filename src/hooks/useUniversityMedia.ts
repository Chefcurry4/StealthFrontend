import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useUniversityMedia = (universityId: string) => {
  return useQuery({
    queryKey: ["universityMedia", universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("university_media")
        .select("*")
        .eq("university_id", universityId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!universityId,
  });
};

export const useUploadUniversityMedia = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      university_id: string;
      image_url: string;
      type: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("university_media").insert({
        ...data,
        uploaded_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universityMedia"] });
      toast({
        title: "Photo uploaded!",
        description: "Your photo has been added to the gallery",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    },
  });
};

export const useToggleLikeMedia = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data: existing } = await supabase
        .from("university_media_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("media_id", mediaId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("university_media_likes")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
        return { action: "unliked" };
      } else {
        const { error } = await supabase.from("university_media_likes").insert({
          user_id: user.id,
          media_id: mediaId,
        });

        if (error) throw error;
        return { action: "liked" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universityMedia"] });
    },
  });
};

export const useDeleteUniversityMedia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("university_media")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universityMedia"] });
      toast({
        title: "Photo deleted",
      });
    },
  });
};
