import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance) goToNext();
    if (distance < -minSwipeDistance) goToPrevious();
    
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Images className="h-4 w-4 mr-2" />
          View Campus Gallery ({images.length} photos)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl w-full p-0 max-h-[90vh]" onKeyDown={handleKeyDown}>
        <div className="relative">
          {/* Explicit Close Button */}
          <DialogClose className="absolute right-4 top-4 z-20 bg-background/90 hover:bg-background rounded-full p-2 shadow-lg backdrop-blur-sm transition-all active:scale-95">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4 sm:p-6 pr-16">
            <DialogTitle className="text-white text-lg sm:text-xl">
              {universityName} - Campus Gallery
            </DialogTitle>
          </DialogHeader>

          {/* Main Image Display */}
          <div 
            className="relative aspect-[4/3] sm:aspect-video bg-muted"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[currentIndex]}
              alt={`${universityName} campus view ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Navigation Arrows - Hidden on Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm transition-all active:scale-95"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm transition-all active:scale-95"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Image Counter & Swipe Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </div>
              <div className="sm:hidden text-xs text-background/80 bg-foreground/20 backdrop-blur-sm px-3 py-1 rounded-full">
                ← Swipe to navigate →
              </div>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 p-3 sm:p-4 overflow-x-auto bg-background scroll-smooth snap-x">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all active:scale-95 snap-start ${
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
