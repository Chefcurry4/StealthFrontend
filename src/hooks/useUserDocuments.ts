import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UserDocument {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export const useUserDocuments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-documents", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserDocument[];
    },
    enabled: !!user,
  });
};

export const useUploadDocument = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Must be logged in");

      // Upload to storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("user-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("user-documents")
        .getPublicUrl(filePath);

      // Save to database
      const { data, error } = await supabase
        .from("user_documents")
        .insert({
          user_id: user.id,
          name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-documents"] });
      toast.success("Document uploaded!");
    },
    onError: () => {
      toast.error("Failed to upload document");
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string }) => {
      // Extract file path from URL
      const urlParts = fileUrl.split("/user-documents/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("user-documents").remove([filePath]);
      }

      const { error } = await supabase
        .from("user_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-documents"] });
      toast.success("Document deleted!");
    },
    onError: () => {
      toast.error("Failed to delete document");
    },
  });
};
