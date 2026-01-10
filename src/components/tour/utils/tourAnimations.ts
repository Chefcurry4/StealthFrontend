import { Variants } from 'framer-motion';

// Overlay fade animations
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

// Spotlight transition animations
export const spotlightVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Mascot animations
export const mascotVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300
    }
  },
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut'
    }
  }
};

// Tooltip slide in animations
export const tooltipVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    scale: 0.95,
    transition: {
      duration: 0.15
    }
  }
};

// Progress bar animations
export const progressBarVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Confetti/celebration animations
export const celebrationVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200
    }
  }
};

// Typewriter effect settings
export const typewriterSpeed = {
  slow: 100,
  normal: 50,
  fast: 30
};

// Drag animation settings
export const dragAnimation = {
  duration: 1.5,
  ease: 'easeInOut' as const
};

// Pulse animation for highlighted elements
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut' as const
  }
};
