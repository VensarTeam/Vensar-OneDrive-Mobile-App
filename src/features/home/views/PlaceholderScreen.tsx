import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';

type PlaceholderScreenProps = {
  description: string;
  icon: string;
  title: string;
};

export function PlaceholderScreen({ description, icon, title }: PlaceholderScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface, paddingTop: insets.top + 20 }]}> 
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={styles.emptyState}>
        <View style={[styles.iconShell, { backgroundColor: colors.surfaceMuted }]}>
          <Icon color={colors.primary} size={38} source={icon} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing here yet</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  title: { fontFamily: fontFamilies.bold, fontSize: 28 },
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingBottom: 80 },
  iconShell: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 24, height: 82, justifyContent: 'center', width: 82 },
  emptyTitle: { fontFamily: fontFamilies.semibold, fontSize: 18, paddingTop: 20 },
  description: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 21, maxWidth: 280, paddingTop: 7, textAlign: 'center' },
});
