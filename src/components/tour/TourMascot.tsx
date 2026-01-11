import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mascotVariants, tooltipVariants } from './utils/tourAnimations';

interface TourMascotProps {
  message: string;
  position?: 'center' | 'bottom-right';
  isExcited?: boolean;
}

export const TourMascot: React.FC<TourMascotProps> = ({ 
  message, 
  position = 'bottom-right',
  isExcited = false
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect for speech bubble - skip if message is too long
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    
    // Skip typewriter effect for long messages
    if (message.length > 60) {
      setDisplayedText(message);
      setIsTyping(false);
      return;
    }

    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 40);

    return () => clearInterval(typeInterval);
  }, [message]);

  const getPositionClasses = () => {
    switch (position) {
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom-right':
      default:
        return 'bottom-8 right-8';
    }
  };

  const getSpeechBubblePosition = () => {
    switch (position) {
      case 'center':
        return 'bottom-full mb-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-full mb-2';
    }
  };

  const getSpeechBubbleArrow = () => {
    switch (position) {
      case 'center':
        return 'absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-card';
      case 'bottom-right':
      default:
        return 'absolute top-full left-8 -mt-1 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-card';
    }
  };

  return (
    <motion.div
      className={`fixed z-[10000] ${getPositionClasses()}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {displayedText && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute ${getSpeechBubblePosition()} w-64 md:w-80 max-w-[80vw]`}
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

      {/* Panda Mascot avatar */}
      <motion.div
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-2xl cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Panda Emoji */}
        <span className="text-3xl">🐼</span>
        
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
