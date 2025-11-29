import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useLearningAgreements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["learningAgreements", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("Learning_agreements(LA)")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useLearningAgreement = (id: string) => {
  return useQuery({
    queryKey: ["learningAgreement", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Learning_agreements(LA)")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useLearningAgreementCourses = (agreementId: string) => {
  return useQuery({
    queryKey: ["learningAgreementCourses", agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_agreement_courses")
        .select(`
          *,
          course:Courses(C)(*)
        `)
        .eq("agreement_id", agreementId);

      if (error) throw error;
      return data;
    },
    enabled: !!agreementId,
  });
};

export const useCreateLearningAgreement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      agreement_type: string;
      university_id?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data: agreement, error } = await supabase
        .from("Learning_agreements(LA)")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return agreement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningAgreements"] });
      toast({
        title: "Learning agreement created!",
        description: "You can now add courses to your agreement",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create learning agreement",
        variant: "destructive",
      });
    },
  });
};

export const useAddCourseToAgreement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { agreement_id: string; course_id: string }) => {
      const { error } = await supabase
        .from("learning_agreement_courses")
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningAgreementCourses"] });
      toast({
        title: "Course added!",
        description: "Course added to your learning agreement",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add course",
        variant: "destructive",
      });
    },
  });
};

export const useRemoveCourseFromAgreement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("learning_agreement_courses")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningAgreementCourses"] });
      toast({
        title: "Course removed",
        description: "Course removed from learning agreement",
      });
    },
  });
};

export const useDeleteLearningAgreement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("Learning_agreements(LA)")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningAgreements"] });
      toast({
        title: "Learning agreement deleted",
      });
    },
  });
};
