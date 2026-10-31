import React from 'react';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';
import { ViewStyle, StyleProp } from 'react-native';

export interface BrandIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Official Telegram Airplane Icon (Glyph)
 * Respects `color` prop for monochromatic use in buttons, chips, and labels.
 */
export const TelegramIcon: React.FC<BrandIconProps> = ({
  size = 20,
  color = '#2AABEE',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Path
        d="M21.543 6.498L18.216 22.186C17.969 23.293 17.314 23.567 16.388 23.047L11.32 19.313L8.874 21.668C8.604 21.939 8.377 22.166 7.855 22.166L8.219 17.003L17.616 8.513C18.025 8.149 17.527 7.946 16.981 8.31L5.367 15.623L0.361 14.059C-0.727 13.719 -0.748 12.971 0.588 12.449L20.15 4.88C21.055 4.55 21.847 5.091 21.543 6.498Z"
        fill={color}
      />
    </Svg>
  );
};

/**
 * Official Telegram Circular Badge (Blue disk with white paper plane)
 */
export const TelegramLogo: React.FC<BrandIconProps> = ({
  size = 24,
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Circle cx="12" cy="12" r="12" fill="#2AABEE" />
      <Path
        d="M17.6 7.8c.08-.002.26.018.37.112.1.08.14.18.14.26s.03.24.01.38c-.14 1.52-.77 5.2-1.09 6.9-.13.72-.4 1-.66 1.02-.56.05-.98-.37-1.52-.72-.85-.56-1.32-.9-2.14-1.44-.95-.62-.33-.97.2-1.53.14-.15 2.6-2.38 2.65-2.58.01-.03.01-.12-.05-.17s-.14-.03-.2-.02c-.08.02-1.43.91-4.05 2.68-.38.26-.73.39-1.04.38-.34-.01-1-.19-1.49-.35-.6-.2-1.08-.3-1.04-.63.02-.17.26-.35.72-.53 2.8-1.22 4.66-2.02 5.6-2.41 2.67-1.11 3.22-1.3 3.58-1.31z"
        fill="#FFFFFF"
      />
    </Svg>
  );
};

/**
 * Official LinkedIn "in" Icon (Glyph)
 * Respects `color` prop for monochromatic use in buttons, chips, and labels.
 */
export const LinkedInIcon: React.FC<BrandIconProps> = ({
  size = 20,
  color = '#0A66C2',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      {/* 'i' dot */}
      <Circle cx="5.3" cy="5.3" r="2.1" fill={color} />
      {/* 'i' stem */}
      <Rect x="3.5" y="9" width="3.6" height="11.5" rx="0.5" fill={color} />
      {/* 'n' letter */}
      <Path
        d="M20.5 20.5h-3.6v-5.6c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.7H9.3V9h3.4v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.38 2.37 4.38 5.46v6.33z"
        fill={color}
      />
    </Svg>
  );
};

/**
 * Official LinkedIn Badge (Rounded blue square with white "in")
 */
export const LinkedInLogo: React.FC<BrandIconProps> = ({
  size = 24,
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Rect width="24" height="24" rx="4.8" fill="#0A66C2" />
      <Circle cx="5.8" cy="6.2" r="1.9" fill="#FFFFFF" />
      <Rect x="4.2" y="9.5" width="3.2" height="10.2" rx="0.4" fill="#FFFFFF" />
      <Path
        d="M19.2 19.7h-3.2v-5c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.91 1.29-1.91 2.63v5.09H9.3V9.5h3v1.4h.04c.43-.8 1.47-1.66 3.02-1.66 3.23 0 3.84 2.12 3.84 4.88v5.58z"
        fill="#FFFFFF"
      />
    </Svg>
  );
};

