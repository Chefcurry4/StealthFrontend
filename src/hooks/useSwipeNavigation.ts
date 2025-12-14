import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ROUTES = [
  '/universities',
  '/courses',
  '/labs',
];

export const useSwipeNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const getCurrentIndex = useCallback(() => {
    return NAV_ROUTES.findIndex(route => location.pathname.startsWith(route));
  }, [location.pathname]);

  const handleSwipe = useCallback(() => {
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    const minSwipeDistance = 80;
    
    // Only trigger if horizontal swipe is greater than vertical (to avoid conflicts with scrolling)
    if (Math.abs(deltaX) < minSwipeDistance || deltaY > Math.abs(deltaX) * 0.5) {
      return;
    }

    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) return;

    if (deltaX > 0 && currentIndex > 0) {
      // Swipe right - go to previous page
      navigate(NAV_ROUTES[currentIndex - 1]);
    } else if (deltaX < 0 && currentIndex < NAV_ROUTES.length - 1) {
      // Swipe left - go to next page
      navigate(NAV_ROUTES[currentIndex + 1]);
    }
  }, [getCurrentIndex, navigate]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].clientX;
      touchEndY.current = e.changedTouches[0].clientY;
      handleSwipe();
    };

    // Only add listeners on mobile
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleSwipe]);

  return {
    currentIndex: getCurrentIndex(),
    totalPages: NAV_ROUTES.length,
    routes: NAV_ROUTES,
  };
};
