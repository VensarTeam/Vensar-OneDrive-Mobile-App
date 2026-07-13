import type { darkTheme, lightTheme } from './theme';

export type AppColorScheme = 'light' | 'dark';
export type AppTheme = typeof lightTheme | typeof darkTheme;
