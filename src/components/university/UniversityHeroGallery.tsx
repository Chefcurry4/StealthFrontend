import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Import EPFL-specific images
import epflCampus1 from "@/assets/universities/epfl-campus-1.jpg";
import epflCampus2 from "@/assets/universities/epfl-campus-2.jpg";
import epflCampus3 from "@/assets/universities/epfl-campus-3.jpg";

interface UniversityHeroGalleryProps {
  universityName: string;
  universityId: string;
  media?: { id: string; image_url: string; likes_count: number }[];
  onUploadClick?: () => void;
}

// Get images for university - use EPFL assets if available, otherwise fallback
const getUniversityImages = (
  universityName: string,
  universityId: string,
  media?: { id: string; image_url: string; likes_count: number }[]
): string[] => {
  // If user-uploaded media exists, use those
  if (media && media.length > 0) {
    return media.map((m) => m.image_url);
  }

  // For EPFL specifically, use our downloaded images
  if (universityName.toLowerCase().includes("epfl")) {
    return [epflCampus1, epflCampus2, epflCampus3];
  }

  // Fallback to Unsplash for other universities
  const searchTerms = [
    `${universityName} campus building architecture`,
    `${universityName} university library`,
    `${universityName} campus courtyard`,
  ];

  return searchTerms.map((term, index) => {
    const searchQuery = encodeURIComponent(term);
    const seed = universityId.substring(0, 8) + index;
    return `https://source.unsplash.com/800x400/?${searchQuery}&sig=${seed}`;
  });
};

export const UniversityHeroGallery = ({
  universityName,
  universityId,
  media = [],
  onUploadClick,
}: UniversityHeroGalleryProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const images = getUniversityImages(universityName, universityId, media);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleUploadClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    onUploadClick?.();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
          Campus Gallery
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Upload Your Campus Pic</span>
          <span className="sm:hidden">Upload</span>
        </Button>
      </div>

      <div className="relative">
        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm hidden sm:flex"
          onClick={scrollPrev}
          disabled={!canScrollPrev && images.length <= 3}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm hidden sm:flex"
          onClick={scrollNext}
          disabled={!canScrollNext && images.length <= 3}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Carousel */}
        <div className="overflow-hidden rounded-xl" ref={emblaRef}>
          <div className="flex gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] sm:flex-[0_0_calc(33.333%-11px)] min-w-0"
              >
                <div className="aspect-[16/9] relative rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt={`${universityName} campus ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="flex justify-center gap-2 mt-3 sm:hidden">
          {images.slice(0, Math.min(5, images.length)).map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-muted-foreground/30"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
