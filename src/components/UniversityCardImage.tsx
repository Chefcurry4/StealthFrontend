interface UniversityCardImageProps {
  universityId: string;
  universityName: string;
  logoUrl?: string | null;
  country?: string | null;
  className?: string;
}

export const UniversityCardImage = ({ 
  universityId, 
  universityName,
  logoUrl,
  country,
  className = "" 
}: UniversityCardImageProps) => {
  // Generate purple/indigo color palette
  const hash = universityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = 240 + (hash % 60); // Purple to indigo range: 240-300
  const saturation = 60 + (hash % 25);
  const lightness = 55 + (hash % 20);
  
  const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const color2 = `hsl(${(hue + 30) % 360}, ${saturation - 10}%, ${lightness - 10}%)`;
  const color3 = `hsl(${(hue + 15) % 360}, ${saturation + 5}%, ${lightness + 5}%)`;

  const gradientStyle = {
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`,
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={gradientStyle}>
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '190px 190px',
        }}
      />
      
      {/* Logo overlay if available */}
      {logoUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <img 
            src={logoUrl} 
            alt={universityName}
            className="h-16 w-auto object-contain drop-shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* Country indicator */}
      {country && !logoUrl && (
        <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-foreground">
          {country}
        </div>
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
    </div>
  );
};
