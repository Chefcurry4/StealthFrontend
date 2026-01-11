import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { celebrationVariants } from '../utils/tourAnimations';
import { Button } from '@/components/ui/button';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ 
  onNext
}) => {
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
            scale: [1, 1.1, 1],
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

        {/* Start Tour Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            onClick={onNext}
            size="lg"
            className="theme-btn-primary"
          >
            Start Tour
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
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
