import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeId, ThemeMode, ColorPalette, ThemeModeConfig } from '@/themes/types';
import { THEMES } from '@/themes/constants';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BackgroundThemeContextType {
  themeId: ThemeId;
  mode: ThemeMode;
  palette: ColorPalette;
  modeConfig: ThemeModeConfig;
  setBackgroundTheme: (id: ThemeId) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
  isLoading: boolean;
}

const BackgroundThemeContext = createContext<BackgroundThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'background-theme';
const MODE_STORAGE_KEY = 'background-theme-mode';

export const BackgroundThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [themeId, setThemeId] = useState<ThemeId>(ThemeId.BASE);
  const [mode, setMode] = useState<ThemeMode>('day');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme and mode on mount
  useEffect(() => {
    const loadTheme = async () => {
      setIsLoading(true);
      
      if (user) {
        // Load from database for authenticated users
        const { data, error } = await supabase
          .from('Users(US)')
          .select('background_theme, background_theme_mode')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          if (data.background_theme && Object.values(ThemeId).includes(data.background_theme as ThemeId)) {
            setThemeId(data.background_theme as ThemeId);
          }
          if (data.background_theme_mode && ['day', 'night'].includes(data.background_theme_mode)) {
            setMode(data.background_theme_mode as ThemeMode);
          }
        }
      } else {
        // Load from localStorage for guests
        const storedTheme = localStorage.getItem(STORAGE_KEY);
        if (storedTheme && Object.values(ThemeId).includes(storedTheme as ThemeId)) {
          setThemeId(storedTheme as ThemeId);
        }
        const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
        if (storedMode && ['day', 'night'].includes(storedMode)) {
          setMode(storedMode as ThemeMode);
        }
      }
      
      setIsLoading(false);
    };

    loadTheme();
  }, [user]);

  const setBackgroundTheme = useCallback(async (id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem(STORAGE_KEY, id);
    
    if (user) {
      await supabase
        .from('Users(US)')
        .update({ background_theme: id })
        .eq('id', user.id);
    }
  }, [user]);

  const setThemeMode = useCallback(async (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
    
    if (user) {
      await supabase
        .from('Users(US)')
        .update({ background_theme_mode: newMode })
        .eq('id', user.id);
    }
  }, [user]);

  const toggleMode = useCallback(async () => {
    const newMode = mode === 'day' ? 'night' : 'day';
    await setThemeMode(newMode);
  }, [mode, setThemeMode]);

  const palette = THEMES[themeId];
  const modeConfig = palette[mode];

  return (
    <BackgroundThemeContext.Provider value={{ 
      themeId, 
      mode, 
      palette, 
      modeConfig, 
      setBackgroundTheme, 
      setThemeMode, 
      toggleMode, 
      isLoading 
    }}>
      {children}
    </BackgroundThemeContext.Provider>
  );
};

export const useBackgroundTheme = () => {
  const context = useContext(BackgroundThemeContext);
  if (!context) {
    throw new Error('useBackgroundTheme must be used within a BackgroundThemeProvider');
  }
  return context;
};
