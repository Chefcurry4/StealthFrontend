import { useMemo } from "react";
import { CourseWithDetails, SemesterAnalytics } from "@/types/diary";

export const useDiaryAnalytics = (courses: CourseWithDetails[]): SemesterAnalytics => {
  return useMemo(() => {
    const analytics: SemesterAnalytics = {
      totalEcts: 0,
      examTypes: { written: 0, oral: 0, duringSemester: 0, other: 0 },
      levels: { bachelor: 0, master: 0 },
      terms: { winter: 0, summer: 0 },
      topics: [],
      software: [],
    };

    const topicsSet = new Set<string>();
    const softwareSet = new Set<string>();

    courses.forEach((course) => {
      // ECTS
      if (course.ects) {
        analytics.totalEcts += course.ects;
      }

      // Exam types
      const examType = course.type_exam?.toLowerCase() || "";
      if (examType.includes("written") || examType.includes("écrit")) {
        analytics.examTypes.written++;
      } else if (examType.includes("oral")) {
        analytics.examTypes.oral++;
      } else if (examType.includes("semester") || examType.includes("during")) {
        analytics.examTypes.duringSemester++;
      } else {
        analytics.examTypes.other++;
      }

      // Levels
      const level = course.ba_ma?.toLowerCase() || "";
      if (level.includes("ba") || level.includes("bachelor")) {
        analytics.levels.bachelor++;
      } else if (level.includes("ma") || level.includes("master")) {
        analytics.levels.master++;
      }

      // Terms
      const term = course.term?.toLowerCase() || "";
      if (term.includes("winter") || term.includes("fall") || term.includes("autumn")) {
        analytics.terms.winter++;
      } else if (term.includes("summer") || term.includes("spring")) {
        analytics.terms.summer++;
      }

      // Topics
      if (course.topics) {
        const courseTopics = course.topics.split(/[,;]/).map((t) => t.trim()).filter(Boolean);
        courseTopics.forEach((topic) => topicsSet.add(topic));
      }

      // Software
      if (course.software_equipment) {
        const courseSoftware = course.software_equipment.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
        courseSoftware.forEach((software) => softwareSet.add(software));
      }
    });

    analytics.topics = Array.from(topicsSet);
    analytics.software = Array.from(softwareSet);

    return analytics;
  }, [courses]);
};
