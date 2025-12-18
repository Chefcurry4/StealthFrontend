import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DiaryNotebook } from "@/types/diary";

export const useDiaryNotebooks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["diary-notebooks", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("diary_notebooks")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as DiaryNotebook[];
    },
    enabled: !!user,
  });
};

export const useCreateDiaryNotebook = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string = "My Semester Planner") => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("diary_notebooks")
        .insert({ user_id: user.id, name })
        .select()
        .single();

      if (error) throw error;
      return data as DiaryNotebook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-notebooks"] });
    },
  });
};

export const useUpdateDiaryNotebook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("diary_notebooks")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as DiaryNotebook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-notebooks"] });
    },
  });
};

export const useDeleteDiaryNotebook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("diary_notebooks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-notebooks"] });
    },
  });
};
