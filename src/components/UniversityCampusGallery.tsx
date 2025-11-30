import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UniversityCampusGalleryProps {
  universityName: string;
  universityId: string;
}

// Generate 5 different campus image URLs per university
const getCampusImages = (universityName: string, universityId: string): string[] => {
  const searchTerms = [
    `${universityName} campus building architecture`,
    `${universityName} university library study`,
    `${universityName} campus courtyard students`,
    `${universityName} university laboratory science`,
    `${universityName} campus aerial view`
  ];
  
  return searchTerms.map((term, index) => {
    const searchQuery = encodeURIComponent(term);
    const seed = universityId.substring(0, 8) + index;
    return `https://source.unsplash.com/1200x800/?${searchQuery}&sig=${seed}`;
  });
};

export const UniversityCampusGallery = ({ universityName, universityId }: UniversityCampusGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const images = getCampusImages(universityName, universityId);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Images className="h-4 w-4 mr-2" />
          View Campus Gallery ({images.length} photos)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-full p-0" onKeyDown={handleKeyDown}>
        <div className="relative">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-6">
            <DialogTitle className="text-white text-xl">
              {universityName} - Campus Gallery
            </DialogTitle>
          </DialogHeader>

          {/* Main Image Display */}
          <div className="relative aspect-video bg-muted">
            <img
              src={images[currentIndex]}
              alt={`${universityName} campus view ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 p-4 overflow-x-auto bg-background">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-primary scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
