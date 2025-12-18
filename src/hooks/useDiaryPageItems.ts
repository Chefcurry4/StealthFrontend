import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DiaryPageItem } from "@/types/diary";

export const useDiaryPageItems = (pageId: string) => {
  return useQuery({
    queryKey: ["diary-page-items", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diary_page_items")
        .select("*")
        .eq("page_id", pageId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as DiaryPageItem[];
    },
    enabled: !!pageId,
  });
};

export const useCreateDiaryPageItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pageId,
      itemType,
      referenceId,
      content,
      positionX = 0,
      positionY = 0,
      width = 200,
      height = 100,
      color = "yellow",
      zone,
    }: {
      pageId: string;
      itemType: DiaryPageItem["item_type"];
      referenceId?: string;
      content?: string;
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
      color?: string;
      zone?: string;
    }) => {
      const { data, error } = await supabase
        .from("diary_page_items")
        .insert({
          page_id: pageId,
          item_type: itemType,
          reference_id: referenceId,
          content,
          position_x: positionX,
          position_y: positionY,
          width,
          height,
          color,
          zone,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DiaryPageItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diary-page-items", variables.pageId] });
    },
  });
};

export const useUpdateDiaryPageItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      pageId,
      ...updates
    }: Partial<DiaryPageItem> & { id: string; pageId: string }) => {
      const updateData: Record<string, any> = {};
      
      if (updates.position_x !== undefined) updateData.position_x = updates.position_x;
      if (updates.position_y !== undefined) updateData.position_y = updates.position_y;
      if (updates.width !== undefined) updateData.width = updates.width;
      if (updates.height !== undefined) updateData.height = updates.height;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.zone !== undefined) updateData.zone = updates.zone;
      if (updates.is_completed !== undefined) updateData.is_completed = updates.is_completed;

      const { data, error } = await supabase
        .from("diary_page_items")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as DiaryPageItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diary-page-items", variables.pageId] });
    },
  });
};

export const useDeleteDiaryPageItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pageId }: { id: string; pageId: string }) => {
      const { error } = await supabase
        .from("diary_page_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diary-page-items", variables.pageId] });
    },
  });
};
