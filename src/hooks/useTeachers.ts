import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Teacher {
  id_teacher: string;
  name: string | null;
  full_name: string | null;
  email: string | null;
  "h-index": string | null;
  citations: string | null;
  topics: string[] | null;
}

export const useTeachers = (searchQuery?: string) => {
  return useQuery({
    queryKey: ["teachers", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("Teachers(T)")
        .select("*")
        .order("full_name");

      if (searchQuery && searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Teacher[];
    },
  });
};

export const useTeacher = (id: string) => {
  return useQuery({
    queryKey: ["teacher", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Teachers(T)")
        .select("*")
        .eq("id_teacher", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Teacher not found");
      return data as Teacher;
    },
    enabled: !!id,
  });
};

export const useTeacherCourses = (teacherId: string) => {
  return useQuery({
    queryKey: ["courses", "teacher", teacherId],
    queryFn: async () => {
      // First get teacher name to use for matching
      const { data: teacher, error: teacherError } = await supabase
        .from("Teachers(T)")
        .select("full_name, name")
        .eq("id_teacher", teacherId)
        .maybeSingle();

      if (teacherError) throw teacherError;
      if (!teacher) return [];

      // Get the teacher's last name for matching in bridge table
      const teacherName = teacher.name || teacher.full_name?.split(' ').pop() || '';
      
      if (!teacherName) return [];

      // Query bridge table by professor_name matching the teacher's name
      const { data: bridgeData, error: bridgeError } = await supabase
        .from("bridge_tc(T-C)")
        .select("id_course")
        .ilike("professor_name", `%${teacherName}%`);

      if (bridgeError) throw bridgeError;

      const courseIds = [...new Set(bridgeData.map((b) => b.id_course))];

      if (courseIds.length === 0) return [];

      const { data, error } = await supabase
        .from("Courses(C)")
        .select("*")
        .in("id_course", courseIds)
        .order("name_course");

      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });
};

export const useTeachersByUniversity = (universityId: string) => {
  return useQuery({
    queryKey: ["teachers", "university", universityId],
    queryFn: async () => {
      const { data: bridgeData, error: bridgeError } = await supabase
        .from("bridge_ut(U-T)")
        .select("id_teacher")
        .eq("id_uni", universityId);

      if (bridgeError) throw bridgeError;

      const teacherIds = bridgeData.map((b) => b.id_teacher);

      if (teacherIds.length === 0) return [];

      const { data, error } = await supabase
        .from("Teachers(T)")
        .select("*")
        .in("id_teacher", teacherIds)
        .order("full_name");

      if (error) throw error;
      return data as Teacher[];
    },
    enabled: !!universityId,
  });
};

export const useTeacherIdByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["teacher-id", "course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bridge_tc(T-C)")
        .select("id_teacher")
        .eq("id_course", courseId)
        .maybeSingle();

      if (error) throw error;
      return data?.id_teacher || null;
    },
    enabled: !!courseId,
  });
};
