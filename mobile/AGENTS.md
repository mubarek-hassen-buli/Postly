# Mobile Development & UI Guidelines

## 1. Expo SDK Version
- Always consult versioned Expo SDK 57 docs at https://docs.expo.dev/versions/v57.0.0/ before writing or importing Expo APIs.

## 2. STRICT RULE: NO WEB DESIGN OR ANTI-SLOP SKILLS FOR MOBILE
- **DO NOT USE Web Front-End Design Skills or Anti-Slop Skills for Mobile**: Under no circumstances should the web application development guidelines, the `anti-slop` skill, or any web-oriented design heuristics be applied to the mobile application.
- **Reason**: Those skills are specifically tailored for desktop browsers and web layouts. Applying them to React Native results in distorted spacing, cramped layouts, unnatural densities, and poor mobile UX.
- **Native Mobile Guidelines Exclusively**:
  - Always adhere to native mobile design principles (iOS Human Interface Guidelines & Android Material Design).
  - Use native mobile spacing, comfortable touch target boundaries (minimum 44x44 pt), thumb-friendly zones, and native safe area insets.
  - Rely strictly on Postly's native mobile theme tokens (`mobile/src/theme/spacing.ts`, `mobile/src/theme/colors.ts`, `mobile/src/theme/typography.ts`) and React Native flexbox layout.
  - Do not introduce web layout patterns (such as desktop-oriented horizontal padding, nested web cards, or arbitrary web centering).
