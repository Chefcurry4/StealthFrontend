import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTour } from '@/contexts/TourContext';
import { getTourStep } from './utils/tourStepDefinitions';
import { TourOverlay } from './TourOverlay';
import { TourMascot } from './TourMascot';
import { TourTooltip } from './TourTooltip';
import { TourProgressBar } from './TourProgressBar';
import { TourStepExecutor } from './TourStepExecutor';
import { WelcomeStep } from './steps/WelcomeStep';
import { CompletionStep } from './steps/CompletionStep';

export const InteractiveTour: React.FC = () => {
  const {
    isActive,
    currentStepIndex,
    totalSteps,
    isPaused,
    nextStep,
    prevStep,
    skipTour,
    pauseTour,
    resumeTour,
    completeTour,
  } = useTour();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [actionsCompleted, setActionsCompleted] = useState(false);

  const currentStep = getTourStep(currentStepIndex);

  // Update target element when step changes
  useEffect(() => {
    if (!currentStep?.targetSelector) {
      setTargetElement(null);
      return;
    }

    // Wait for navigation and DOM updates
    const findElement = () => {
      const element = document.querySelector(currentStep.targetSelector!) as HTMLElement;
      if (element) {
        setTargetElement(element);
        // Make sure element is visible
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetElement(null);
      }
    };

    // Try immediately and also after a delay to account for navigation
    findElement();
    const timer = setTimeout(findElement, 500);

    return () => clearTimeout(timer);
  }, [currentStep, currentStepIndex]);

  // Mark highlighted element
  useEffect(() => {
    if (targetElement) {
      targetElement.classList.add('tour-highlighted');
      targetElement.style.position = 'relative';
      targetElement.style.zIndex = '9999';
      
      return () => {
        targetElement.classList.remove('tour-highlighted');
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
      };
    }
  }, [targetElement]);

  // Reset actions completed when step changes
  useEffect(() => {
    setActionsCompleted(false);
  }, [currentStepIndex]);

  if (!isActive || !currentStep) {
    return null;
  }

  // Special steps
  if (currentStep.id === 'welcome') {
    return <WelcomeStep onAutoAdvance={nextStep} duration={currentStep.duration} />;
  }

  if (currentStep.id === 'completion') {
    return <CompletionStep onComplete={completeTour} />;
  }

  const getMascotPosition = () => {
    if (currentStep.position) {
      return currentStep.position as 'center' | 'bottom-left' | 'bottom-right' | 'top-right';
    }
    
    // Default position based on target element position
    if (!targetElement) {
      return 'bottom-right';
    }

    const rect = targetElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    if (rect.top < viewportHeight / 2) {
      return 'bottom-right';
    } else {
      return 'top-right';
    }
  };

  const handleTogglePause = () => {
    if (isPaused) {
      resumeTour();
    } else {
      pauseTour();
    }
  };

  return (
    <AnimatePresence>
      {/* Step executor for actions */}
      {!actionsCompleted && currentStep.actions && (
        <TourStepExecutor
          actions={currentStep.actions}
          onComplete={() => setActionsCompleted(true)}
        />
      )}

      {/* Overlay with spotlight */}
      <TourOverlay
        isVisible={!isPaused}
        targetElement={targetElement}
      />

      {/* Progress bar */}
      <TourProgressBar
        currentStep={currentStepIndex}
        totalSteps={totalSteps}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
      />

      {/* Mascot guide */}
      <TourMascot
        message={currentStep.mascotMessage}
        position={getMascotPosition()}
        isExcited={currentStep.id === 'workbench-drag-demo'}
      />

      {/* Tooltip with navigation */}
      {actionsCompleted && (
        <TourTooltip
          title={currentStep.title}
          description={currentStep.description}
          targetElement={targetElement}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
          canGoPrev={currentStepIndex > 0}
          canGoNext={true}
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
        />
      )}
    </AnimatePresence>
  );
};
