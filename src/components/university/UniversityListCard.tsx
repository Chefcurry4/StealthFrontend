import { GraduationCap, Microscope } from "lucide-react";

interface UniversityListCardProps {
  title: string;
  description?: string;
  image?: string;
  type: "program" | "lab";
}

export const UniversityListCard = ({ title, description, image, type }: UniversityListCardProps) => {
  const Icon = type === "program" ? GraduationCap : Microscope;

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {description}
          </p>
        )}
      </div>
      
      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};
