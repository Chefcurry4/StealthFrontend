import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TourContextValue {
  isActive: boolean;
  currentStepIndex: number;
  totalSteps: number;
  isPaused: boolean;
  hasCompleted: boolean;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  completeTour: () => void;
  goToStep: (index: number) => void;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // Total steps - will be updated based on step definitions
  const totalSteps = 13; // Updated based on the tour journey

  // Load tour progress on mount
  useEffect(() => {
    const loadTourProgress = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('Users(US)')
          .select('tour_progress, guide_completed')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading tour progress:', error);
          return;
        }

        if (data) {
          setHasCompleted(data.guide_completed || false);
          if (data.tour_progress && !data.guide_completed) {
            setCurrentStepIndex(data.tour_progress);
          }
        }
      } catch (err) {
        console.error('Error in loadTourProgress:', err);
      }
    };

    loadTourProgress();
  }, [user]);

  // Save tour progress to database
  const saveTourProgress = useCallback(async (stepIndex: number) => {
    if (!user) return;

    try {
      await supabase
        .from('Users(US)')
        .update({ tour_progress: stepIndex })
        .eq('id', user.id);
    } catch (err) {
      console.error('Error saving tour progress:', err);
    }
  }, [user]);

  // Keyboard controls
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case 'Escape':
          e.preventDefault();
          skipTour();
          break;
        case ' ':
          e.preventDefault();
          if (isPaused) {
            resumeTour();
          } else {
            pauseTour();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isPaused, currentStepIndex]);

  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
    setIsPaused(false);
    saveTourProgress(0);
  }, [saveTourProgress]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      saveTourProgress(newIndex);
    } else {
      completeTour();
    }
  }, [currentStepIndex, totalSteps, saveTourProgress]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      saveTourProgress(newIndex);
    }
  }, [currentStepIndex, saveTourProgress]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    // Don't mark as completed when skipping
  }, []);

  const pauseTour = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTour = useCallback(() => {
    setIsPaused(false);
  }, []);

  const completeTour = useCallback(async () => {
    setIsActive(false);
    setHasCompleted(true);
    
    if (user) {
      try {
        await supabase
          .from('Users(US)')
          .update({ 
            guide_completed: true,
            tour_progress: null 
          })
          .eq('id', user.id);
      } catch (err) {
        console.error('Error completing tour:', err);
      }
    }
  }, [user]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
      saveTourProgress(index);
    }
  }, [totalSteps, saveTourProgress]);

  const value: TourContextValue = {
    isActive,
    currentStepIndex,
    totalSteps,
    isPaused,
    hasCompleted,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    pauseTour,
    resumeTour,
    completeTour,
    goToStep,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};
