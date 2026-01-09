import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Responsive image component that optimizes image loading for different screen sizes
 * For Unsplash images, it appends width parameters for different breakpoints
 */
export const ResponsiveImage = ({ 
  src, 
  alt, 
  className,
  sizes = "(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px",
  priority = false
}: ResponsiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Check if it's an Unsplash image - validate the hostname
  const isUnsplash = (() => {
    try {
      const url = new URL(src);
      return url.hostname === 'images.unsplash.com' || 
             url.hostname === 'unsplash.com';
    } catch {
      return false;
    }
  })();
  
  // Generate srcset for different sizes
  const getSrcSet = () => {
    if (!isUnsplash) {
      return undefined;
    }
    
    const widths = [400, 800, 1200, 1600];
    return widths
      .map(width => `${src}${src.includes('?') ? '&' : '?'}w=${width} ${width}w`)
      .join(', ');
  };

  // Get the src with default width parameter for Unsplash
  const getDefaultSrc = () => {
    if (!isUnsplash) {
      return src;
    }
    return `${src}${src.includes('?') ? '&' : '?'}w=800`;
  };

  return (
    <picture>
      {isUnsplash && (
        <>
          <source 
            media="(max-width: 640px)" 
            srcSet={`${src}${src.includes('?') ? '&' : '?'}w=400`} 
          />
          <source 
            media="(max-width: 1024px)" 
            srcSet={`${src}${src.includes('?') ? '&' : '?'}w=800`} 
          />
          <source 
            srcSet={`${src}${src.includes('?') ? '&' : '?'}w=1200`} 
          />
        </>
      )}
      <img
        src={getDefaultSrc()}
        srcSet={getSrcSet()}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </picture>
  );
};
