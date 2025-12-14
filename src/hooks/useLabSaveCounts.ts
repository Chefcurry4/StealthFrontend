import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LabSaveCount {
  lab_id: string;
  save_count: number;
}

export const useLabSaveCounts = () => {
  return useQuery({
    queryKey: ["lab-save-counts"],
    queryFn: async () => {
      // Fetch all saved labs and count them per lab_id
      const { data, error } = await supabase
        .from("user_saved_labs(US-L)")
        .select("lab_id");

      if (error) throw error;

      // Count saves per lab_id
      const counts: Record<string, number> = {};
      data?.forEach((row) => {
        if (row.lab_id) {
          counts[row.lab_id] = (counts[row.lab_id] || 0) + 1;
        }
      });

      return counts;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
