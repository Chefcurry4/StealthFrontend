import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Topic {
  id_topic: string;
  topic_name: string;
  descriptions: string | null;
}

export const useTopics = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Topics(TOP)")
        .select("*")
        .order("topic_name");

      if (error) throw error;
      return data as Topic[];
    },
  });
};

export const useCourseTopics = (courseId: string) => {
  return useQuery({
    queryKey: ["course-topics", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bridge_topc(TOP-C)")
        .select("topic_name, topic_id")
        .eq("course_id", courseId);

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
};

export const useLabTopics = (labId: string) => {
  return useQuery({
    queryKey: ["lab-topics", labId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bridge_topl(TOP-L)")
        .select("topic_name, uuid_topic")
        .eq("uuid_lab", labId);

      if (error) throw error;
      return data;
    },
    enabled: !!labId,
  });
};
