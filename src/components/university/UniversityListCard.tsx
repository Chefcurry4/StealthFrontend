import { useState } from "react";
import { GraduationCap, Microscope } from "lucide-react";
import { getProgramLogoUrl } from "@/lib/programLogosStorage";

interface UniversityListCardProps {
  title: string;
  description?: string;
  image?: string;
  programSlug?: string;
  type: "program" | "lab";
}

export const UniversityListCard = ({ title, image, programSlug, type }: UniversityListCardProps) => {
  const Icon = type === "program" ? GraduationCap : Microscope;
  const [logoError, setLogoError] = useState(false);
  
  // For programs, try to get logo from Supabase storage
  const programLogoUrl = type === "program" && programSlug ? getProgramLogoUrl(programSlug) : null;
  const displayImage = programLogoUrl && !logoError ? programLogoUrl : image;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={title}
            className="w-full h-full object-contain p-1"
            onError={() => setLogoError(true)}
          />
        ) : (
          <Icon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      
      <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors flex-1 min-w-0">
        {title}
      </h3>
    </div>
  );
};
