import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { overlayVariants } from './utils/tourAnimations';

interface TourOverlayProps {
  isVisible: boolean;
  targetElement?: HTMLElement | null;
  padding?: number;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({ 
  isVisible, 
  targetElement,
  padding = 8
}) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!targetElement) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const elementRect = targetElement.getBoundingClientRect();
      setRect(elementRect);
    };

    updateRect();

    // Update on scroll and resize
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [targetElement]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{ isolation: 'isolate' }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'auto' }}
        >
          <defs>
            <mask id="tour-spotlight-mask">
              {/* White background (visible area) */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              
              {/* Black cutout (transparent area for highlighted element) */}
              {rect && (
                <motion.rect
                  initial={{ 
                    x: rect.x - padding, 
                    y: rect.y - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2,
                    rx: 8
                  }}
                  animate={{ 
                    x: rect.x - padding, 
                    y: rect.y - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2,
                    rx: 8
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          
          {/* Semi-transparent overlay with mask */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>

        {/* Pulsing border around highlighted element */}
        {rect && (
          <motion.div
            className="absolute tour-pulse"
            initial={{
              left: rect.x - padding,
              top: rect.y - padding,
              width: rect.width + padding * 2,
              height: rect.height + padding * 2,
            }}
            animate={{
              left: rect.x - padding,
              top: rect.y - padding,
              width: rect.width + padding * 2,
              height: rect.height + padding * 2,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              borderRadius: '8px',
              border: '2px solid hsl(var(--primary))',
              pointerEvents: 'none'
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
