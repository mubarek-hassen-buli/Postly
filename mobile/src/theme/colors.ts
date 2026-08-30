/**
 * Postly Design System - Color Palette
 * Premium Telegram-inspired dark theme with vibrant accents and glassmorphism support.
 */

export const colors = {
  // Brand / Primary Telegram Blues
  primary: {
    DEFAULT: '#2AABEE',
    hover: '#229ED9',
    dark: '#0088CC',
    light: '#54C0F8',
    gradientStart: '#2AABEE',
    gradientEnd: '#229ED9',
    subtle: 'rgba(42, 171, 238, 0.12)',
    subtleBorder: 'rgba(42, 171, 238, 0.25)',
  },

  // Background hierarchy (Dark Mode)
  background: {
    base: '#0E1621',       // Deepest background (e.g. app container)
    surface: '#17212B',    // Card / Section background
    elevated: '#242F3D',   // Modals, dropdowns, elevated headers
    highlight: '#2B3B4B',  // Hovered / selected items
    input: '#1C2733',      // Text input fields
  },

  // Text Hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: '#8E9FA8',
    muted: '#5A6F7C',
    disabled: '#3D4C56',
    inverse: '#0E1621',
    link: '#2AABEE',
  },

  // Border & Divider Colors
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: '#2B3B4B',
    focus: '#2AABEE',
  },

  // Semantic Status Colors
  status: {
    success: '#34C759',
    successBg: 'rgba(52, 199, 89, 0.12)',
    successBorder: 'rgba(52, 199, 89, 0.25)',

    warning: '#FF9500',
    warningBg: 'rgba(255, 149, 0, 0.12)',
    warningBorder: 'rgba(255, 149, 0, 0.25)',

    error: '#FF3B30',
    errorBg: 'rgba(255, 59, 48, 0.12)',
    errorBorder: 'rgba(255, 59, 48, 0.25)',

    info: '#007AFF',
    infoBg: 'rgba(0, 122, 255, 0.12)',
    infoBorder: 'rgba(0, 122, 255, 0.25)',

    draft: '#8E9FA8',
    scheduled: '#FF9500',
    publishing: '#2AABEE',
    published: '#34C759',
    failed: '#FF3B30',
  },

  // Glassmorphism overlays
  glass: {
    background: 'rgba(23, 33, 43, 0.75)',
    border: 'rgba(255, 255, 255, 0.12)',
    card: 'rgba(36, 47, 61, 0.65)',
  },

  // Overlay / Backdrop
  overlay: 'rgba(14, 22, 33, 0.75)',
} as const;

export type Colors = typeof colors;
