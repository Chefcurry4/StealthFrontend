import { useCallback } from 'react';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
};

export const useHaptic = () => {
  const trigger = useCallback((pattern: HapticPattern = 'light') => {
    // Check if vibration API is available
    if (!navigator.vibrate) {
      return;
    }

    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    
    try {
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      // Silently fail if vibration is not supported
    }
  }, []);

  return { trigger };
};
