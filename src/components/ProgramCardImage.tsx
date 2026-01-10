import { memo } from "react";

interface ProgramCardImageProps {
  programId: string;
  programName: string;
  className?: string;
}

export const ProgramCardImage = memo(({ 
  programId, 
  programName,
  className = "" 
}: ProgramCardImageProps) => {
  // Generate warm color palette (oranges, reds, yellows)
  const hash = programId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = 10 + (hash % 50); // Warm hues: 10-60 (red-orange-yellow)
  const saturation = 70 + (hash % 20);
  const lightness = 60 + (hash % 15);
  
  const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const color2 = `hsl(${(hue + 30) % 60 + 10}, ${saturation - 10}%, ${lightness - 10}%)`;
  const color3 = `hsl(${(hue + 15) % 60 + 10}, ${saturation}%, ${lightness + 5}%)`;

  const gradientStyle = {
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`,
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={gradientStyle}>
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />
      
      {/* Wave pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M 0,100 C 50,80 100,120 200,100 L 200,200 L 0,200 Z" 
          fill="white"
          opacity="0.3"
        />
      </svg>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10" />
    </div>
  );
});
