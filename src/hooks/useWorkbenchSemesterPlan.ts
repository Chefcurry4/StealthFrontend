import { useState, useCallback } from "react";
import { TempSemesterPlan, SemesterPlanCourse } from "@/components/workbench/WorkbenchSemesterPlanner";

export const useWorkbenchSemesterPlan = () => {
  const [tempPlan, setTempPlan] = useState<TempSemesterPlan | null>(null);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  const setTempSemesterPlan = useCallback((newPlan: TempSemesterPlan) => {
    setTempPlan(newPlan);
    setIsPlannerOpen(true); // Auto-open when plan is set
  }, []);

  const clearTempPlan = useCallback(() => {
    setTempPlan(null);
  }, []);

  const removeCourseFromTempPlan = useCallback((semester: "winter" | "summer", courseId: string) => {
    setTempPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [semester]: prev[semester].filter(c => c.id_course !== courseId)
      };
    });
  }, []);

  const addCourseToTempPlan = useCallback((semester: "winter" | "summer", course: SemesterPlanCourse) => {
    setTempPlan(prev => {
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
  const parseSemesterPlanFromResponse = useCallback((content: string): TempSemesterPlan | null => {
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
    tempPlan,
    isPlannerOpen,
    setIsPlannerOpen,
    setTempSemesterPlan,
    clearTempPlan,
    removeCourseFromTempPlan,
    addCourseToTempPlan,
    togglePlanner,
    parseSemesterPlanFromResponse
  };
};
