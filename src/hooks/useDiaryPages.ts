import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DiaryPage } from "@/types/diary";

export const useDiaryPages = (notebookId: string) => {
  return useQuery({
    queryKey: ["diary-pages", notebookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diary_pages")
        .select("*")
        .eq("notebook_id", notebookId)
        .order("page_number", { ascending: true });

      if (error) throw error;
      return data as DiaryPage[];
    },
    enabled: !!notebookId,
  });
};

export const useCreateDiaryPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notebookId,
      pageNumber,
      pageType = "semester_planner",
      title,
      semester,
    }: {
      notebookId: string;
      pageNumber: number;
      pageType?: DiaryPage["page_type"];
      title?: string;
      semester?: string;
    }) => {
      const { data, error } = await supabase
        .from("diary_pages")
        .insert({
          notebook_id: notebookId,
          page_number: pageNumber,
          page_type: pageType,
          title,
          semester,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DiaryPage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diary-pages", variables.notebookId] });
    },
  });
};

export const useUpdateDiaryPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      notebookId,
      ...updates
    }: Partial<DiaryPage> & { id: string; notebookId: string }) => {
      const { data, error } = await supabase
        .from("diary_pages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as DiaryPage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diary-pages", variables.notebookId] });
    },
  });
};

export const useDeleteDiaryPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notebookId }: { id: string; notebookId: string }) => {
      const { error } = await supabase
        .from("diary_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diary-pages", variables.notebookId] });
    },
  });
};

export const useReorderDiaryPages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pages, notebookId }: { pages: { id: string; page_number: number }[]; notebookId: string }) => {
      // Update each page's page_number
      for (const page of pages) {
        const { error } = await supabase
          .from("diary_pages")
          .update({ page_number: page.page_number })
          .eq("id", page.id);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diary-pages", variables.notebookId] });
    },
  });
};
