import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id_course: string;
  code: string | null;
  name_course: string;
  description: string | null;
  ects: number | null;
  language: string | null;
  language_code: string | null;
  term: string | null;
  ba_ma: string | null;
  professor_name: string | null;
  year: string | null;
  topics: string | null;
  type_exam: string | null;
  mandatory_optional: string | null;
  programs: string | null;
  software_equipment: string | null;
  which_year: string | null;
}

export interface CourseFilters {
  search?: string;
  universityId?: string;
  programId?: string;
  language?: string;
  level?: string;
  term?: string;
  ectsMin?: number;
  ectsMax?: number;
  examType?: string;
  mandatoryOptional?: string;
  whichYear?: string;
  topicNames?: string[]; // Add topic filter
}

export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      // Step 1: Build list of course IDs that match bridge filters
      let courseIdFilters: Set<string> | null = null;

      // Filter by topics using bridge table (proper relational lookup)
      if (filters?.topicNames && filters.topicNames.length > 0) {
        const { data: topicBridges } = await supabase
          .from("bridge_topc(TOP-C)")
          .select("course_id, topic_name")
          .in("topic_name", filters.topicNames);
        
        if (topicBridges && topicBridges.length > 0) {
          // Get course IDs that have at least one of the selected topics
          const topicCourseIds = new Set(topicBridges.map(b => b.course_id).filter(Boolean) as string[]);
          courseIdFilters = topicCourseIds;
        } else {
          // No courses match the topic filter
          return [];
        }
      }

      // Filter by program using bridge table
      if (filters?.programId) {
        const { data: programBridges } = await supabase
          .from("bridge_cp(C-P)")
          .select("id_course")
          .eq("id_program", filters.programId);
        
        if (programBridges && programBridges.length > 0) {
          const programCourseIds = new Set(programBridges.map(b => b.id_course));
          
          if (courseIdFilters) {
            // AND logic: intersection with topic filter
            courseIdFilters = new Set([...courseIdFilters].filter(id => programCourseIds.has(id)));
            if (courseIdFilters.size === 0) return [];
          } else {
            courseIdFilters = programCourseIds;
          }
        } else {
          return [];
        }
      }

      // Filter by university using bridge table
      if (filters?.universityId) {
        const { data: uniBridges } = await supabase
          .from("bridge_course_uni(U-C)")
          .select("id_course")
          .eq("id_uni", filters.universityId);
        
        if (uniBridges && uniBridges.length > 0) {
          const uniCourseIds = new Set(uniBridges.map(b => b.id_course));
          
          if (courseIdFilters) {
            // AND logic: intersection
            courseIdFilters = new Set([...courseIdFilters].filter(id => uniCourseIds.has(id)));
            if (courseIdFilters.size === 0) return [];
          } else {
            courseIdFilters = uniCourseIds;
          }
        } else {
          return [];
        }
      }

      // Step 2: Build main query with remaining filters
      let query = supabase
        .from("Courses(C)")
        .select("*")
        .order("name_course");

      // Apply course ID filter from bridges (if any)
      if (courseIdFilters) {
        query = query.in("id_course", Array.from(courseIdFilters));
      }

      if (filters?.search) {
        query = query.or(`name_course.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%,topics.ilike.%${filters.search}%,professor_name.ilike.%${filters.search}%`);
      }

      if (filters?.language) {
        query = query.eq("language", filters.language);
      }

      if (filters?.level) {
        query = query.eq("ba_ma", filters.level);
      }

      if (filters?.term) {
        query = query.eq("term", filters.term);
      }

      if (filters?.ectsMin && filters.ectsMin > 0) {
        query = query.gte("ects", filters.ectsMin);
      }

      if (filters?.ectsMax && filters.ectsMax < 30) {
        query = query.lte("ects", filters.ectsMax);
      }

      if (filters?.examType) {
        query = query.eq("type_exam", filters.examType);
      }

      if (filters?.mandatoryOptional) {
        query = query.eq("mandatory_optional", filters.mandatoryOptional);
      }

      if (filters?.whichYear) {
        query = query.eq("which_year", filters.whichYear);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Course[];
    },
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Courses(C)")
        .select("*")
        .eq("id_course", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Course not found");
      return data as Course;
    },
    enabled: !!id,
  });
};

export const useCoursesByUniversity = (universityId: string) => {
  return useQuery({
    queryKey: ["courses", "university", universityId],
    queryFn: async () => {
      const { data: bridgeData, error: bridgeError } = await supabase
        .from("bridge_course_uni(U-C)")
        .select("id_course")
        .eq("id_uni", universityId);

      if (bridgeError) throw bridgeError;

      const courseIds = bridgeData.map((b) => b.id_course);

      if (courseIds.length === 0) return [];

      const { data, error } = await supabase
        .from("Courses(C)")
        .select("*")
        .in("id_course", courseIds)
        .order("name_course");

      if (error) throw error;
      return data as Course[];
    },
    enabled: !!universityId,
  });
};
