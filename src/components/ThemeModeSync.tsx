import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useBackgroundTheme } from '@/contexts/BackgroundThemeContext';

/**
 * Syncs the BackgroundTheme mode (day/night) with next-themes (light/dark).
 * This ensures Tailwind's .dark class is correctly applied/removed based on the user's
 * background theme selection, fixing styling issues where buttons appear black in day mode.
 */
export const ThemeModeSync = () => {
  const { mode } = useBackgroundTheme();
  const { setTheme } = useTheme();

  useEffect(() => {
    // Sync background theme mode with next-themes
    // day mode = light theme (no .dark class)
    // night mode = dark theme (.dark class applied)
    const nextTheme = mode === 'night' ? 'dark' : 'light';
    setTheme(nextTheme);
  }, [mode, setTheme]);

  return null;
};
