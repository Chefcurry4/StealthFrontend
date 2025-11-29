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
}

export interface CourseFilters {
  search?: string;
  universityId?: string;
  programId?: string;
  language?: string;
  level?: string;
  term?: string;
}

export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      let query = supabase
        .from("Courses(C)")
        .select("*")
        .order("name_course");

      if (filters?.search) {
        query = query.or(`name_course.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
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
