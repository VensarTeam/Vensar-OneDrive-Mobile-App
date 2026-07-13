import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '../../core/responsive';
import { useAppTheme } from '../../core/theme';

export function Screen({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const { theme } = useAppTheme();
  const { spacing } = theme;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: responsive.horizontalPadding,
        },
      ]}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.content, { maxWidth: responsive.maxContentWidth }]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  content: {
    width: '100%',
  },
});
