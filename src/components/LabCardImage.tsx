import { getLabCategoryId, LAB_CATEGORIES } from "@/lib/labCategories";
import { memo } from "react";

// Import all category images
import aiMlImage from "@/assets/lab-categories/ai-ml.png";
import roboticsImage from "@/assets/lab-categories/robotics.png";
import architectureImage from "@/assets/lab-categories/architecture.png";
import biomedicalImage from "@/assets/lab-categories/biomedical.png";
import chemistryImage from "@/assets/lab-categories/chemistry.png";
import physicsImage from "@/assets/lab-categories/physics.png";
import quantumImage from "@/assets/lab-categories/quantum.png";
import environmentImage from "@/assets/lab-categories/environment.png";
import mathematicsImage from "@/assets/lab-categories/mathematics.png";
import csSecurityImage from "@/assets/lab-categories/cs-security.png";
import energyImage from "@/assets/lab-categories/energy.png";
import mechanicalImage from "@/assets/lab-categories/mechanical.png";
import neuroscienceImage from "@/assets/lab-categories/neuroscience.png";
import electronicsImage from "@/assets/lab-categories/electronics.png";
import telecommunicationsImage from "@/assets/lab-categories/telecommunications.png";
import transportationImage from "@/assets/lab-categories/transportation.png";
import defaultImage from "@/assets/lab-categories/default.png";

// Map category IDs to their images
const CATEGORY_IMAGES: Record<string, string> = {
  'ai-ml': aiMlImage,
  'robotics': roboticsImage,
  'architecture': architectureImage,
  'biomedical': biomedicalImage,
  'chemistry': chemistryImage,
  'physics': physicsImage,
  'quantum': quantumImage,
  'environment': environmentImage,
  'mathematics': mathematicsImage,
  'cs-security': csSecurityImage,
  'energy': energyImage,
  'mechanical': mechanicalImage,
  'neuroscience': neuroscienceImage,
  'electronics': electronicsImage,
  'telecommunications': telecommunicationsImage,
  'transportation': transportationImage,
  'default': defaultImage,
};

interface LabCardImageProps {
  labName: string;
  labId: string;
  topics?: string | null;
  facultyMatch?: string | null;
  className?: string;
}

export const LabCardImage = memo(({ 
  labName, 
  labId, 
  topics, 
  facultyMatch, 
  className = "h-32" 
}: LabCardImageProps) => {
  // Detect category based on topics and faculty match
  const categoryId = getLabCategoryId(topics, facultyMatch);
  const categoryImage = CATEGORY_IMAGES[categoryId] || CATEGORY_IMAGES['default'];

  return (
    <div className={`relative w-full overflow-hidden rounded-t-lg ${className}`}>
      <img 
        src={categoryImage} 
        alt={labName}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
});
