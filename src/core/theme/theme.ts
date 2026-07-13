import { darkColors, lightColors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const lightTheme = {
  colors: lightColors,
  spacing,
  typography,
} as const;

export const darkTheme = {
  colors: darkColors,
  spacing,
  typography,
} as const;
