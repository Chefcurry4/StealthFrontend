import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePublicUserReviewCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["public-user-review-count", userId],
    queryFn: async () => {
      if (!userId) return { courseReviews: 0, labReviews: 0, total: 0, isEpic: false };
      
      const [courseReviewsRes, labReviewsRes] = await Promise.all([
        supabase
          .from("course_reviews")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("lab_reviews")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
      ]);

      const courseReviews = courseReviewsRes.count || 0;
      const labReviews = labReviewsRes.count || 0;
      const total = courseReviews + labReviews;
      const isEpic = total >= 10;

      return {
        courseReviews,
        labReviews,
        total,
        isEpic,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
