import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Program {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image: string | null;
}

export const usePrograms = (searchQuery?: string) => {
  return useQuery({
    queryKey: ["programs", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("Programs(P)")
        .select("*")
        .order("name");

      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Program[];
    },
  });
};

export const useProgram = (slug: string) => {
  return useQuery({
    queryKey: ["program", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Programs(P)")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Program not found");
      return data as Program;
    },
    enabled: !!slug,
  });
};

export interface ProgramWithLevel extends Program {
  level?: string | null;
}

export const useProgramsByUniversity = (universityId: string) => {
  return useQuery({
    queryKey: ["programs", "university", universityId],
    queryFn: async () => {
      const { data: bridgeData, error: bridgeError } = await supabase
        .from("bridge_up(U-P)")
        .select("id_program, level")
        .eq("id_uni", universityId);

      if (bridgeError) throw bridgeError;

      const programIds = bridgeData.map((b) => b.id_program).filter(Boolean);
      const levelMap = new Map(bridgeData.map(b => [b.id_program, b.level]));

      if (programIds.length === 0) return [];

      const { data, error } = await supabase
        .from("Programs(P)")
        .select("*")
        .in("id", programIds)
        .order("name");

      if (error) throw error;
      
      // Add level info to each program
      return (data as Program[]).map(p => ({
        ...p,
        level: levelMap.get(p.id) || null
      })) as ProgramWithLevel[];
    },
    enabled: !!universityId,
  });
};

export const useProgramCourses = (programId: string) => {
  return useQuery({
    queryKey: ["courses", "program", programId],
    queryFn: async () => {
      const { data: bridgeData, error: bridgeError } = await supabase
        .from("bridge_cp(C-P)")
        .select("id_course")
        .eq("id_program", programId);

      if (bridgeError) throw bridgeError;

      const courseIds = bridgeData.map((b) => b.id_course);

      if (courseIds.length === 0) return [];

      const { data, error } = await supabase
        .from("Courses(C)")
        .select("*")
        .in("id_course", courseIds)
        .order("name_course");

      if (error) throw error;
      return data;
    },
    enabled: !!programId,
  });
};
