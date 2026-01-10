import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Microscope, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { celebrationVariants } from '../utils/tourAnimations';

interface CompletionStepProps {
  onComplete: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({ onComplete }) => {
  const navigate = useNavigate();

  // Create confetti effect
  useEffect(() => {
    const createConfetti = () => {
      const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
      const confettiCount = 50;
      
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        document.body.appendChild(confetti);

        setTimeout(() => {
          confetti.remove();
        }, 5000);
      }
    };

    createConfetti();

    // Add confetti styles
    const style = document.createElement('style');
    style.textContent = `
      .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        top: -10px;
        z-index: 10000;
        animation: confetti-fall linear forwards;
      }
      
      @keyframes confetti-fall {
        to {
          transform: translateY(100vh) rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.querySelectorAll('.confetti').forEach(el => el.remove());
      style.remove();
    };
  }, []);

  const handleAction = (route: string) => {
    onComplete();
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-orange-500/20 backdrop-blur-sm">
      <motion.div
        variants={celebrationVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-2xl px-6"
      >
        {/* Success icon */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: 3,
            ease: 'easeInOut'
          }}
          className="mb-8 inline-block"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-2xl">
            <Sparkles className="h-16 w-16 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          You're All Set! 🎉
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-muted-foreground mb-8"
        >
          Ready to plan your perfect exchange semester?
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Button
            size="lg"
            onClick={() => handleAction('/workbench')}
            className="group"
          >
            <Bot className="h-5 w-5 mr-2" />
            Start with Workbench
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => handleAction('/courses')}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Browse Courses
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => handleAction('/labs')}
          >
            <Microscope className="h-5 w-5 mr-2" />
            Explore Labs
          </Button>
        </motion.div>

        {/* Keyboard shortcuts hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 rounded-lg bg-muted/50 inline-block"
        >
          <p className="text-sm text-muted-foreground">
            <strong>💡 Pro tip:</strong> Press <kbd className="px-2 py-1 rounded bg-background border text-xs">Ctrl+K</kbd> anywhere to open quick search
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
