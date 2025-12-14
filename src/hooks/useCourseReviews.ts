import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useCourseReviews = (courseId: string) => {
  return useQuery({
    queryKey: ["courseReviews", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_reviews")
        .select(`
          *,
          user:user_id (
            id,
            username,
            profile_photo_url,
            email,
            email_public
          )
        `)
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
};

export const useCreateCourseReview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      course_id: string;
      rating: number;
      difficulty?: string;
      workload?: string;
      organization?: string;
      comment?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("course_reviews").insert({
        ...data,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseReviews"] });
      toast({
        title: "Review posted!",
        description: "Thank you for your feedback",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post review",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCourseReview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      rating?: number;
      difficulty?: string;
      workload?: string;
      organization?: string;
      comment?: string;
    }) => {
      const { error } = await supabase
        .from("course_reviews")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseReviews"] });
      toast({
        title: "Review updated!",
      });
    },
  });
};

export const useDeleteCourseReview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("course_reviews").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseReviews"] });
      toast({
        title: "Review deleted",
      });
    },
  });
};
