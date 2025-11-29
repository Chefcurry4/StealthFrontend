import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useEmailDrafts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["email-drafts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("email_drafts")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateEmailDraft = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subject, body, recipient, aiGenerated = false }: {
      subject: string;
      body: string;
      recipient: string;
      aiGenerated?: boolean;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("email_drafts")
        .insert({
          user_id: user.id,
          subject,
          body,
          recipient,
          ai_generated: aiGenerated,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-drafts"] });
    },
  });
};

export const useUpdateEmailDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, subject, body, recipient }: {
      id: string;
      subject?: string;
      body?: string;
      recipient?: string;
    }) => {
      const { data, error } = await supabase
        .from("email_drafts")
        .update({ subject, body, recipient, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-drafts"] });
    },
  });
};

export const useDeleteEmailDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("email_drafts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-drafts"] });
    },
  });
};
