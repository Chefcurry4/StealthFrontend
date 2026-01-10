import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tooltipVariants } from './utils/tourAnimations';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TourTooltipProps {
  title: string;
  description: string;
  targetElement?: HTMLElement | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  currentStep: number;
  totalSteps: number;
}

export const TourTooltip: React.FC<TourTooltipProps> = ({
  title,
  description,
  targetElement,
  onNext,
  onPrev,
  onSkip,
  canGoPrev,
  canGoNext,
  currentStep,
  totalSteps
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');

  useEffect(() => {
    if (!targetElement) {
      // Center on screen if no target
      setPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2
      });
      setPlacement('bottom');
      return;
    }

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const offset = 20;

      let newPlacement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
      let newPosition = { top: 0, left: 0 };

      // Determine best placement
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      if (spaceBelow >= tooltipHeight + offset) {
        newPlacement = 'bottom';
        newPosition = {
          top: rect.bottom + offset,
          left: rect.left + rect.width / 2
        };
      } else if (spaceAbove >= tooltipHeight + offset) {
        newPlacement = 'top';
        newPosition = {
          top: rect.top - offset,
          left: rect.left + rect.width / 2
        };
      } else if (spaceRight >= tooltipWidth + offset) {
        newPlacement = 'right';
        newPosition = {
          top: rect.top + rect.height / 2,
          left: rect.right + offset
        };
      } else {
        newPlacement = 'left';
        newPosition = {
          top: rect.top + rect.height / 2,
          left: rect.left - offset
        };
      }

      setPlacement(newPlacement);
      setPosition(newPosition);
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetElement]);

  const getTransform = () => {
    switch (placement) {
      case 'top':
        return 'translate(-50%, -100%)';
      case 'bottom':
        return 'translate(-50%, 0%)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'right':
        return 'translate(0%, -50%)';
      default:
        return 'translate(-50%, 0%)';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={tooltipVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed z-[10001] w-80 max-w-[90vw]"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: getTransform(),
        }}
      >
        <div className="bg-card border-2 border-primary/30 rounded-xl shadow-2xl p-5">
          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2 pr-6">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-1.5 bg-primary/50'
                    : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={!canGoPrev}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <span className="text-xs text-muted-foreground">
              {currentStep + 1} / {totalSteps}
            </span>

            <Button
              onClick={onNext}
              size="sm"
              className="h-8"
              disabled={!canGoNext && currentStep !== totalSteps - 1}
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
