import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SemesterPlanCourse {
  id_course: string;
  name_course: string;
  code?: string;
  ects?: number;
  type_exam?: string;
  ba_ma?: string;
  professor_name?: string;
  topics?: string;
  term?: string;
}

export interface SemesterPlan {
  id: string;
  user_id: string;
  name: string;
  semester_type: "winter" | "summer";
  courses: SemesterPlanCourse[];
  total_ects: number;
  created_at: string;
  updated_at: string;
}

const MAX_PLANS = 10;

export const useSemesterPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["semesterPlans", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_semester_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse courses JSONB and ensure correct types
      return (data || []).map(plan => ({
        ...plan,
        semester_type: plan.semester_type as "winter" | "summer",
        courses: (plan.courses as unknown as SemesterPlanCourse[]) || []
      })) as SemesterPlan[];
    },
    enabled: !!user,
  });
};

export const useCreateSemesterPlan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      name, 
      semester_type, 
      courses 
    }: { 
      name: string; 
      semester_type: "winter" | "summer"; 
      courses: SemesterPlanCourse[] 
    }) => {
      if (!user) throw new Error("Must be logged in");

      // Check if user has reached the limit
      const { count } = await supabase
        .from("user_semester_plans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (count !== null && count >= MAX_PLANS) {
        throw new Error(`Maximum of ${MAX_PLANS} semester plans reached. Delete one to create a new one.`);
      }

      const total_ects = courses.reduce((sum, c) => sum + (c.ects || 0), 0);

      const { data, error } = await supabase
        .from("user_semester_plans")
        .insert({
          user_id: user.id,
          name,
          semester_type,
          courses: JSON.parse(JSON.stringify(courses)),
          total_ects
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesterPlans"] });
      toast.success("Semester plan saved!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save semester plan");
    },
  });
};

export const useUpdateSemesterPlan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      name, 
      courses 
    }: { 
      id: string; 
      name?: string; 
      courses?: SemesterPlanCourse[] 
    }) => {
      if (!user) throw new Error("Must be logged in");

      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (courses !== undefined) {
        updates.courses = courses as unknown as Record<string, unknown>[];
        updates.total_ects = courses.reduce((sum, c) => sum + (c.ects || 0), 0);
      }

      const { data, error } = await supabase
        .from("user_semester_plans")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesterPlans"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update semester plan");
    },
  });
};

export const useDeleteSemesterPlan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("user_semester_plans")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesterPlans"] });
      toast.success("Semester plan deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete semester plan");
    },
  });
};

// Helper to save AI-generated plan with courses from both semesters
export const useSaveAIPlan = () => {
  const createPlan = useCreateSemesterPlan();
  
  return useMutation({
    mutationFn: async ({ 
      name, 
      winterCourses, 
      summerCourses 
    }: { 
      name: string; 
      winterCourses: SemesterPlanCourse[]; 
      summerCourses: SemesterPlanCourse[] 
    }) => {
      const results = [];
      
      if (winterCourses.length > 0) {
        const winter = await createPlan.mutateAsync({
          name: `${name} (Winter)`,
          semester_type: "winter",
          courses: winterCourses
        });
        results.push(winter);
      }
      
      if (summerCourses.length > 0) {
        const summer = await createPlan.mutateAsync({
          name: `${name} (Summer)`,
          semester_type: "summer",
          courses: summerCourses
        });
        results.push(summer);
      }
      
      return results;
    }
  });
};
