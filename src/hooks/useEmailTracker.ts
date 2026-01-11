import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EmailTrackerItem {
  id: string;
  user_id: string;
  lab_id: string | null;
  email_draft_id: string | null;
  status: 'draft' | 'sent' | 'replied' | 'follow_up';
  sent_date: string | null;
  reply_received: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  lab?: {
    id_lab: string;
    name: string;
    slug: string | null;
    topics: string | null;
    professors: string | null;
  } | null;
  email_draft?: {
    id: string;
    subject: string | null;
    body: string | null;
    recipient: string | null;
  } | null;
}

export const useEmailTracker = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["email-tracker", user?.id],
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
      return data as EmailTrackerItem[];
    },
    enabled: !!user,
  });
};

export const useCreateEmailTrackerItem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      labId,
      emailDraftId,
      status = "draft",
      notes,
    }: {
      labId?: string;
      emailDraftId?: string;
      status?: EmailTrackerItem["status"];
      notes?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("diary_lab_communications")
        .insert({
          user_id: user.id,
          lab_id: labId || null,
          email_draft_id: emailDraftId || null,
          status,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data as EmailTrackerItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-tracker"] });
    },
  });
};

export const useUpdateEmailTrackerItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
      sent_date,
      reply_received,
    }: {
      id: string;
      status?: EmailTrackerItem["status"];
      notes?: string;
      sent_date?: string;
      reply_received?: boolean;
    }) => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (status !== undefined) updates.status = status;
      if (notes !== undefined) updates.notes = notes;
      if (sent_date !== undefined) updates.sent_date = sent_date;
      if (reply_received !== undefined) updates.reply_received = reply_received;

      const { data, error } = await supabase
        .from("diary_lab_communications")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as EmailTrackerItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-tracker"] });
    },
  });
};

export const useDeleteEmailTrackerItem = () => {
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
      queryClient.invalidateQueries({ queryKey: ["email-tracker"] });
    },
  });
};

// Export to CSV
export const exportEmailTrackerToCSV = (items: EmailTrackerItem[]) => {
  const headers = ["Lab Name", "Status", "Sent Date", "Reply Received", "Notes", "Created", "Updated"];
  const rows = items.map(item => [
    item.lab?.name || "N/A",
    item.status,
    item.sent_date ? new Date(item.sent_date).toLocaleDateString() : "Not sent",
    item.reply_received ? "Yes" : "No",
    item.notes || "",
    new Date(item.created_at).toLocaleDateString(),
    new Date(item.updated_at).toLocaleDateString(),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `email_tracker_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
