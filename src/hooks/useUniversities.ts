import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface University {
  uuid: string;
  name: string;
  slug: string;
  country: string | null;
  country_code: string | null;
  website: string | null;
  logo_url: string | null;
  coordinates: any;
}

export const useUniversities = (searchQuery?: string) => {
  return useQuery({
    queryKey: ["universities", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("Universities(U)")
        .select("*")
        .order("name");

      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as University[];
    },
  });
};

export const useUniversity = (slug: string) => {
  return useQuery({
    queryKey: ["university", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Universities(U)")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("University not found");
      return data as University;
    },
    enabled: !!slug,
  });
};
