import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { celebrationVariants } from '../utils/tourAnimations';

interface WelcomeStepProps {
  onAutoAdvance: () => void;
  duration?: number;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ 
  onAutoAdvance, 
  duration = 5000 
}) => {
  useEffect(() => {
    const timer = setTimeout(onAutoAdvance, duration);
    return () => clearTimeout(timer);
  }, [onAutoAdvance, duration]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-orange-500/20">
      <motion.div
        variants={celebrationVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-2xl px-6"
      >
        {/* Animated icon */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="mb-8 inline-block"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-2xl">
            <Sparkles className="h-12 w-12 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Title with gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent"
        >
          Welcome to Student Hub!
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground mb-8"
        >
          Your AI-powered study abroad companion
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
          <span>Preparing your tour...</span>
        </motion.div>
      </motion.div>

      {/* Gradient overlay animations */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};
