import { useState, useMemo, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SearchResult {
  messageId: string;
  messageIndex: number;
  role: "user" | "assistant";
  snippet: string;
  matchStart: number;
  matchEnd: number;
}

export const useConversationSearch = (messages: Message[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    messages.forEach((message, index) => {
      const content = message.content.toLowerCase();
      let searchPos = 0;
      
      while (searchPos < content.length) {
        const matchIndex = content.indexOf(query, searchPos);
        if (matchIndex === -1) break;
        
        // Get snippet around the match (50 chars before and after)
        const snippetStart = Math.max(0, matchIndex - 50);
        const snippetEnd = Math.min(message.content.length, matchIndex + query.length + 50);
        let snippet = message.content.substring(snippetStart, snippetEnd);
        
        // Add ellipsis if truncated
        if (snippetStart > 0) snippet = "..." + snippet;
        if (snippetEnd < message.content.length) snippet = snippet + "...";
        
        results.push({
          messageId: message.id,
          messageIndex: index,
          role: message.role,
          snippet,
          matchStart: matchIndex - snippetStart + (snippetStart > 0 ? 3 : 0),
          matchEnd: matchIndex - snippetStart + query.length + (snippetStart > 0 ? 3 : 0),
        });
        
        searchPos = matchIndex + 1;
      }
    });

    return results;
  }, [messages, searchQuery]);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
    setActiveResultIndex(0);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setActiveResultIndex(0);
  }, []);

  const goToNextResult = useCallback(() => {
    if (searchResults.length === 0) return;
    setActiveResultIndex((prev) => (prev + 1) % searchResults.length);
  }, [searchResults.length]);

  const goToPrevResult = useCallback(() => {
    if (searchResults.length === 0) return;
    setActiveResultIndex((prev) => 
      prev === 0 ? searchResults.length - 1 : prev - 1
    );
  }, [searchResults.length]);

  const activeResult = searchResults[activeResultIndex] || null;

  return {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    openSearch,
    closeSearch,
    searchResults,
    activeResultIndex,
    setActiveResultIndex,
    activeResult,
    goToNextResult,
    goToPrevResult,
    hasResults: searchResults.length > 0,
    resultCount: searchResults.length,
  };
};

export default useConversationSearch;