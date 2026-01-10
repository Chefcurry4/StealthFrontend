import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { mascotVariants, tooltipVariants } from './utils/tourAnimations';

interface TourMascotProps {
  message: string;
  position?: 'center' | 'bottom-left' | 'bottom-right' | 'top-right';
  isExcited?: boolean;
}

export const TourMascot: React.FC<TourMascotProps> = ({ 
  message, 
  position = 'bottom-right',
  isExcited = false
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect for speech bubble
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [message]);

  const getPositionClasses = () => {
    switch (position) {
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'bottom-right':
        return 'bottom-8 right-8';
      case 'top-right':
        return 'top-24 right-8';
      default:
        return 'bottom-8 right-8';
    }
  };

  const getSpeechBubblePosition = () => {
    switch (position) {
      case 'center':
        return 'bottom-full mb-4 left-1/2 -translate-x-1/2';
      case 'bottom-left':
      case 'bottom-right':
        return 'bottom-full mb-2';
      case 'top-right':
        return 'top-full mt-2';
      default:
        return 'bottom-full mb-2';
    }
  };

  const getSpeechBubbleArrow = () => {
    switch (position) {
      case 'center':
        return 'absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-card';
      case 'bottom-left':
      case 'bottom-right':
        return 'absolute top-full left-8 -mt-1 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-card';
      case 'top-right':
        return 'absolute bottom-full left-8 mb-[-1px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-card';
      default:
        return 'absolute top-full left-8 -mt-1 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-card';
    }
  };

  return (
    <motion.div
      className={`fixed z-[10000] ${getPositionClasses()}`}
      variants={mascotVariants}
      initial="hidden"
      animate={isExcited ? 'bounce' : 'visible'}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {displayedText && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute ${getSpeechBubblePosition()} w-64 md:w-80`}
          >
            <div className="relative bg-card border-2 border-primary/20 rounded-2xl shadow-xl p-4">
              <p className="text-sm leading-relaxed text-foreground">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block ml-1"
                  >
                    |
                  </motion.span>
                )}
              </p>
              {/* Arrow */}
              <div className={getSpeechBubbleArrow()} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot avatar */}
      <motion.div
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-2xl cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bot className="h-8 w-8 text-primary-foreground" />
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-orange-500 opacity-50"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>
    </motion.div>
  );
};
