import { useState, useCallback } from "react";
import { SemesterPlan, SemesterPlanCourse } from "@/components/workbench/WorkbenchSemesterPlanner";

export const useWorkbenchSemesterPlan = () => {
  const [plan, setPlan] = useState<SemesterPlan | null>(null);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  const setSemesterPlan = useCallback((newPlan: SemesterPlan) => {
    setPlan(newPlan);
    setIsPlannerOpen(true); // Auto-open when plan is set
  }, []);

  const clearPlan = useCallback(() => {
    setPlan(null);
  }, []);

  const removeCourse = useCallback((semester: "winter" | "summer", courseId: string) => {
    setPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [semester]: prev[semester].filter(c => c.id_course !== courseId)
      };
    });
  }, []);

  const addCourse = useCallback((semester: "winter" | "summer", course: SemesterPlanCourse) => {
    setPlan(prev => {
      const current = prev || { winter: [], summer: [] };
      // Don't add duplicates
      if (current[semester].some(c => c.id_course === course.id_course)) {
        return current;
      }
      return {
        ...current,
        [semester]: [...current[semester], course]
      };
    });
  }, []);

  const togglePlanner = useCallback(() => {
    setIsPlannerOpen(prev => !prev);
  }, []);

  // Parse semester plan from AI response
  const parseSemesterPlanFromResponse = useCallback((content: string): SemesterPlan | null => {
    // Look for the special SEMESTER_PLAN marker in the response
    const planMatch = content.match(/<!--SEMESTER_PLAN:([\s\S]*?)-->/);
    if (planMatch) {
      try {
        const planData = JSON.parse(planMatch[1]);
        return {
          winter: planData.winter || [],
          summer: planData.summer || [],
          generated_at: new Date().toISOString(),
          title: planData.title
        };
      } catch (e) {
        console.error("Failed to parse semester plan from response:", e);
      }
    }
    return null;
  }, []);

  return {
    plan,
    isPlannerOpen,
    setIsPlannerOpen,
    setSemesterPlan,
    clearPlan,
    removeCourse,
    addCourse,
    togglePlanner,
    parseSemesterPlanFromResponse
  };
};
