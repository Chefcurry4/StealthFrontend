import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  type: "university" | "course" | "lab" | "teacher" | "program";
  title: string;
  subtitle?: string;
  href: string;
}

export const useGlobalSearch = (query: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < 2) {
      setResults([]);
      setIsTyping(false);
      setIsLoading(false);
      return;
    }

    // Show typing indicator immediately when user types
    setIsTyping(true);

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      setIsTyping(false);
      
      try {
        const searchPattern = `%${trimmedQuery}%`;
        
        // Parallel queries to all tables
        const [universities, courses, labs, teachers, programs] = await Promise.all([
          supabase
            .from("Universities(U)")
            .select("uuid, name, slug, country")
            .or(`name.ilike.${searchPattern},country.ilike.${searchPattern}`)
            .limit(5),
          supabase
            .from("Courses(C)")
            .select("id_course, name_course, code, ects, ba_ma")
            .or(`name_course.ilike.${searchPattern},code.ilike.${searchPattern},topics.ilike.${searchPattern}`)
            .limit(5),
          supabase
            .from("Labs(L)")
            .select("id_lab, name, slug, topics")
            .or(`name.ilike.${searchPattern},topics.ilike.${searchPattern},professors.ilike.${searchPattern}`)
            .limit(5),
          supabase
            .from("Teachers(T)")
            .select("id_teacher, full_name, name, email")
            .or(`full_name.ilike.${searchPattern},name.ilike.${searchPattern},email.ilike.${searchPattern}`)
            .limit(5),
          supabase
            .from("Programs(P)")
            .select("id, name, slug")
            .ilike("name", searchPattern)
            .limit(5),
        ]);

        const formattedResults: SearchResult[] = [];

        // Format universities
        if (universities.data) {
          universities.data.forEach((uni) => {
            formattedResults.push({
              id: uni.uuid,
              type: "university",
              title: uni.name,
              subtitle: uni.country || undefined,
              href: `/universities/${uni.slug}`,
            });
          });
        }

        // Format courses
        if (courses.data) {
          courses.data.forEach((course) => {
            formattedResults.push({
              id: course.id_course,
              type: "course",
              title: course.name_course,
              subtitle: `${course.code || ""} ${course.ects ? `• ${course.ects} ECTS` : ""} ${course.ba_ma ? `• ${course.ba_ma}` : ""}`.trim(),
              href: `/courses/${course.id_course}`,
            });
          });
        }

        // Format labs
        if (labs.data) {
          labs.data.forEach((lab) => {
            formattedResults.push({
              id: lab.id_lab,
              type: "lab",
              title: lab.name,
              subtitle: lab.topics?.slice(0, 50) || undefined,
              href: `/labs/${lab.slug}`,
            });
          });
        }

        // Format teachers
        if (teachers.data) {
          teachers.data.forEach((teacher) => {
            formattedResults.push({
              id: teacher.id_teacher,
              type: "teacher",
              title: teacher.full_name || teacher.name || "Unknown",
              subtitle: teacher.email || undefined,
              href: `#teacher-${teacher.id_teacher}`, // Will trigger popup
            });
          });
        }

        // Format programs - default to EPFL for now (TODO: look up proper university)
        if (programs.data) {
          programs.data.forEach((program) => {
            formattedResults.push({
              id: program.id,
              type: "program",
              title: program.name,
              href: `/programs/EPFL/${program.slug}`,
            });
          });
        }

        setResults(formattedResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      setIsTyping(false);
    };
  }, [query]);

  // Combine isTyping and isLoading for a unified "searching" state
  const isSearching = isTyping || isLoading;

  return { results, isLoading, isTyping, isSearching };
};
