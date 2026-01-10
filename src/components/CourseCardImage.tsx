import { Star } from "lucide-react";
import { generateHSLColors, createNoiseTextureStyle } from "@/lib/cardImageUtils";

interface CourseCardImageProps {
  courseId: string;
  courseName: string;
  level?: string | null;
  className?: string;
  averageRating?: number;
  reviewCount?: number;
}

export const CourseCardImage = ({ 
  courseId, 
  courseName, 
  level,
  className = "",
  averageRating,
  reviewCount = 0,
}: CourseCardImageProps) => {
  // Generate color based on course ID
  const { hue, saturation, lightness } = generateHSLColors(courseId, {
    hueRange: 360,
    saturationBase: 65,
    saturationRange: 20,
    lightnessBase: 55,
    lightnessRange: 15,
  });
  
  const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const color2 = `hsl(${(hue + 60) % 360}, ${saturation}%, ${lightness - 10}%)`;
  const color3 = `hsl(${(hue + 120) % 360}, ${saturation - 10}%, ${lightness + 5}%)`;

  const gradientStyle = {
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`,
  };

  const noiseStyle = createNoiseTextureStyle(0.9, 4, 0.4, '200px 200px');

  return (
    <div className={`relative overflow-hidden ${className}`} style={gradientStyle}>
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={noiseStyle}
      />
      
      {/* Rating badge - top right with yellow star */}
      {averageRating !== undefined && reviewCount > 0 && (
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-all duration-200 hover:scale-105">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 transition-all duration-200" />
          <span className="text-xs font-semibold text-foreground">{averageRating.toFixed(1)}</span>
        </div>
      )}
      
      {/* Level badge */}
      {level && (
        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-foreground">
          {level}
        </div>
      )}
      
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
    </div>
  );
};
