import React, { useMemo, useEffect } from 'react';
import { ColorPalette, ThemeModeConfig } from '@/themes/types';

interface GrainyBackgroundProps {
  palette: ColorPalette;
  modeConfig: ThemeModeConfig;
  children: React.ReactNode;
}

export const GrainyBackground: React.FC<GrainyBackgroundProps> = ({ 
  palette, 
  modeConfig,
  children,
}) => {
  const config = palette.grain;
  const isSerpent = palette.blobType === 'serpent';

  // Inject CSS variables for theme-aware UI components
  // Note: We only set --theme-* variables here. The actual Tailwind token overrides
  // are handled by next-themes (.dark class) synced via ThemeModeSync component.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-card-bg', modeConfig.ui.cardBackground);
    root.style.setProperty('--theme-card-border', modeConfig.ui.cardBorder);
    root.style.setProperty('--theme-btn-primary', modeConfig.ui.buttonPrimary);
    root.style.setProperty('--theme-btn-primary-text', modeConfig.ui.buttonPrimaryText);
    root.style.setProperty('--theme-btn-secondary', modeConfig.ui.buttonSecondary);
    root.style.setProperty('--theme-btn-secondary-text', modeConfig.ui.buttonSecondaryText);
    root.style.setProperty('--theme-input-bg', modeConfig.ui.inputBackground);
    root.style.setProperty('--theme-input-border', modeConfig.ui.inputBorder);
    root.style.setProperty('--theme-text', modeConfig.textColor);
    root.style.setProperty('--theme-background', modeConfig.background);
    
    // Additional CSS variables for better theming
    root.style.setProperty('--theme-badge-bg', modeConfig.ui.cardBackground);
    root.style.setProperty('--theme-section-bg', modeConfig.ui.cardBackground);
    root.style.setProperty('--theme-popover-bg', modeConfig.ui.inputBackground);
    root.style.setProperty('--theme-popover-border', modeConfig.ui.inputBorder);
  }, [modeConfig]);

  const { blobs, keyframesStyle } = useMemo(() => {
    let allKeyframes = '';
    
    const generatedBlobs = palette.colors.map((color, i) => {
      const animationName = `blob-flow-${i}-${Math.random().toString(36).substring(7)}`;
      
      const randomPos = () => Math.random() * 100 - 50; 
      const randomScaleX = () => isSerpent ? 0.2 + Math.random() * 0.4 : 0.8 + Math.random() * 1.2; 
      const randomScaleY = () => isSerpent ? 1.5 + Math.random() * 2.0 : 0.8 + Math.random() * 1.2;
      const randomRotate = () => Math.random() * 360; 

      const p1 = { x: randomPos(), y: randomPos(), sx: randomScaleX(), sy: randomScaleY(), r: randomRotate() };
      const p2 = { x: randomPos(), y: randomPos(), sx: randomScaleX(), sy: randomScaleY(), r: randomRotate() };
      const p3 = { x: randomPos(), y: randomPos(), sx: randomScaleX(), sy: randomScaleY(), r: randomRotate() };

      const keyframes = `
        @keyframes ${animationName} {
          0% { transform: translate3d(0, 0, 0) scale3d(1, 1, 1) rotate(0deg); }
          25% { transform: translate3d(${p1.x}%, ${p1.y}%, 0) scale3d(${p1.sx}, ${p1.sy}, 1) rotate(${p1.r}deg); }
          50% { transform: translate3d(${p2.x}%, ${p2.y}%, 0) scale3d(${p2.sx}, ${p2.sy}, 1) rotate(${p2.r}deg); }
          75% { transform: translate3d(${p3.x}%, ${p3.y}%, 0) scale3d(${p3.sx}, ${p3.sy}, 1) rotate(${p3.r}deg); }
          100% { transform: translate3d(0, 0, 0) scale3d(1, 1, 1) rotate(0deg); }
        }
      `;
      
      allKeyframes += keyframes;

      const duration = Math.random() * 25 + 35;
      const delay = Math.random() * -40; 
      
      const width = isSerpent ? `${Math.random() * 20 + 10}vw` : `${Math.random() * 50 + 40}vw`;
      const height = isSerpent ? `${Math.random() * 50 + 40}vh` : `${Math.random() * 50 + 40}vh`;

      return {
        key: i,
        style: {
          background: `radial-gradient(circle at center, ${color} 0%, transparent 45%)`,
          top: `${Math.random() * 60 + 20}%`,
          left: `${Math.random() * 60 + 20}%`,
          width: width,
          height: height,
          animation: `${animationName} ${duration}s ease-in-out infinite`,
          animationDelay: `${delay}s`,
          transformOrigin: 'center center',
          willChange: 'transform',
          opacity: 0.8,
        }
      };
    });

    return { blobs: generatedBlobs, keyframesStyle: allKeyframes };
  }, [palette, isSerpent]);

  const blendMode = modeConfig.blendMode || 'multiply';
  const blurClass = isSerpent ? 'blur-[50px] md:blur-[80px]' : 'blur-[100px] md:blur-[160px]';

  return (
    <div 
      className="relative w-full min-h-screen overflow-hidden transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: modeConfig.background, color: modeConfig.textColor }}
    >
      <style>{keyframesStyle}</style>

      {/* Gradient Blobs Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {blobs.map((blob) => (
          <div
            key={blob.key}
            className={`absolute filter ${blurClass}`}
            style={{
              ...blob.style,
              mixBlendMode: blendMode,
            }}
          />
        ))}
      </div>

      {/* Noise Layer */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        <svg className="invisible absolute w-0 h-0">
          <filter id="noiseFilter">
            <feTurbulence 
              type={config.type} 
              baseFrequency={config.size} 
              numOctaves={2} 
              stitchTiles="stitch" 
            />
          </filter>
        </svg>
        
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ 
            filter: 'url(#noiseFilter)',
            opacity: config.intensity,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      <div className="relative z-20 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};
