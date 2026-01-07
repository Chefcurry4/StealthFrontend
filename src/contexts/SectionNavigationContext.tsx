/**
 * In-Session Section Navigation Context
 * 
 * This context maintains an IN-MEMORY ONLY map of the last visited route per top-level section.
 * When users click a section in the top nav, they're restored to their last visited nested route.
 * 
 * IMPORTANT: This state is intentionally NOT persisted to localStorage, sessionStorage, cookies,
 * indexedDB, or server. It resets when the tab/app is closed or hard refreshed.
 */

import { createContext, useContext, useCallback, useRef, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

// Define the top-level sections and their root routes
const SECTION_ROOTS: Record<string, string> = {
  "/": "/",
  "/universities": "/universities",
  "/courses": "/courses",
  "/labs": "/labs",
  "/workbench": "/workbench",
  "/diary": "/diary",
  "/profile": "/profile",
  "/auth": "/auth",
  "/statistics": "/statistics",
  "/help": "/help",
};

// Get the section key from a full path
const getSectionFromPath = (pathname: string): string | null => {
  // Check for exact match first (e.g., "/")
  if (pathname === "/") return "/";
  
  // Find the matching section root
  for (const root of Object.keys(SECTION_ROOTS)) {
    if (root !== "/" && pathname.startsWith(root)) {
      return root;
    }
  }
  
  return null;
};

interface SectionNavigationContextType {
  /**
   * Get the last visited route for a section.
   * Returns the full path with query and hash if available, otherwise null.
   */
  getLastRouteForSection: (sectionRoot: string) => string | null;
  
  /**
   * Get the navigation target for a section.
   * Returns the last visited route if available and valid, otherwise the section root.
   */
  getNavigationTarget: (sectionRoot: string) => string;
}

const SectionNavigationContext = createContext<SectionNavigationContextType | null>(null);

export const useSectionNavigation = () => {
  const context = useContext(SectionNavigationContext);
  if (!context) {
    throw new Error("useSectionNavigation must be used within a SectionNavigationProvider");
  }
  return context;
};

interface SectionNavigationProviderProps {
  children: ReactNode;
}

export const SectionNavigationProvider = ({ children }: SectionNavigationProviderProps) => {
  const location = useLocation();
  
  // In-memory only storage - resets on close/refresh
  // Using useRef to maintain state across renders without causing re-renders
  const lastRouteBySection = useRef<Record<string, string>>({});

  // Track route changes and update the section map
  useEffect(() => {
    const fullPath = location.pathname + location.search + location.hash;
    const section = getSectionFromPath(location.pathname);
    
    if (section) {
      // Store the full path (with query params and hash) for this section
      lastRouteBySection.current[section] = fullPath;
    }
  }, [location.pathname, location.search, location.hash]);

  const getLastRouteForSection = useCallback((sectionRoot: string): string | null => {
    return lastRouteBySection.current[sectionRoot] || null;
  }, []);

  const getNavigationTarget = useCallback((sectionRoot: string): string => {
    const lastRoute = lastRouteBySection.current[sectionRoot];
    
    // If we have a stored route, return it
    // Note: We can't validate if the route still exists without navigation,
    // but React Router will handle 404s gracefully
    if (lastRoute && lastRoute !== sectionRoot) {
      return lastRoute;
    }
    
    // Fall back to section root
    return sectionRoot;
  }, []);

  return (
    <SectionNavigationContext.Provider
      value={{
        getLastRouteForSection,
        getNavigationTarget,
      }}
    >
      {children}
    </SectionNavigationContext.Provider>
  );
};
