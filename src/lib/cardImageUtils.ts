/**
 * Utility functions for generating consistent visual elements in card images
 */

/**
 * Generate a hash from a string ID for consistent color/pattern generation
 * @param id - The string ID to hash
 * @returns A numeric hash value
 */
export const generateIdHash = (id: string): number => {
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

/**
 * Generate HSL color values based on an ID hash
 * @param id - The ID string to generate colors from
 * @param hueOffset - Starting hue offset (0-360)
 * @param hueRange - Range of hues to use
 * @param saturationBase - Base saturation value
 * @param saturationRange - Range to add to base saturation
 * @param lightnessBase - Base lightness value
 * @param lightnessRange - Range to add to base lightness
 * @returns Object with HSL color values
 */
export const generateHSLColors = (
  id: string,
  {
    hueOffset = 0,
    hueRange = 360,
    saturationBase = 65,
    saturationRange = 20,
    lightnessBase = 55,
    lightnessRange = 15,
  }: {
    hueOffset?: number;
    hueRange?: number;
    saturationBase?: number;
    saturationRange?: number;
    lightnessBase?: number;
    lightnessRange?: number;
  } = {}
) => {
  const hash = generateIdHash(id);
  const hue = hueOffset + (hash % hueRange);
  const saturation = saturationBase + (hash % saturationRange);
  const lightness = lightnessBase + (hash % lightnessRange);

  return { hash, hue, saturation, lightness };
};

/**
 * Generate a noise texture SVG data URL for use in backgrounds
 * @param baseFrequency - Noise texture frequency (default: 0.9)
 * @param numOctaves - Number of octaves for fractal noise (default: 4)
 * @param opacity - Opacity of the noise filter (default: 0.4)
 * @returns Data URL string for SVG noise texture
 */
export const generateNoiseTextureSVG = (
  baseFrequency: number = 0.9,
  numOctaves: number = 4,
  opacity: number = 0.4
): string => {
  return `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${baseFrequency}' numOctaves='${numOctaves}' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${opacity}'/%3E%3C/svg%3E")`;
};

/**
 * Create inline style object for noise texture background
 * @param baseFrequency - Noise texture frequency
 * @param numOctaves - Number of octaves for fractal noise
 * @param opacity - Opacity of the noise filter
 * @param backgroundSize - Size of the background pattern (default: '200px 200px')
 * @returns Style object with backgroundImage and backgroundSize
 */
export const createNoiseTextureStyle = (
  baseFrequency: number = 0.9,
  numOctaves: number = 4,
  opacity: number = 0.4,
  backgroundSize: string = '200px 200px'
) => {
  return {
    backgroundImage: generateNoiseTextureSVG(baseFrequency, numOctaves, opacity),
    backgroundSize,
  };
};
