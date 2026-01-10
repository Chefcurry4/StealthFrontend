import { memo } from "react";

interface TeacherCardImageProps {
  teacherId: string;
  teacherName: string;
  className?: string;
}

export const TeacherCardImage = memo(({ 
  teacherId, 
  teacherName,
  className = "" 
}: TeacherCardImageProps) => {
  // Generate pastel color palette
  const hash = teacherId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const saturation = 50 + (hash % 30);
  const lightness = 70 + (hash % 15);
  
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

  return (
    <div className={`relative overflow-hidden ${className}`} style={gradientStyle}>
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
        }}
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
});
