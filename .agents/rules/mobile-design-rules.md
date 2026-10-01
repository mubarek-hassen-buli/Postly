# Mobile Front-End Design & Styling Rules

## Strict Constraint: No Web Design Skills or Anti-Slop Skills for Mobile Apps
- **Prohibited Skills on Mobile**: Never use or reference the web application development front-end design skills, the `anti-slop` developer skill, or any desktop web-oriented styling rules when building, editing, or updating the mobile application (`mobile/`).
- **Context & Purpose**: Those design skills are meant exclusively for desktop and web applications. Applying web heuristics to React Native mobile layouts introduces unnatural density, broken spacing, and awkward user experiences.
- **Mobile-First Principles**:
  - Design for native touch screens (iOS Human Interface Guidelines & Android Material Design).
  - Use mobile-appropriate spacing tokens, thumb-friendly navigation, natural scroll momentum, and minimum touch target sizes (44x44 pt).
  - Base all styling strictly on native mobile tokens defined in `mobile/src/theme/` and React Native native styling paradigms.
