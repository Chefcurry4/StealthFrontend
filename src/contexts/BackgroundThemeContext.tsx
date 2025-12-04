import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeId, ColorPalette } from '@/themes/types';
import { THEMES } from '@/themes/constants';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BackgroundThemeContextType {
  themeId: ThemeId;
  palette: ColorPalette;
  setBackgroundTheme: (id: ThemeId) => Promise<void>;
  isLoading: boolean;
}

const BackgroundThemeContext = createContext<BackgroundThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'background-theme';

export const BackgroundThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [themeId, setThemeId] = useState<ThemeId>(ThemeId.QUARTZ);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      setIsLoading(true);
      
      if (user) {
        // Load from database for authenticated users
        const { data, error } = await supabase
          .from('Users(US)')
          .select('background_theme')
          .eq('id', user.id)
          .single();
        
        if (!error && data?.background_theme) {
          const savedTheme = data.background_theme as ThemeId;
          if (Object.values(ThemeId).includes(savedTheme)) {
            setThemeId(savedTheme);
          }
        }
      } else {
        // Load from localStorage for guests
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && Object.values(ThemeId).includes(stored as ThemeId)) {
          setThemeId(stored as ThemeId);
        }
      }
      
      setIsLoading(false);
    };

    loadTheme();
  }, [user]);

  const setBackgroundTheme = useCallback(async (id: ThemeId) => {
    setThemeId(id);
    
    // Always save to localStorage
    localStorage.setItem(STORAGE_KEY, id);
    
    // Save to database if authenticated
    if (user) {
      await supabase
        .from('Users(US)')
        .update({ background_theme: id })
        .eq('id', user.id);
    }
  }, [user]);

  const palette = THEMES[themeId];

  return (
    <BackgroundThemeContext.Provider value={{ themeId, palette, setBackgroundTheme, isLoading }}>
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
