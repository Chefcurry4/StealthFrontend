import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CourseRating {
  course_id: string;
  average_rating: number;
  review_count: number;
}

export const useCourseRatings = (courseIds: string[]) => {
  return useQuery({
    queryKey: ["courseRatings", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return {};

      const { data, error } = await supabase
        .from("course_reviews")
        .select("course_id, rating")
        .in("course_id", courseIds);

      if (error) throw error;

      // Calculate averages per course
      const ratingsMap: Record<string, CourseRating> = {};
      
      data?.forEach((review) => {
        if (!ratingsMap[review.course_id]) {
          ratingsMap[review.course_id] = {
            course_id: review.course_id,
            average_rating: 0,
            review_count: 0,
          };
        }
        ratingsMap[review.course_id].review_count++;
        ratingsMap[review.course_id].average_rating += Number(review.rating);
      });

      // Calculate final averages
      Object.values(ratingsMap).forEach((rating) => {
        rating.average_rating = rating.average_rating / rating.review_count;
      });

      return ratingsMap;
    },
    enabled: courseIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
