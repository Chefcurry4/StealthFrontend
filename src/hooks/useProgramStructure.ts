import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProgramStructure {
  id: string;
  program_id: string;
  total_credits: number;
  duration: string;
  contact_email: string | null;
  website: string | null;
  internship_note: string | null;
}

export interface ProgramSpecialization {
  id: string;
  program_id: string;
  code: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface ProgramCreditComponent {
  id: string;
  program_id: string;
  name: string;
  credits: number;
  color: string | null;
  sort_order: number;
}

export interface ProgramCourse {
  id: string;
  program_id: string;
  course_id: string | null;
  name: string;
  credits: number;
  category: string;
  specialization_codes: string[] | null;
  sort_order: number;
}

export interface ProgramMinor {
  id: string;
  program_id: string;
  name: string;
}

export interface FullProgramStructure {
  structure: ProgramStructure;
  specializations: ProgramSpecialization[];
  components: ProgramCreditComponent[];
  courses: ProgramCourse[];
  minors: ProgramMinor[];
}

export const useProgramStructure = (programId: string | undefined) => {
  return useQuery({
    queryKey: ["programStructure", programId],
    queryFn: async (): Promise<FullProgramStructure | null> => {
      if (!programId) return null;

      // Fetch structure
      const { data: structure, error: structureError } = await supabase
        .from("program_structures")
        .select("*")
        .eq("program_id", programId)
        .maybeSingle();

      if (structureError) throw structureError;
      if (!structure) return null;

      // Fetch all related data in parallel
      const [
        { data: specializations },
        { data: components },
        { data: courses },
        { data: minors },
      ] = await Promise.all([
        supabase
          .from("program_specializations")
          .select("*")
          .eq("program_id", programId)
          .order("sort_order"),
        supabase
          .from("program_credit_components")
          .select("*")
          .eq("program_id", programId)
          .order("sort_order"),
        supabase
          .from("program_courses")
          .select("*")
          .eq("program_id", programId)
          .order("sort_order"),
        supabase
          .from("program_minors")
          .select("*")
          .eq("program_id", programId),
      ]);

      return {
        structure: structure as ProgramStructure,
        specializations: (specializations || []) as ProgramSpecialization[],
        components: (components || []) as ProgramCreditComponent[],
        courses: (courses || []) as ProgramCourse[],
        minors: (minors || []) as ProgramMinor[],
      };
    },
    enabled: !!programId,
  });
};
