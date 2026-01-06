import { ColorPalette, ThemeId } from './types';

export const THEMES: Record<ThemeId, ColorPalette> = {
  [ThemeId.BASE]: {
    name: 'Base',
    description: 'Clean and minimal base theme.',
    grain: { intensity: 0.3, size: 1.8, type: 'fractalNoise' },
    colors: ['#ffc3a0', '#ffafbd', '#ffdde1', '#ffffff', '#ff9a9e'],
    day: {
      background: '#fff0f5',
      textColor: '#3d2329',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.92)',
        cardBorder: 'rgba(94,58,67,0.45)',
        buttonPrimary: '#5e3a43',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(94,58,67,0.12)',
        buttonSecondaryText: '#3d2329',
        inputBackground: 'rgba(255,255,255,0.95)',
        inputBorder: 'rgba(94,58,67,0.5)',
      }
    },
    night: {
      background: '#000000',
      textColor: '#ffffff',
      blendMode: 'screen',
      ui: {
        cardBackground: 'rgba(255,255,255,0.05)',
        cardBorder: 'rgba(255,255,255,0.2)',
        buttonPrimary: '#ff00cc',
        buttonPrimaryText: '#000000',
        buttonSecondary: 'rgba(255,0,204,0.2)',
        buttonSecondaryText: '#ffffff',
        inputBackground: 'rgba(255,255,255,0.1)',
        inputBorder: 'rgba(255,255,255,0.3)',
      }
    }
  },

  [ThemeId.OCEAN]: {
    name: 'Ocean',
    description: 'Vibrant cyans with a distinct sandy texture.',
    grain: { intensity: 0.3, size: 1.0, type: 'fractalNoise' },
    colors: ['#4facfe', '#00f2fe', '#a8edea', '#43e97b', '#ffffff'],
    day: {
      background: '#e0f7fa',
      textColor: '#00352d',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.92)',
        cardBorder: 'rgba(0,77,64,0.45)',
        buttonPrimary: '#004d40',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(0,77,64,0.12)',
        buttonSecondaryText: '#00352d',
        inputBackground: 'rgba(255,255,255,0.95)',
        inputBorder: 'rgba(0,77,64,0.5)',
      }
    },
    night: {
      background: '#0a2a2f',
      textColor: '#e0f7fa',
      blendMode: 'screen',
      ui: {
        cardBackground: 'rgba(0,0,0,0.3)',
        cardBorder: 'rgba(224,247,250,0.2)',
        buttonPrimary: '#4facfe',
        buttonPrimaryText: '#0a2a2f',
        buttonSecondary: 'rgba(79,172,254,0.2)',
        buttonSecondaryText: '#e0f7fa',
        inputBackground: 'rgba(0,0,0,0.4)',
        inputBorder: 'rgba(224,247,250,0.3)',
      }
    }
  },

  [ThemeId.AURORA]: {
    name: 'Aurora',
    description: 'Magical night sky with soft, misty grain.',
    grain: { intensity: 0.3, size: 1.2, type: 'fractalNoise' },
    colors: ['#764ba2', '#667eea', '#43e97b', '#fa709a', '#2980b9'],
    day: {
      background: '#f3e8ff',
      textColor: '#3b1574',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.92)',
        cardBorder: 'rgba(76,29,149,0.45)',
        buttonPrimary: '#764ba2',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(118,75,162,0.12)',
        buttonSecondaryText: '#3b1574',
        inputBackground: 'rgba(255,255,255,0.95)',
        inputBorder: 'rgba(76,29,149,0.5)',
      }
    },
    night: {
      background: '#1a0b2e',
      textColor: '#e0d4fc',
      blendMode: 'screen',
      ui: {
        cardBackground: 'rgba(0,0,0,0.3)',
        cardBorder: 'rgba(224,212,252,0.2)',
        buttonPrimary: '#667eea',
        buttonPrimaryText: '#1a0b2e',
        buttonSecondary: 'rgba(102,126,234,0.2)',
        buttonSecondaryText: '#e0d4fc',
        inputBackground: 'rgba(0,0,0,0.4)',
        inputBorder: 'rgba(224,212,252,0.3)',
      }
    }
  },
};
