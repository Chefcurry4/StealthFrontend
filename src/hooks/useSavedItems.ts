import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Saved Courses
export const useSavedCourses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["savedCourses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_saved_courses(US-C)")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useToggleSaveCourse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Must be logged in");

      // Check if already saved
      const { data: existing } = await supabase
        .from("user_saved_courses(US-C)")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (existing) {
        // Remove from saved
        const { error } = await supabase
          .from("user_saved_courses(US-C)")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
        return { action: "removed" };
      } else {
        // Add to saved
        const { error } = await supabase
          .from("user_saved_courses(US-C)")
          .insert({
            user_id: user.id,
            course_id: courseId,
          });

        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savedCourses"] });
      toast({
        title: data.action === "added" ? "Course saved!" : "Course removed",
        description: data.action === "added" 
          ? "You can view your saved courses in your profile" 
          : "Course removed from your saved list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save course",
        variant: "destructive",
      });
    },
  });
};

// Saved Labs
export const useSavedLabs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["savedLabs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_saved_labs(US-L)")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useToggleSaveLab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data: existing } = await supabase
        .from("user_saved_labs(US-L)")
        .select("id")
        .eq("user_id", user.id)
        .eq("lab_id", labId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_saved_labs(US-L)")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
        return { action: "removed" };
      } else {
        const { error } = await supabase
          .from("user_saved_labs(US-L)")
          .insert({
            user_id: user.id,
            lab_id: labId,
          });

        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savedLabs"] });
      toast({
        title: data.action === "added" ? "Lab saved!" : "Lab removed",
        description: data.action === "added" 
          ? "You can view your saved labs in your profile" 
          : "Lab removed from your saved list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save lab",
        variant: "destructive",
      });
    },
  });
};

// Saved Programs
export const useSavedPrograms = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["savedPrograms", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_saved_programs(US-P)")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useToggleSaveProgram = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data: existing } = await supabase
        .from("user_saved_programs(US-P)")
        .select("id")
        .eq("user_id", user.id)
        .eq("id_program", programId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_saved_programs(US-P)")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
        return { action: "removed" };
      } else {
        const { error } = await supabase
          .from("user_saved_programs(US-P)")
          .insert({
            user_id: user.id,
            id_program: programId,
          });

        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savedPrograms"] });
      toast({
        title: data.action === "added" ? "Program saved!" : "Program removed",
        description: data.action === "added" 
          ? "You can view your saved programs in your profile" 
          : "Program removed from your saved list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save program",
        variant: "destructive",
      });
    },
  });
};
