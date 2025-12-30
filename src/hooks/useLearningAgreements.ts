// Learning Agreements feature - Coming soon
// This hook is a placeholder for future functionality

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Placeholder types
export interface LearningAgreement {
  id: string;
  title: string;
  description?: string;
  agreement_type: string;
  status?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useLearningAgreements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["learningAgreements", user?.id],
    queryFn: async (): Promise<LearningAgreement[]> => {
      // Feature not yet implemented - return empty array
      return [];
    },
    enabled: !!user,
  });
};

export const useLearningAgreement = (id: string) => {
  return useQuery({
    queryKey: ["learningAgreement", id],
    queryFn: async (): Promise<LearningAgreement | null> => {
      // Feature not yet implemented
      return null;
    },
    enabled: !!id,
  });
};

export const useLearningAgreementCourses = (agreementId: string) => {
  return useQuery({
    queryKey: ["learningAgreementCourses", agreementId],
    queryFn: async () => {
      // Feature not yet implemented
      return [];
    },
    enabled: !!agreementId,
  });
};

export const useCreateLearningAgreement = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      agreement_type: string;
      university_id?: string;
    }) => {
      // Feature not yet implemented
      toast({
        title: "Coming Soon",
        description: "Learning Agreements feature will be available in a future update.",
      });
      throw new Error("Feature not yet implemented");
    },
  });
};

export const useAddCourseToAgreement = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { agreement_id: string; course_id: string }) => {
      toast({
        title: "Coming Soon",
        description: "This feature will be available in a future update.",
      });
      throw new Error("Feature not yet implemented");
    },
  });
};

export const useRemoveCourseFromAgreement = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      throw new Error("Feature not yet implemented");
    },
  });
};

export const useDeleteLearningAgreement = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      throw new Error("Feature not yet implemented");
    },
  });
};
