import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '../../../core/responsive';
import { useAppTheme } from '../../../core/theme';
import { Screen } from '../../../shared/components/Screen';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';

export function HomeScreen() {
  const viewModel = useHomeViewModel();
  const responsive = useResponsiveLayout();
  const { colorScheme, theme } = useAppTheme();
  const { colors, spacing, typography } = theme;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.success }]}>Project setup</Text>
        <Text style={[styles.title, typography.title, { color: colors.text }]}>{viewModel.title}</Text>
        <Text style={[styles.subtitle, typography.subtitle, { color: colors.textMuted }]}>
          {viewModel.subtitle}
        </Text>
        <Text style={[styles.modeLabel, typography.label, { color: colors.textMuted }]}>
          Theme: {colorScheme}
        </Text>
      </View>

      <View
        style={[
          styles.actionList,
          {
            flexDirection: responsive.isExpanded ? 'row' : 'column',
            flexWrap: responsive.isExpanded ? 'wrap' : 'nowrap',
            gap: spacing.md,
          },
        ]}
      >
        {viewModel.actions.map((action) => (
          <Pressable
            accessibilityRole="button"
            key={action.id}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
                borderColor: pressed ? colors.primary : colors.border,
                padding: spacing.md,
                width: responsive.isExpanded ? '48%' : '100%',
              },
            ]}
          >
            <Text style={[styles.actionTitle, typography.label, { color: colors.text }]}>
              {action.title}
            </Text>
            <Text style={[styles.actionDescription, typography.body, { color: colors.textMuted }]}>
              {action.description}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 32,
  },
  eyebrow: {
    textTransform: 'uppercase',
  },
  title: {},
  subtitle: {},
  modeLabel: {},
  actionList: {
    alignItems: 'stretch',
  },
  actionCard: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 120,
  },
  actionTitle: { marginBottom: 4 },
  actionDescription: {},
});
