export interface GrainConfig {
  intensity: number; // 0 to 1 (Opacity)
  size: number; // SVG baseFrequency (higher = finer grain, lower = larger coarse grain)
  type: 'fractalNoise' | 'turbulence'; // SVG filter type
}

export interface ColorPalette {
  name: string;
  colors: string[];
  background: string;
  textColor: string;
  description: string;
  /**
   * CSS mix-blend-mode for the blobs. 
   * Light themes typically look best with 'multiply'.
   * Dark themes often need 'screen', 'overlay', or 'lighten' to make colors pop.
   */
  blendMode?: 'multiply' | 'screen' | 'overlay' | 'normal' | 'lighten' | 'soft-light' | 'hard-light';
  /**
   * Specific grain configuration for this theme to match reference aesthetics.
   */
  grain: GrainConfig;
  /**
   * Controls the shape and behavior of the background blobs.
   * 'default' = large, round, nebulous blobs.
   * 'serpent' = thinner, elongated, snake-like flows.
   */
  blobType?: 'default' | 'serpent';
}

export enum ThemeId {
  QUARTZ = 'QUARTZ',
  OCEAN = 'OCEAN',
  AURORA = 'AURORA',
  CHILLING = 'CHILLING',
  FOREST = 'FOREST',
  NEON = 'NEON',
  GOLD = 'GOLD',
  FLOW = 'FLOW'
}
