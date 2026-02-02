// Kadur Design System Constants

export const Colors = {
  // Primary
  primary: {
    50: '#e6f2ff',
    100: '#b3d9ff',
    200: '#80bfff',
    300: '#4da6ff',
    400: '#1a8cff',
    500: '#007AFF', // Main primary blue
    600: '#0066cc',
    700: '#004d99',
    800: '#003366',
    900: '#001a33',
  },

  // Football Green
  football: {
    50: '#e8f9ed',
    100: '#b8edc8',
    200: '#88e1a3',
    300: '#58d57e',
    400: '#34C759', // Main football green
    500: '#2ca84a',
    600: '#24893c',
    700: '#1c6a2e',
    800: '#144b20',
    900: '#0c2c12',
  },

  // Semantic colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  // Dark theme
  dark: {
    background: '#0F0F23',
    card: '#1A1A2E',
    cardSecondary: '#252538',
    border: '#2A2A3E',
    text: '#E4E4E7',
    textSecondary: '#A1A1AA',
    muted: '#71717A',
  },

  // Light theme
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    cardSecondary: '#F3F4F6',
    border: '#E5E5EA',
    text: '#1C1C1E',
    textSecondary: '#6B7280',
    muted: '#8E8E93',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
  card: 16,
  button: 12,
  input: 10,
  avatar: 9999,
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const FontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const Shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Theme types for dark/light mode
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    cardSecondary: string;
    border: string;
    text: string;
    textSecondary: string;
    muted: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: Colors.primary[500],
    secondary: Colors.football[400],
    background: Colors.light.background,
    card: Colors.light.card,
    cardSecondary: Colors.light.cardSecondary,
    border: Colors.light.border,
    text: Colors.light.text,
    textSecondary: Colors.light.textSecondary,
    muted: Colors.light.muted,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    info: Colors.info,
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: Colors.primary[500],
    secondary: Colors.football[400],
    background: Colors.dark.background,
    card: Colors.dark.card,
    cardSecondary: Colors.dark.cardSecondary,
    border: Colors.dark.border,
    text: Colors.dark.text,
    textSecondary: Colors.dark.textSecondary,
    muted: Colors.dark.muted,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    info: Colors.info,
  },
};
