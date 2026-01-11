import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTour } from '@/contexts/TourContext';
import { getTourStep, tourSteps } from './utils/tourStepDefinitions';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { PandaIcon } from '@/components/icons/PandaIcon';

export const InteractiveTour: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isActive,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
  } = useTour();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const currentStep = getTourStep(currentStepIndex);

  // Handle navigation when step changes
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const handleStepNavigation = async () => {
      // Check if we need to navigate
      if (currentStep.route && location.pathname !== currentStep.route) {
        setIsNavigating(true);
        navigate(currentStep.route);
        // Wait for navigation to complete
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsNavigating(false);
      }
    };

    handleStepNavigation();
  }, [currentStepIndex, currentStep, isActive, navigate, location.pathname]);

  // Find target element after navigation
  useEffect(() => {
    if (!isActive || !currentStep?.targetSelector || isNavigating) {
      setTargetElement(null);
      return;
    }

    const findElement = () => {
      const element = document.querySelector(currentStep.targetSelector!) as HTMLElement;
      if (element) {
        setTargetElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetElement(null);
      }
    };

    // Try immediately and also after delays to account for rendering
    findElement();
    const timer1 = setTimeout(findElement, 300);
    const timer2 = setTimeout(findElement, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [currentStep, currentStepIndex, isActive, isNavigating, location.pathname]);

  // Mark highlighted element with visual indicators
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

  const handleNext = useCallback(() => {
    if (currentStepIndex >= totalSteps - 1) {
      completeTour();
    } else {
      nextStep();
    }
  }, [currentStepIndex, totalSteps, completeTour, nextStep]);

  if (!isActive || !currentStep) {
    return null;
  }

  // Welcome Step (step 0)
  if (currentStep.id === 'welcome') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-orange-500/20 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 20 }}
          className="text-center max-w-lg w-full"
        >
          {/* Panda Icon */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6 inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-orange-500 shadow-2xl"
          >
            <PandaIcon className="h-10 w-10 md:h-12 md:w-12 text-primary-foreground" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent"
          >
            Welcome to UniPandan!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground mb-8"
          >
            {currentStep.mascotMessage}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button onClick={handleNext} size="lg" className="gap-2">
              Start Tour
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button onClick={skipTour} variant="ghost" size="lg">
              Skip
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Completion Step (last step)
  if (currentStep.id === 'completion') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-orange-500/20 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 20 }}
          className="text-center max-w-lg w-full"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.6, repeat: 3, ease: 'easeInOut' }}
            className="mb-6 inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-orange-500 shadow-2xl"
          >
            <Sparkles className="h-12 w-12 md:h-16 md:w-16 text-primary-foreground" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            You're All Set! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground mb-8"
          >
            {currentStep.mascotMessage}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button onClick={completeTour} size="lg" className="gap-2">
              Get Started
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-3 rounded-lg bg-muted/50 inline-block"
          >
            <p className="text-sm text-muted-foreground">
              <strong>💡 Tip:</strong> Press <kbd className="px-2 py-0.5 rounded bg-background border text-xs">Ctrl+K</kbd> for quick search
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Regular tour steps with spotlight
  return (
    <AnimatePresence mode="wait">
      {/* Dark overlay with spotlight cutout */}
      <motion.div
        key={`overlay-${currentStepIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] pointer-events-none"
      >
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }}>
          <defs>
            <mask id="tour-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetElement && (
                <motion.rect
                  initial={false}
                  animate={{
                    x: targetElement.getBoundingClientRect().x - 8,
                    y: targetElement.getBoundingClientRect().y - 8,
                    width: targetElement.getBoundingClientRect().width + 16,
                    height: targetElement.getBoundingClientRect().height + 16,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>

        {/* Pulsing border around target */}
        {targetElement && (
          <motion.div
            className="absolute border-2 border-primary rounded-lg pointer-events-none"
            initial={false}
            animate={{
              left: targetElement.getBoundingClientRect().x - 8,
              top: targetElement.getBoundingClientRect().y - 8,
              width: targetElement.getBoundingClientRect().width + 16,
              height: targetElement.getBoundingClientRect().height + 16,
              boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.4)', '0 0 0 8px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.4)'],
            }}
            transition={{ 
              left: { duration: 0.3 }, 
              top: { duration: 0.3 }, 
              width: { duration: 0.3 }, 
              height: { duration: 0.3 },
              boxShadow: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            }}
          />
        )}
      </motion.div>

      {/* Progress bar at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[10002] bg-card/95 backdrop-blur-md border border-border rounded-full shadow-lg px-4 py-2 flex items-center gap-3"
      >
        <div className="w-32 md:w-48 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          {currentStepIndex + 1}/{totalSteps}
        </span>
      </motion.div>

      {/* Tooltip card */}
      <motion.div
        key={`tooltip-${currentStepIndex}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001] w-[90vw] max-w-md"
      >
        <div className="bg-card border-2 border-primary/30 rounded-xl shadow-2xl p-5">
          {/* Close button */}
          <button
            onClick={skipTour}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Mascot message */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
              <span className="text-xl">🐼</span>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStep.mascotMessage}
              </p>
            </div>
          </div>

          {/* Title and description */}
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-1">{currentStep.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStepIndex <= 0}
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="flex gap-1.5">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStepIndex
                      ? 'bg-primary w-6'
                      : index < currentStepIndex
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleNext} size="sm" className="h-9">
              {currentStepIndex >= totalSteps - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
