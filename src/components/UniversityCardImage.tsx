interface UniversityCardImageProps {
  universityId: string;
  universityName: string;
  logoUrl?: string | null;
  country?: string | null;
  className?: string;
}

// Prefer local campus images when available.
// File naming convention (Option B):
// - src/assets/universities/uni_<universityId>.jpg|jpeg|png|webp
// Example:
// - src/assets/universities/uni_4a6e2b10-9c8f-4152-8c9a-5b6d7e8f9a01.jpg
const campusImagesById = import.meta.glob<string>(
  "@/assets/universities/uni_*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" }
);

const findLocalCampusImage = (universityId: string): string | undefined => {
  const suffixes = [
    `/uni_${universityId}.jpg`,
    `/uni_${universityId}.jpeg`,
    `/uni_${universityId}.png`,
    `/uni_${universityId}.webp`,
  ];

  for (const [key, value] of Object.entries(campusImagesById)) {
    if (suffixes.some((s) => key.endsWith(s))) return value;
  }

  return undefined;
};

// Generate Unsplash image URL based on university name
const getUniversityCampusImage = (universityName: string, universityId: string): string => {
  const local = findLocalCampusImage(universityId);
  if (local) return local;

  // Use university name as search query for more relevant images
  const searchQuery = encodeURIComponent(`${universityName} campus building`);
  // Add university ID as seed for consistency
  const seed = universityId.substring(0, 8);
  return `https://source.unsplash.com/800x600/?${searchQuery}&sig=${seed}`;
};

export const UniversityCardImage = ({ 
  universityId, 
  universityName,
  logoUrl,
  country,
  className = "" 
}: UniversityCardImageProps) => {
  const campusImageUrl = getUniversityCampusImage(universityName, universityId);

  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      {/* Campus photo */}
      <img 
        src={campusImageUrl} 
        alt={`${universityName} campus`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      
      {/* Logo overlay in top-left corner if available */}
      {logoUrl && (
        <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm p-2 rounded-lg shadow-lg">
          <img 
            src={logoUrl} 
            alt={universityName}
            className="h-10 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* Country badge in bottom-right */}
      {country && (
        <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-foreground shadow-lg">
          📍 {country}
        </div>
      )}
    </div>
  );
};
