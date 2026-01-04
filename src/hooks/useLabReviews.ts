import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LabReview {
  id: string;
  lab_id: string;
  user_id: string;
  rating: number;
  research_quality: string | null;
  mentorship: string | null;
  work_environment: string | null;
  comment: string | null;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    profile_photo_url: string | null;
  };
  hasUpvoted?: boolean;
}

export const useLabReviews = (labId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lab-reviews", labId],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from("lab_reviews")
        .select(`
          *,
          user:user_id (
            username,
            profile_photo_url
          )
        `)
        .eq("lab_id", labId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Check upvotes for current user
      if (user && reviews) {
        const { data: upvotes } = await supabase
          .from("lab_review_upvotes")
          .select("review_id")
          .eq("user_id", user.id)
          .in("review_id", reviews.map((r) => r.id));

        const upvotedIds = new Set(upvotes?.map((u) => u.review_id) || []);
        return reviews.map((review) => ({
          ...review,
          hasUpvoted: upvotedIds.has(review.id),
        })) as LabReview[];
      }

      return reviews as LabReview[];
    },
    enabled: !!labId,
  });
};

export const useCreateLabReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      lab_id: string;
      rating: number;
      research_quality?: string;
      mentorship?: string;
      work_environment?: string;
      comment?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data: review, error } = await supabase
        .from("lab_reviews")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lab-reviews", variables.lab_id] });
      toast.success("Review submitted!");
    },
    onError: () => {
      toast.error("Failed to submit review");
    },
  });
};

export const useUpdateLabReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      rating: number;
      research_quality?: string;
      mentorship?: string;
      work_environment?: string;
      comment?: string;
    }) => {
      const { id, ...updateData } = data;
      const { data: review, error } = await supabase
        .from("lab_reviews")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lab-reviews", data.lab_id] });
      toast.success("Review updated!");
    },
    onError: () => {
      toast.error("Failed to update review");
    },
  });
};

export const useDeleteLabReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, labId }: { id: string; labId: string }) => {
      const { error } = await supabase.from("lab_reviews").delete().eq("id", id);
      if (error) throw error;
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ["lab-reviews", labId] });
      toast.success("Review deleted");
    },
    onError: () => {
      toast.error("Failed to delete review");
    },
  });
};

export const useToggleLabReviewUpvote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ reviewId, labId, hasUpvoted }: { reviewId: string; labId: string; hasUpvoted: boolean }) => {
      if (!user) throw new Error("Must be logged in");

      if (hasUpvoted) {
        const { error } = await supabase
          .from("lab_review_upvotes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lab_review_upvotes").insert({
          review_id: reviewId,
          user_id: user.id,
        });
        if (error) throw error;
      }
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ["lab-reviews", labId] });
    },
  });
};

export const calculateLabReviewSummary = (reviews: LabReview[] | undefined) => {
  if (!reviews || reviews.length === 0) {
    return {
      avgResearchQuality: null,
      avgMentorship: null,
      avgWorkEnvironment: null,
      totalReviews: 0,
    };
  }

  const researchMap: Record<string, number> = { "Poor": 1, "Fair": 2, "Good": 3, "Excellent": 4 };
  const mentorshipMap: Record<string, number> = { "Poor": 1, "Fair": 2, "Good": 3, "Excellent": 4 };
  const environmentMap: Record<string, number> = { "Poor": 1, "Fair": 2, "Good": 3, "Excellent": 4 };

  const reverseLabels = ["Poor", "Fair", "Good", "Excellent"];

  const research = reviews.filter(r => r.research_quality).map(r => researchMap[r.research_quality!] || 0).filter(v => v > 0);
  const mentorship = reviews.filter(r => r.mentorship).map(r => mentorshipMap[r.mentorship!] || 0).filter(v => v > 0);
  const environment = reviews.filter(r => r.work_environment).map(r => environmentMap[r.work_environment!] || 0).filter(v => v > 0);

  const getLabel = (arr: number[]) => {
    if (arr.length === 0) return null;
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    const idx = Math.round(avg) - 1;
    return reverseLabels[Math.max(0, Math.min(3, idx))];
  };

  return {
    avgResearchQuality: getLabel(research),
    avgMentorship: getLabel(mentorship),
    avgWorkEnvironment: getLabel(environment),
    totalReviews: reviews.length,
  };
};