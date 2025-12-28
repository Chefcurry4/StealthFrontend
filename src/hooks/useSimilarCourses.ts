import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "./useCourses";

export const useSimilarCourses = (courseId: string, topics: string | null, limit: number = 6) => {
  return useQuery({
    queryKey: ["similarCourses", courseId, topics],
    queryFn: async () => {
      if (!topics) {
        // Fallback: get popular courses from the same level
        const { data, error } = await supabase
          .from("Courses(C)")
          .select("*")
          .neq("id_course", courseId)
          .limit(limit);

        if (error) throw error;
        return data as Course[];
      }

      // Parse topics into an array
      const topicArray = topics.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      
      if (topicArray.length === 0) {
        const { data, error } = await supabase
          .from("Courses(C)")
          .select("*")
          .neq("id_course", courseId)
          .limit(limit);

        if (error) throw error;
        return data as Course[];
      }

      // Build OR query for topic matching
      const topicFilters = topicArray.slice(0, 5).map(topic => `topics.ilike.%${topic}%`).join(',');
      
      const { data, error } = await supabase
        .from("Courses(C)")
        .select("*")
        .neq("id_course", courseId)
        .or(topicFilters)
        .limit(limit * 2); // Get more to allow for better matching

      if (error) throw error;
      
      // Score courses by topic overlap
      const scoredCourses = (data as Course[]).map(course => {
        const courseTopics = course.topics?.split(',').map(t => t.trim().toLowerCase()) || [];
        const overlap = topicArray.filter(t => courseTopics.some(ct => ct.includes(t) || t.includes(ct))).length;
        return { course, score: overlap };
      });

      // Sort by score and take top results
      scoredCourses.sort((a, b) => b.score - a.score);
      return scoredCourses.slice(0, limit).map(sc => sc.course);
    },
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
