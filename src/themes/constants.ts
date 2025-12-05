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
        cardBackground: 'rgba(255,255,255,0.6)',
        cardBorder: 'rgba(94,58,67,0.2)',
        buttonPrimary: '#5e3a43',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(94,58,67,0.15)',
        buttonSecondaryText: '#5e3a43',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(94,58,67,0.3)',
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
    grain: { intensity: 0.45, size: 1.0, type: 'fractalNoise' },
    colors: ['#4facfe', '#00f2fe', '#a8edea', '#43e97b', '#ffffff'],
    day: {
      background: '#e0f7fa',
      textColor: '#004d40',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.6)',
        cardBorder: 'rgba(0,77,64,0.2)',
        buttonPrimary: '#004d40',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(0,77,64,0.15)',
        buttonSecondaryText: '#004d40',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(0,77,64,0.3)',
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
    grain: { intensity: 0.4, size: 1.2, type: 'fractalNoise' },
    colors: ['#764ba2', '#667eea', '#43e97b', '#fa709a', '#2980b9'],
    day: {
      background: '#f3e8ff',
      textColor: '#4c1d95',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.6)',
        cardBorder: 'rgba(76,29,149,0.2)',
        buttonPrimary: '#764ba2',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(118,75,162,0.15)',
        buttonSecondaryText: '#4c1d95',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(76,29,149,0.3)',
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
  [ThemeId.CHILLING]: {
    name: 'Chilling',
    description: 'Warm evening haze with medium film grain.',
    grain: { intensity: 0.5, size: 1.1, type: 'fractalNoise' },
    colors: ['#ff9a9e', '#fecfef', '#feada6', '#f5efef', '#a18cd1'],
    day: {
      background: '#fef7f0',
      textColor: '#5c4033',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.6)',
        cardBorder: 'rgba(92,64,51,0.2)',
        buttonPrimary: '#a18cd1',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(161,140,209,0.15)',
        buttonSecondaryText: '#5c4033',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(92,64,51,0.3)',
      }
    },
    night: {
      background: '#2d1b2e',
      textColor: '#ffecd2',
      blendMode: 'screen',
      ui: {
        cardBackground: 'rgba(0,0,0,0.3)',
        cardBorder: 'rgba(255,236,210,0.2)',
        buttonPrimary: '#ff9a9e',
        buttonPrimaryText: '#2d1b2e',
        buttonSecondary: 'rgba(255,154,158,0.2)',
        buttonSecondaryText: '#ffecd2',
        inputBackground: 'rgba(0,0,0,0.4)',
        inputBorder: 'rgba(255,236,210,0.3)',
      }
    }
  },
  [ThemeId.FOREST]: {
    name: 'Forest',
    description: 'Organic greens with earthy, coarse texture.',
    grain: { intensity: 0.65, size: 0.7, type: 'turbulence' },
    colors: ['#134e5e', '#71b280', '#2d3436', '#55efc4', '#006400'],
    day: {
      background: '#ecfdf5',
      textColor: '#064e3b',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.6)',
        cardBorder: 'rgba(6,78,59,0.2)',
        buttonPrimary: '#134e5e',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(19,78,94,0.15)',
        buttonSecondaryText: '#064e3b',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(6,78,59,0.3)',
      }
    },
    night: {
      background: '#0f140f',
      textColor: '#dce8dc',
      blendMode: 'overlay',
      ui: {
        cardBackground: 'rgba(0,0,0,0.3)',
        cardBorder: 'rgba(220,232,220,0.2)',
        buttonPrimary: '#55efc4',
        buttonPrimaryText: '#0f140f',
        buttonSecondary: 'rgba(85,239,196,0.2)',
        buttonSecondaryText: '#dce8dc',
        inputBackground: 'rgba(0,0,0,0.4)',
        inputBorder: 'rgba(220,232,220,0.3)',
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
        cardBackground: 'rgba(255,255,255,0.7)',
        cardBorder: 'rgba(26,26,46,0.2)',
        buttonPrimary: '#9900cc',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(153,0,204,0.15)',
        buttonSecondaryText: '#1a1a2e',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(26,26,46,0.3)',
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
  [ThemeId.GOLD]: {
    name: 'Gold',
    description: 'Luxurious shimmer with subtle texture.',
    grain: { intensity: 0.3, size: 1.4, type: 'fractalNoise' },
    colors: ['#eecda3', '#ef629f', '#e65c00', '#f9d423', '#ffffff'],
    day: {
      background: '#fffbeb',
      textColor: '#78350f',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.6)',
        cardBorder: 'rgba(120,53,15,0.2)',
        buttonPrimary: '#e65c00',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(230,92,0,0.15)',
        buttonSecondaryText: '#78350f',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(120,53,15,0.3)',
      }
    },
    night: {
      background: '#1e1b15',
      textColor: '#f1e6b9',
      blendMode: 'soft-light',
      ui: {
        cardBackground: 'rgba(0,0,0,0.3)',
        cardBorder: 'rgba(241,230,185,0.2)',
        buttonPrimary: '#f9d423',
        buttonPrimaryText: '#1e1b15',
        buttonSecondary: 'rgba(249,212,35,0.2)',
        buttonSecondaryText: '#f1e6b9',
        inputBackground: 'rgba(0,0,0,0.4)',
        inputBorder: 'rgba(241,230,185,0.3)',
      }
    }
  },
  [ThemeId.FLOW]: {
    name: 'Flow',
    description: 'Bright, flowing waters with crystalline grain.',
    grain: { intensity: 0.7, size: 0.85, type: 'fractalNoise' },
    colors: ['#00bfff', '#1ca9c9', '#48d1cc', '#87ceeb', '#ffffff'],
    day: {
      background: '#f0f9ff',
      textColor: '#0c4a6e',
      blendMode: 'multiply',
      ui: {
        cardBackground: 'rgba(255,255,255,0.6)',
        cardBorder: 'rgba(12,74,110,0.2)',
        buttonPrimary: '#0284c7',
        buttonPrimaryText: '#ffffff',
        buttonSecondary: 'rgba(2,132,199,0.15)',
        buttonSecondaryText: '#0c4a6e',
        inputBackground: 'rgba(255,255,255,0.8)',
        inputBorder: 'rgba(12,74,110,0.3)',
      }
    },
    night: {
      background: '#006994',
      textColor: '#e0f7fa',
      blendMode: 'hard-light',
      ui: {
        cardBackground: 'rgba(0,0,0,0.3)',
        cardBorder: 'rgba(224,247,250,0.2)',
        buttonPrimary: '#00bfff',
        buttonPrimaryText: '#003d5b',
        buttonSecondary: 'rgba(0,191,255,0.2)',
        buttonSecondaryText: '#e0f7fa',
        inputBackground: 'rgba(0,0,0,0.4)',
        inputBorder: 'rgba(224,247,250,0.3)',
      }
    }
  },
};
