import { TextStyle } from 'react-native';

export const typography = {
  // Font Sizes
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    hero: 36,
  },

  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Pre-configured Text Styles
  presets: {
    hero: {
      fontSize: 34,
      lineHeight: 40,
      fontWeight: '700',
      letterSpacing: -0.5,
    } as TextStyle,
    title1: {
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '700',
      letterSpacing: -0.3,
    } as TextStyle,
    title2: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '600',
      letterSpacing: -0.2,
    } as TextStyle,
    title3: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '600',
    } as TextStyle,
    body: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '400',
    } as TextStyle,
    bodyMedium: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '500',
    } as TextStyle,
    subhead: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
    } as TextStyle,
    subheadMedium: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
    } as TextStyle,
    caption: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '400',
    } as TextStyle,
    button: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0.1,
    } as TextStyle,
  },
} as const;
