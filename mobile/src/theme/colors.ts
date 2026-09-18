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
    subtle: 'rgba(42, 171, 238, 0.10)',
    subtleBorder: 'rgba(42, 171, 238, 0.25)',
  },

  // Background hierarchy (Option A: Clean Apple/Stripe Light Mode)
  background: {
    base: '#F6F8FB',       // Crisp off-white app canvas (prevents harsh pure-white glare)
    surface: '#FFFFFF',    // Card / Section background
    elevated: '#FFFFFF',   // Modals, dropdowns, elevated sheets
    highlight: '#F1F5F9',  // Hovered / selected items, chips
    input: '#F1F5F9',      // Clean input fields
  },

  // Text Hierarchy (Dark Slate / Charcoal)
  text: {
    primary: '#0F172A',    // Slate 900: High-contrast headings and prominent text
    secondary: '#475569',  // Slate 600: Body text, subheadings, labels
    muted: '#94A3B8',      // Slate 400: Placeholders, captions, timestamps
    disabled: '#CBD5E1',   // Slate 300: Disabled controls
    inverse: '#FFFFFF',    // High-contrast text on dark surfaces
    link: '#0284C7',       // Accessible link blue
  },

  // Border & Divider Colors
  border: {
    subtle: '#E2E8F0',     // Slate 200: Crisp borders & dividers
    medium: '#CBD5E1',     // Slate 300: Outlines, inactive controls
    strong: '#94A3B8',     // Slate 400: Emphasized borders
    focus: '#2AABEE',      // Telegram Blue on focus
  },

  // Semantic Status Colors (Rich, accessible on light backgrounds)
  status: {
    success: '#16A34A',
    successBg: '#F0FDF4',
    successBorder: '#BBF7D0',

    warning: '#D97706',
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',

    error: '#DC2626',
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',

    info: '#0284C7',
    infoBg: '#F0F9FF',
    infoBorder: '#BAE6FD',

    draft: '#64748B',
    scheduled: '#D97706',
    publishing: '#2AABEE',
    published: '#16A34A',
    failed: '#DC2626',
  },

  // Glassmorphism overlays (Frosted light surfaces)
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(0, 0, 0, 0.08)',
    card: 'rgba(255, 255, 255, 0.95)',
  },

  // Overlay / Backdrop
  overlay: 'rgba(15, 23, 42, 0.45)',
} as const;

export type Colors = typeof colors;
