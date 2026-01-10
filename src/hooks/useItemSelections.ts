import { useState } from "react";

/**
 * Custom hook for managing multi-selection of items (courses, labs, documents)
 * Provides state and toggle functions for each item type
 */
export function useItemSelections() {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const toggleLab = (labId: string) => {
    setSelectedLabs(prev => 
      prev.includes(labId) ? prev.filter(id => id !== labId) : [...prev, labId]
    );
  };

  const toggleDoc = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const clearAllSelections = () => {
    setSelectedCourses([]);
    setSelectedLabs([]);
    setSelectedDocs([]);
  };

  return {
    selectedCourses,
    selectedLabs,
    selectedDocs,
    setSelectedCourses,
    setSelectedLabs,
    setSelectedDocs,
    toggleCourse,
    toggleLab,
    toggleDoc,
    clearAllSelections,
  };
}
