export interface GrainConfig {
  intensity: number; // 0 to 1 (Opacity)
  size: number; // SVG baseFrequency (higher = finer grain, lower = larger coarse grain)
  type: 'fractalNoise' | 'turbulence'; // SVG filter type
}

export type ThemeMode = 'day' | 'night';

export interface ThemeModeConfig {
  background: string;
  textColor: string;
  blendMode: 'multiply' | 'screen' | 'overlay' | 'normal' | 'lighten' | 'soft-light' | 'hard-light';
  ui: {
    cardBackground: string;
    cardBorder: string;
    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    inputBackground: string;
    inputBorder: string;
  };
}

export interface ColorPalette {
  name: string;
  colors: string[];
  description: string;
  grain: GrainConfig;
  blobType?: 'default' | 'serpent';
  day: ThemeModeConfig;
  night: ThemeModeConfig;
}

export enum ThemeId {
  BASE = 'BASE',
  OCEAN = 'OCEAN',
  AURORA = 'AURORA'
}
