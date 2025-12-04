import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ColorPalette, ThemeId } from '@/themes/types';
import { THEMES } from '@/themes/constants';

interface ThemePreviewCardProps {
  themeId: ThemeId;
  isSelected: boolean;
  onClick: () => void;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({
  themeId,
  isSelected,
  onClick,
}) => {
  const palette = THEMES[themeId];
  const config = palette.grain;

  // Generate simplified blobs for preview (3 blobs instead of 5)
  const { blobs, keyframesStyle, filterId } = useMemo(() => {
    const id = `noise-${themeId}-${Math.random().toString(36).substring(7)}`;
    let allKeyframes = '';
    
    const previewColors = palette.colors.slice(0, 3);
    
    const generatedBlobs = previewColors.map((color, i) => {
      const animationName = `preview-blob-${themeId}-${i}-${Math.random().toString(36).substring(7)}`;
      
      const randomPos = () => Math.random() * 60 - 30;
      const randomScale = () => 0.8 + Math.random() * 0.4;
      const randomRotate = () => Math.random() * 180;

      const p1 = { x: randomPos(), y: randomPos(), s: randomScale(), r: randomRotate() };
      const p2 = { x: randomPos(), y: randomPos(), s: randomScale(), r: randomRotate() };

      const keyframes = `
        @keyframes ${animationName} {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(${p1.x}%, ${p1.y}%, 0) scale(${p1.s}) rotate(${p1.r}deg); }
        }
      `;
      
      allKeyframes += keyframes;

      const duration = 8 + Math.random() * 4;
      const delay = Math.random() * -4;

      return {
        key: i,
        style: {
          background: `radial-gradient(circle at center, ${color} 0%, transparent 50%)`,
          top: `${20 + i * 20}%`,
          left: `${20 + i * 15}%`,
          width: '60%',
          height: '60%',
          animation: `${animationName} ${duration}s ease-in-out infinite`,
          animationDelay: `${delay}s`,
          opacity: 0.9,
        }
      };
    });

    return { blobs: generatedBlobs, keyframesStyle: allKeyframes, filterId: id };
  }, [themeId, palette.colors]);

  const blendMode = palette.blendMode || 'multiply';

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-300 group",
        "w-full aspect-[3/2]",
        isSelected 
          ? "ring-2 ring-white shadow-lg scale-105" 
          : "hover:scale-102 hover:shadow-md ring-1 ring-white/20"
      )}
    >
      <style>{keyframesStyle}</style>
      
      {/* Background */}
      <div 
        className="absolute inset-0 transition-colors duration-500"
        style={{ backgroundColor: palette.background }}
      />
      
      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        {blobs.map((blob) => (
          <div
            key={blob.key}
            className="absolute filter blur-[20px]"
            style={{
              ...blob.style,
              mixBlendMode: blendMode,
            }}
          />
        ))}
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="invisible absolute w-0 h-0">
          <filter id={filterId}>
            <feTurbulence 
              type={config.type} 
              baseFrequency={config.size} 
              numOctaves={1} 
              stitchTiles="stitch" 
            />
          </filter>
        </svg>
        <div 
          className="absolute inset-0"
          style={{ 
            filter: `url(#${filterId})`,
            opacity: config.intensity * 0.5,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      {/* Theme name overlay */}
      <div 
        className={cn(
          "absolute inset-0 flex items-end justify-center pb-2",
          "bg-gradient-to-t from-black/40 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          isSelected && "opacity-100"
        )}
      >
        <span 
          className="text-xs font-medium text-white drop-shadow-lg"
        >
          {palette.name}
        </span>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full shadow-lg" />
      )}
    </button>
  );
};
