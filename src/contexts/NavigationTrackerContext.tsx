import { createContext, useContext, useEffect, useRef, ReactNode, useCallback } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Use sessionStorage to persist across page refreshes within the session
const STORAGE_KEY = "nav_scroll_positions";
const STATE_STORAGE_KEY = "nav_page_states";

const getStoredPositions = (): Record<string, number> => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const getStoredStates = (): Record<string, any> => {
  try {
    const stored = sessionStorage.getItem(STATE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

interface NavigationContextType {
  saveScrollPosition: () => void;
  restoreScrollPosition: () => void;
  savePageState: (key: string, state: any) => void;
  getPageState: <T>(key: string) => T | undefined;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigationTracker = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigationTracker must be used within a NavigationTrackerProvider");
  }
  return context;
};

interface NavigationTrackerProviderProps {
  children: ReactNode;
}

export const NavigationTrackerProvider = ({ children }: NavigationTrackerProviderProps) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Record<string, number>>(getStoredPositions());
  const pageStates = useRef<Record<string, any>>(getStoredStates());
  const previousPath = useRef<string>("");
  const isRestoringScroll = useRef(false);

  const currentPath = location.pathname + location.search;

  // Save positions to sessionStorage
  const persistPositions = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scrollPositions.current));
    } catch {}
  }, []);

  const persistStates = useCallback(() => {
    try {
      sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(pageStates.current));
    } catch {}
  }, []);

  // Save current scroll position before navigating away
  useEffect(() => {
    const saveCurrentPosition = () => {
      if (!isRestoringScroll.current) {
        scrollPositions.current[currentPath] = window.scrollY;
        persistPositions();
      }
    };

    // Save position on scroll (debounced)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveCurrentPosition, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", saveCurrentPosition);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", saveCurrentPosition);
    };
  }, [currentPath, persistPositions]);

  // Handle navigation - save previous position and restore current
  useEffect(() => {
    // Save the previous page's scroll position
    if (previousPath.current && previousPath.current !== currentPath) {
      scrollPositions.current[previousPath.current] = window.scrollY;
      persistPositions();
    }

    // Restore scroll position for POP navigations (back/forward)
    // or if we have a saved position for this path
    const savedPosition = scrollPositions.current[currentPath];
    
    if (navigationType === "POP" && savedPosition !== undefined) {
      isRestoringScroll.current = true;
      // Use multiple RAF to ensure DOM is fully ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
          setTimeout(() => {
            isRestoringScroll.current = false;
          }, 100);
        });
      });
    } else if (navigationType === "PUSH") {
      // New navigation - scroll to top
      window.scrollTo(0, 0);
    }

    previousPath.current = currentPath;
  }, [currentPath, navigationType, persistPositions]);

  const saveScrollPosition = useCallback(() => {
    scrollPositions.current[currentPath] = window.scrollY;
    persistPositions();
  }, [currentPath, persistPositions]);

  const restoreScrollPosition = useCallback(() => {
    const savedPosition = scrollPositions.current[currentPath];
    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    }
  }, [currentPath]);

  const savePageState = useCallback((key: string, state: any) => {
    const fullKey = `${location.pathname}:${key}`;
    pageStates.current[fullKey] = state;
    persistStates();
  }, [location.pathname, persistStates]);

  const getPageState = useCallback(<T,>(key: string): T | undefined => {
    const fullKey = `${location.pathname}:${key}`;
    return pageStates.current[fullKey] as T | undefined;
  }, [location.pathname]);

  return (
    <NavigationContext.Provider
      value={{
        saveScrollPosition,
        restoreScrollPosition,
        savePageState,
        getPageState,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
