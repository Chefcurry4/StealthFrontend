import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DiaryLabCommunication } from "@/types/diary";

export const useDiaryLabComms = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["diary-lab-comms", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("diary_lab_communications")
        .select(`
          *,
          lab:lab_id (
            id_lab,
            name,
            slug,
            topics,
            professors
          ),
          email_draft:email_draft_id (
            id,
            subject,
            body,
            recipient
          )
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateDiaryLabComm = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      labId,
      emailDraftId,
      status = "draft",
      notes,
    }: {
      labId: string;
      emailDraftId?: string;
      status?: DiaryLabCommunication["status"];
      notes?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("diary_lab_communications")
        .insert({
          user_id: user.id,
          lab_id: labId,
          email_draft_id: emailDraftId,
          status,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DiaryLabCommunication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-lab-comms"] });
    },
  });
};

export const useUpdateDiaryLabComm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<DiaryLabCommunication> & { id: string }) => {
      const { data, error } = await supabase
        .from("diary_lab_communications")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as DiaryLabCommunication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-lab-comms"] });
    },
  });
};

export const useDeleteDiaryLabComm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("diary_lab_communications")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-lab-comms"] });
    },
  });
};
