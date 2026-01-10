import { generateHSLColors, createNoiseTextureStyle } from "@/lib/cardImageUtils";

interface TeacherCardImageProps {
  teacherId: string;
  teacherName: string;
  className?: string;
}

export const TeacherCardImage = ({ 
  teacherId, 
  teacherName,
  className = "" 
}: TeacherCardImageProps) => {
  // Generate pastel color palette
  const { hash, hue, saturation, lightness } = generateHSLColors(teacherId, {
    hueRange: 360,
    saturationBase: 50,
    saturationRange: 30,
    lightnessBase: 70,
    lightnessRange: 15,
  });
  
  const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const color2 = `hsl(${(hue + 80) % 360}, ${saturation - 10}%, ${lightness - 5}%)`;

  const gradientStyle = {
    background: `radial-gradient(circle at 30% 30%, ${color1} 0%, ${color2} 100%)`,
  };

  // Get initials
  const initials = teacherName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const noiseStyle = createNoiseTextureStyle(0.75, 3, 0.3, '150px 150px');

  return (
    <div className={`relative overflow-hidden ${className}`} style={gradientStyle}>
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={noiseStyle}
      />
      
      {/* Initials */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold text-background/40">
          {initials}
        </span>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
    </div>
  );
};
