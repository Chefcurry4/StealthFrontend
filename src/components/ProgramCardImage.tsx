import { generateHSLColors, createNoiseTextureStyle } from "@/lib/cardImageUtils";

interface ProgramCardImageProps {
  programId: string;
  programName: string;
  className?: string;
}

export const ProgramCardImage = ({ 
  programId, 
  programName,
  className = "" 
}: ProgramCardImageProps) => {
  // Generate warm color palette (oranges, reds, yellows)
  const { hue, saturation, lightness } = generateHSLColors(programId, {
    hueOffset: 10,
    hueRange: 50, // Warm hues: 10-60 (red-orange-yellow)
    saturationBase: 70,
    saturationRange: 20,
    lightnessBase: 60,
    lightnessRange: 15,
  });
  
  const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const color2 = `hsl(${(hue + 30) % 60 + 10}, ${saturation - 10}%, ${lightness - 10}%)`;
  const color3 = `hsl(${(hue + 15) % 60 + 10}, ${saturation}%, ${lightness + 5}%)`;

  const gradientStyle = {
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`,
  };

  const noiseStyle = createNoiseTextureStyle(0.8, 3, 0.5, '180px 180px');

  return (
    <div className={`relative overflow-hidden ${className}`} style={gradientStyle}>
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-25"
        style={noiseStyle}
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
};
