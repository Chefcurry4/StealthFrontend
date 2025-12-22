import { useState, useCallback, useRef, useEffect } from "react";

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  swipeThreshold?: number;
  enabled?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  startDistance: number;
}

export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  swipeThreshold = 50,
  enabled = true,
}: TouchGestureOptions) => {
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    startDistance: 0,
  });
  
  const [swipeProgress, setSwipeProgress] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement | null>(null);

  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true,
      startDistance: e.touches.length >= 2 ? getDistance(e.touches) : 0,
    };
    setSwipeProgress({ x: 0, y: 0 });
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !touchState.current.isDragging) return;
    
    const touch = e.touches[0];
    touchState.current.currentX = touch.clientX;
    touchState.current.currentY = touch.clientY;
    
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    
    setSwipeProgress({ x: deltaX, y: deltaY });
    
    // Handle pinch
    if (e.touches.length >= 2 && onPinch && touchState.current.startDistance > 0) {
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / touchState.current.startDistance;
      onPinch(scale);
    }
  }, [enabled, onPinch]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !touchState.current.isDragging) return;
    
    const deltaX = touchState.current.currentX - touchState.current.startX;
    const deltaY = touchState.current.currentY - touchState.current.startY;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Determine if it's a horizontal or vertical swipe
    if (absX > absY && absX > swipeThreshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (absY > absX && absY > swipeThreshold) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
    
    touchState.current.isDragging = false;
    setSwipeProgress({ x: 0, y: 0 });
  }, [enabled, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const bind = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener("touchstart", handleTouchStart);
      elementRef.current.removeEventListener("touchmove", handleTouchMove);
      elementRef.current.removeEventListener("touchend", handleTouchEnd);
      elementRef.current.removeEventListener("touchcancel", handleTouchEnd);
    }
    
    elementRef.current = element;
    
    if (element) {
      element.addEventListener("touchstart", handleTouchStart, { passive: true });
      element.addEventListener("touchmove", handleTouchMove, { passive: true });
      element.addEventListener("touchend", handleTouchEnd, { passive: true });
      element.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener("touchstart", handleTouchStart);
        elementRef.current.removeEventListener("touchmove", handleTouchMove);
        elementRef.current.removeEventListener("touchend", handleTouchEnd);
        elementRef.current.removeEventListener("touchcancel", handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    bind,
    swipeProgress,
    isSwiping: touchState.current.isDragging,
  };
};

export default useTouchGestures;