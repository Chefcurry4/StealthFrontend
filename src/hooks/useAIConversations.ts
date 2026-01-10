import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessageAttachment {
  id: string;
  name: string;
  type: string;
  content: string;
}

export interface AIMessageReferencedItem {
  type: 'course' | 'lab';
  data: {
    id: string;
    name: string;
    code?: string;
    ects?: number;
    description?: string;
    professor?: string;
    topics?: string;
    link?: string;
  };
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  attachments?: AIMessageAttachment[] | null;
  referenced_items?: AIMessageReferencedItem[] | null;
  feedback?: "positive" | "negative" | null;
  feedback_at?: string | null;
}

export const useAIConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ai-conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as AIConversation[];
    },
    enabled: !!user,
  });
};

export const useAIMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ["ai-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as unknown as AIMessage[];
    },
    enabled: !!conversationId,
  });
};

export const useCreateConversation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string = "New Conversation") => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AIConversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data, error } = await supabase
        .from("ai_conversations")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as AIConversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
  });
};

export const useSaveMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      role,
      content,
      attachments,
      referencedItems,
    }: {
      conversationId: string;
      role: "user" | "assistant";
      content: string;
      attachments?: AIMessageAttachment[];
      referencedItems?: AIMessageReferencedItem[];
    }) => {
      const { data, error } = await supabase
        .from("ai_messages")
        .insert({
          conversation_id: conversationId,
          role,
          content,
          attachments: attachments && attachments.length > 0 ? attachments : null,
          referenced_items: referencedItems && referencedItems.length > 0 ? referencedItems : null,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from("ai_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return data as unknown as AIMessage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai-messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
  });
};

export const useMessageFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, feedback }: { messageId: string; feedback: "positive" | "negative" }) => {
      const { error } = await supabase
        .from("ai_messages")
        .update({ 
          feedback,
          feedback_at: new Date().toISOString()
        })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidate messages query to refetch with new feedback
      queryClient.invalidateQueries({ queryKey: ["ai-messages"] });
    },
  });
};
