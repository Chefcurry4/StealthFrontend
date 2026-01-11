import React from 'react';
import { motion } from 'framer-motion';
import { progressBarVariants } from './utils/tourAnimations';
import { Pause, Play } from 'lucide-react';

interface TourProgressBarProps {
  currentStep: number;
  totalSteps: number;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const TourProgressBar: React.FC<TourProgressBarProps> = ({
  currentStep,
  totalSteps,
  isPaused,
  onTogglePause
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <motion.div
      variants={progressBarVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[10002] bg-card border-2 border-primary/30 rounded-full shadow-lg px-4 py-2 flex items-center gap-3 max-w-[90vw]"
    >
      {/* Pause/Play button */}
      <button
        onClick={onTogglePause}
        className="p-1 rounded-full hover:bg-muted transition-colors"
        aria-label={isPaused ? 'Resume tour' : 'Pause tour'}
      >
        {isPaused ? (
          <Play className="h-4 w-4 text-primary" />
        ) : (
          <Pause className="h-4 w-4 text-primary" />
        )}
      </button>

      {/* Progress bar */}
      <div className="w-24 lg:w-48 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Step counter */}
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        {currentStep + 1}/{totalSteps}
      </span>
    </motion.div>
  );
};
