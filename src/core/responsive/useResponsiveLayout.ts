import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { breakpoints, layout } from './breakpoints';

export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();

  return useMemo(() => {
    const isExpanded = width >= breakpoints.expanded;
    const isMedium = width >= breakpoints.medium && !isExpanded;
    const isCompact = width < breakpoints.medium;

    const horizontalPadding = isExpanded
      ? layout.expandedHorizontalPadding
      : isMedium
        ? layout.mediumHorizontalPadding
        : layout.compactHorizontalPadding;

    return {
      fontScale,
      height,
      horizontalPadding,
      isCompact,
      isExpanded,
      isLandscape: width > height,
      isMedium,
      maxContentWidth: layout.contentMaxWidth,
      width,
    };
  }, [fontScale, height, width]);
}
