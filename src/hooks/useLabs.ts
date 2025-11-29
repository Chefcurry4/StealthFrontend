import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Lab {
  id_lab: string;
  name: string;
  slug: string | null;
  description: string | null;
  professors: string | null;
  topics: string | null;
  faculty_match: string | null;
  link: string | null;
  image: string | null;
}

export interface LabFilters {
  search?: string;
  universityId?: string;
  facultyArea?: string;
}

export const useLabs = (filters?: LabFilters) => {
  return useQuery({
    queryKey: ["labs", filters],
    queryFn: async () => {
      let query = supabase
        .from("Labs(L)")
        .select("*")
        .order("name");

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,topics.ilike.%${filters.search}%`);
      }

      if (filters?.universityId) {
        const { data: bridgeData } = await supabase
          .from("bridge_ul(U-L)")
          .select("id_lab")
          .eq("id_uni", filters.universityId);
        
        if (bridgeData && bridgeData.length > 0) {
          const labIds = bridgeData.map(b => b.id_lab).filter(Boolean);
          query = query.in("id_lab", labIds);
        } else {
          return [];
        }
      }

      if (filters?.facultyArea) {
        query = query.ilike("faculty_match", `%${filters.facultyArea}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Lab[];
    },
  });
};

export const useLab = (slug: string) => {
  return useQuery({
    queryKey: ["lab", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Labs(L)")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Lab not found");
      return data as Lab;
    },
    enabled: !!slug,
  });
};

export const useLabsByUniversity = (universityId: string) => {
  return useQuery({
    queryKey: ["labs", "university", universityId],
    queryFn: async () => {
      const { data: bridgeData, error: bridgeError } = await supabase
        .from("bridge_ul(U-L)")
        .select("id_lab")
        .eq("id_uni", universityId);

      if (bridgeError) throw bridgeError;

      const labIds = bridgeData.map((b) => b.id_lab).filter(Boolean);

      if (labIds.length === 0) return [];

      const { data, error } = await supabase
        .from("Labs(L)")
        .select("*")
        .in("id_lab", labIds)
        .order("name");

      if (error) throw error;
      return data as Lab[];
    },
    enabled: !!universityId,
  });
};

export const useUniversitiesByLab = (labId: string) => {
  return useQuery({
    queryKey: ["universities", "lab", labId],
    queryFn: async () => {
      const { data: bridgeData, error: bridgeError } = await supabase
        .from("bridge_ul(U-L)")
        .select("id_uni")
        .eq("id_lab", labId);

      if (bridgeError) throw bridgeError;

      const universityIds = bridgeData.map((b) => b.id_uni).filter(Boolean);

      if (universityIds.length === 0) return [];

      const { data, error } = await supabase
        .from("Universities(U)")
        .select("*")
        .in("uuid", universityIds)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!labId,
  });
};
