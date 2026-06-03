export const colors = {
  primary: {
    green700: '#1B5E20',
    green600: '#2E7D32',
    green500: '#4CAF50',
    green100: '#C8E6C9',
    green50: '#E8F5E9',
  },
  neutral: {
    black: '#1B1B1B',
    gray800: '#333333',
    gray600: '#666666',
    gray400: '#9E9E9E',
    gray200: '#E0E0E0',
    gray100: '#F5F5F5',
    white: '#FFFFFF',
  },
  functional: {
    error: '#D32F2F',
    errorBg: '#FFEBEE',
    warning: '#F57C00',
    warningBg: '#FFF3E0',
    info: '#1976D2',
    infoBg: '#E3F2FD',
    success: '#4CAF50',
  },
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySm: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmMedium: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  buttonLg: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  buttonSm: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  link: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
};

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 20,
  full: 9999,
};

import { Platform } from 'react-native';

export const shadows = {
  sm: Platform.select({
    web: { boxShadow: '0px 1px 2px rgba(0,0,0,0.05)' },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  })!,
  md: Platform.select({
    web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  })!,
  lg: Platform.select({
    web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  })!,
  nav: Platform.select({
    web: { boxShadow: '0px -1px 4px rgba(0,0,0,0.05)' },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  })!,
};
