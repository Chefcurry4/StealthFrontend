import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useCourseNotes = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["courseNotes", courseId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_saved_courses(US-C)")
        .select("id, note, created_at")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!courseId,
  });
};

export const useUpdateCourseNotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, note }: { courseId: string; note: string }) => {
      if (!user) throw new Error("Must be logged in");

      // Check if entry exists
      const { data: existing } = await supabase
        .from("user_saved_courses(US-C)")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("user_saved_courses(US-C)")
          .update({ note })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new entry with note
        const { error } = await supabase
          .from("user_saved_courses(US-C)")
          .insert({
            user_id: user.id,
            course_id: courseId,
            note,
          });

        if (error) throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseNotes"] });
      queryClient.invalidateQueries({ queryKey: ["savedCourses"] });
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save notes",
        variant: "destructive",
      });
    },
  });
};
