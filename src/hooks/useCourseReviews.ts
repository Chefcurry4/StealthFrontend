import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useCourseReviews = (courseId: string) => {
  const { user } = useAuth();
  
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
        .order("upvote_count", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Get user's upvotes if logged in
      if (user && data) {
        const reviewIds = data.map(r => r.id);
        const { data: upvotes } = await supabase
          .from("course_review_upvotes")
          .select("review_id")
          .eq("user_id", user.id)
          .in("review_id", reviewIds);
        
        const upvotedIds = new Set(upvotes?.map(u => u.review_id) || []);
        return data.map(review => ({
          ...review,
          hasUpvoted: upvotedIds.has(review.id)
        }));
      }
      
      return data.map(review => ({ ...review, hasUpvoted: false }));
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

export const useToggleReviewUpvote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, hasUpvoted }: { reviewId: string; hasUpvoted: boolean }) => {
      if (!user) throw new Error("Must be logged in");

      if (hasUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from("course_review_upvotes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Add upvote
        const { error } = await supabase
          .from("course_review_upvotes")
          .insert({ review_id: reviewId, user_id: user.id });
        if (error) throw error;
      }

      // Update upvote count
      const { count } = await supabase
        .from("course_review_upvotes")
        .select("*", { count: "exact", head: true })
        .eq("review_id", reviewId);

      await supabase
        .from("course_reviews")
        .update({ upvote_count: count || 0 })
        .eq("id", reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseReviews"] });
    },
  });
};
