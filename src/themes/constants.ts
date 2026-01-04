import { ColorPalette, ThemeId } from './types';

export const THEMES: Record<ThemeId, ColorPalette> = {
  [ThemeId.QUARTZ]: {
    name: 'Quartz',
    description: 'Soft pinks and peaches with a gentle, fine grain.',
    grain: { intensity: 0.3, size: 1.8, type: 'fractalNoise' },
    colors: ['#ffc3a0', '#ffafbd', '#ffdde1', '#ffffff', '#ff9a9e'],
    day: {
      background: '#fff0f5',
      textColor: '#5e3a43',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.8)',
        cardBorder: 'rgba(94,58,67,0.3)',
        buttonPrimary: '#5e3a43',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(94,58,67,0.15)',
        buttonSecondaryText: '#5e3a43',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(94,58,67,0.4)',
      }
    },
    night: {
      background: '#2d1f24',
      textColor: '#ffeef3',
      blendMode: 'screen',
      ui: {
        cardBackground: 'rgba(0,0,0,0.3)',
        cardBorder: 'rgba(255,238,243,0.2)',
        buttonPrimary: '#ffafbd',
        buttonPrimaryText: '#2d1f24',
        buttonSecondary: 'rgba(255,175,189,0.2)',
        buttonSecondaryText: '#ffeef3',
        inputBackground: 'rgba(0,0,0,0.4)',
        inputBorder: 'rgba(255,238,243,0.3)',
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
      textColor: '#004d40',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.8)',
        cardBorder: 'rgba(0,77,64,0.3)',
        buttonPrimary: '#004d40',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(0,77,64,0.15)',
        buttonSecondaryText: '#004d40',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(0,77,64,0.4)',
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
      textColor: '#4c1d95',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.8)',
        cardBorder: 'rgba(76,29,149,0.3)',
        buttonPrimary: '#764ba2',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(118,75,162,0.15)',
        buttonSecondaryText: '#4c1d95',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(76,29,149,0.4)',
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

  [ThemeId.NEON]: {
    name: 'Neon',
    description: 'Digital void with sharp, high-frequency static.',
    grain: { intensity: 0.35, size: 2.5, type: 'fractalNoise' },
    colors: ['#ff00cc', '#333399', '#00ff99', '#00ccff', '#9900cc'],
    day: {
      background: '#f5f5f5',
      textColor: '#1a1a2e',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.8)',
        cardBorder: 'rgba(26,26,46,0.28)',
        buttonPrimary: '#9900cc',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(153,0,204,0.15)',
        buttonSecondaryText: '#1a1a2e',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(26,26,46,0.4)',
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

};
