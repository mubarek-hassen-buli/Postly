import { TextStyle } from 'react-native';

export const typography = {
  // Font Families: Fredoka is the unified main font family for Postly
  fonts: {
    display: 'Fredoka-Bold',
    displaySemiBold: 'Fredoka-SemiBold',
    displayMedium: 'Fredoka-Medium',
    displayRegular: 'Fredoka-Regular',
    body: 'Fredoka-Regular',
    bodyMedium: 'Fredoka-Medium',
    bodySemiBold: 'Fredoka-SemiBold',
    bodyBold: 'Fredoka-Bold',
    bodyLight: 'Fredoka-Light',
  },

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
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Pre-configured Text Styles (Unified Fredoka)
  presets: {
    hero: {
      fontFamily: 'Fredoka-Bold',
      fontSize: 34,
      lineHeight: 40,
      letterSpacing: -0.5,
    } as TextStyle,
    title1: {
      fontFamily: 'Fredoka-Bold',
      fontSize: 26,
      lineHeight: 32,
      letterSpacing: -0.3,
    } as TextStyle,
    title2: {
      fontFamily: 'Fredoka-SemiBold',
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: -0.2,
    } as TextStyle,
    title3: {
      fontFamily: 'Fredoka-Medium',
      fontSize: 17,
      lineHeight: 22,
    } as TextStyle,
    body: {
      fontFamily: 'Fredoka-Regular',
      fontSize: 15,
      lineHeight: 21,
    } as TextStyle,
    bodyMedium: {
      fontFamily: 'Fredoka-Medium',
      fontSize: 15,
      lineHeight: 21,
    } as TextStyle,
    subhead: {
      fontFamily: 'Fredoka-Regular',
      fontSize: 13,
      lineHeight: 18,
    } as TextStyle,
    subheadMedium: {
      fontFamily: 'Fredoka-Medium',
      fontSize: 13,
      lineHeight: 18,
    } as TextStyle,
    caption: {
      fontFamily: 'Fredoka-Regular',
      fontSize: 11,
      lineHeight: 14,
    } as TextStyle,
    button: {
      fontFamily: 'Fredoka-SemiBold',
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: 0.2,
    } as TextStyle,
  },
} as const;
