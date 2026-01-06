import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserReviewCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-review-count", user?.id],
    queryFn: async () => {
      if (!user) return { courseReviews: 0, labReviews: 0, total: 0, isEpic: false };
      
      const [courseReviewsRes, labReviewsRes] = await Promise.all([
        supabase
          .from("course_reviews")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("lab_reviews")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
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
    enabled: !!user,
  });
};
