import { Star } from "lucide-react";

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
  const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const saturation = 65 + (hash % 20);
  const lightness = 55 + (hash % 15);
  
  const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const color2 = `hsl(${(hue + 60) % 360}, ${saturation}%, ${lightness - 10}%)`;
  const color3 = `hsl(${(hue + 120) % 360}, ${saturation - 10}%, ${lightness + 5}%)`;

  const gradientStyle = {
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`,
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={gradientStyle}>
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      
      {/* Rating badge - top right */}
      {averageRating !== undefined && reviewCount > 0 && (
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
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
