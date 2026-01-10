import { useState, useEffect, useRef, useMemo } from "react";
import { useTeachers, Teacher } from "@/hooks/useTeachers";

/**
 * Custom hook for teacher autocomplete functionality
 * Provides search, filtering, and selection logic for teacher recipients
 */
export function useTeacherAutocomplete() {
  const [recipientSearch, setRecipientSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<Teacher | null>(null);
  
  const recipientInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { data: allTeachers, isLoading: isLoadingTeachers } = useTeachers();

  // Smart matching - search through all teachers client-side
  const matchingTeachers = useMemo(() => {
    if (!allTeachers || recipientSearch.length < 2) return [];
    
    const searchLower = recipientSearch.toLowerCase();
    
    return allTeachers
      .filter(t => 
        t.full_name?.toLowerCase().includes(searchLower) ||
        t.name?.toLowerCase().includes(searchLower) ||
        t.email?.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => {
        const aName = (a.full_name || a.name || "").toLowerCase();
        const bName = (b.full_name || b.name || "").toLowerCase();
        const aStarts = aName.startsWith(searchLower);
        const bStarts = bName.startsWith(searchLower);
        if (aStarts && !bStarts) return -1;
        if (bStarts && !aStarts) return 1;
        return aName.localeCompare(bName);
      })
      .slice(0, 8);
  }, [allTeachers, recipientSearch]);

  // Show suggestions when user has typed enough and there are matches
  useEffect(() => {
    if (recipientSearch.length >= 2 && matchingTeachers.length > 0 && !selectedProfessor) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [recipientSearch, matchingTeachers.length, selectedProfessor]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          recipientInputRef.current && !recipientInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProfessor = (teacher: Teacher) => {
    setSelectedProfessor(teacher);
    setRecipientSearch(teacher.full_name || teacher.name || "");
    setShowSuggestions(false);
  };

  const handleClearProfessor = () => {
    setSelectedProfessor(null);
    setRecipientSearch("");
  };

  return {
    recipientSearch,
    setRecipientSearch,
    showSuggestions,
    setShowSuggestions,
    selectedProfessor,
    setSelectedProfessor,
    matchingTeachers,
    isLoadingTeachers,
    recipientInputRef,
    suggestionsRef,
    handleSelectProfessor,
    handleClearProfessor,
  };
}
