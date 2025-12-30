import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface NavigationState {
  scrollPositions: Map<string, number>;
  pageStates: Map<string, any>;
}

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
  const navigationState = useRef<NavigationState>({
    scrollPositions: new Map(),
    pageStates: new Map(),
  });
  const previousPath = useRef<string>("");

  // Save scroll position when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      navigationState.current.scrollPositions.set(
        location.pathname + location.search,
        window.scrollY
      );
    };

    // Save position of previous page before navigating
    if (previousPath.current && previousPath.current !== location.pathname + location.search) {
      navigationState.current.scrollPositions.set(previousPath.current, window.scrollY);
    }

    // Restore scroll position for current page if we have it
    const savedPosition = navigationState.current.scrollPositions.get(
      location.pathname + location.search
    );
    
    if (savedPosition !== undefined) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
      });
    }

    previousPath.current = location.pathname + location.search;

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [location.pathname, location.search]);

  const saveScrollPosition = () => {
    navigationState.current.scrollPositions.set(
      location.pathname + location.search,
      window.scrollY
    );
  };

  const restoreScrollPosition = () => {
    const savedPosition = navigationState.current.scrollPositions.get(
      location.pathname + location.search
    );
    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    }
  };

  const savePageState = (key: string, state: any) => {
    const fullKey = `${location.pathname}:${key}`;
    navigationState.current.pageStates.set(fullKey, state);
  };

  const getPageState = <T,>(key: string): T | undefined => {
    const fullKey = `${location.pathname}:${key}`;
    return navigationState.current.pageStates.get(fullKey) as T | undefined;
  };

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
