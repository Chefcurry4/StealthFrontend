import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAICourseRecommendations = () => {
  return useMutation({
    mutationFn: async ({ userInterests, savedCourses, academicLevel }: {
      userInterests?: string;
      savedCourses?: any[];
      academicLevel?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-course-recommendations", {
        body: { userInterests, savedCourses, academicLevel },
      });

      if (error) throw error;
      return data;
    },
  });
};

export const useAIStudyAdvisor = () => {
  return useMutation({
    mutationFn: async ({ messages, userContext }: {
      messages: { role: string; content: string }[];
      userContext?: any;
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-study-advisor", {
        body: { messages, userContext },
      });

      if (error) throw error;
      return data;
    },
  });
};

export const useAIEmailDraft = () => {
  return useMutation({
    mutationFn: async ({ purpose, recipient, context }: {
      purpose: string;
      recipient: string;
      context?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("ai-email-draft", {
        body: { purpose, recipient, context },
      });

      if (error) throw error;
      return data;
    },
  });
};
