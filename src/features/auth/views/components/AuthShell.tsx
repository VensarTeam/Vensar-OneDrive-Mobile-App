import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useResponsiveLayout } from '../../../../core/responsive';
import { useAppTheme } from '../../../../core/theme';
import { fontFamilies } from '../../../../core/theme/typography';

type AuthShellProps = PropsWithChildren<{
  subtitle: string;
  title: string;
}>;

export function AuthShell({ children, subtitle, title }: AuthShellProps) {
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const { colorScheme, theme } = useAppTheme();
  const { colors } = theme;

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'android' ? 'height' : 'padding'}
      enabled
      keyboardVerticalOffset={0}
      style={styles.flex}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets={process.env.EXPO_OS === 'ios'}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 28),
            paddingHorizontal: responsive.isCompact ? 20 : 40,
            paddingTop: Math.max(insets.top, 28),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode={process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        <View pointerEvents="none" style={[styles.orb, styles.orbTop, { backgroundColor: colors.accent }]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbBottom, { backgroundColor: colors.primary }]} />
        <CloudStorageBackdrop color={colors.primary} />

        <Animated.View entering={FadeInUp.duration(520).springify().damping(18)} style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, paddingHorizontal: responsive.isCompact ? 24 : 42 }]}> 
            <View style={styles.brandLockup}>
              <Image
                accessibilityLabel="OneDrive by Vensar"
                contentFit="contain"
                source={
                  colorScheme === 'dark'
                    ? require('../../../../../assets/onedrive-vensar-dark.png')
                    : require('../../../../../assets/onedrive-vensar-light.png')
                }
                style={styles.logo}
              />
            </View>
            <View style={styles.heading}>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}> 
                {title}
              </Text>
              <Text selectable style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
            </View>
            <View style={styles.form}>{children}</View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function CloudStorageBackdrop({ color }: { color: string }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.cloudCluster}>
        <Icon color={color} size={92} source="cloud-outline" />
        <View style={[styles.fileTile, styles.fileTileOne, { borderColor: color }]}> 
          <Icon color={color} size={17} source="file-outline" />
        </View>
        <View style={[styles.fileTile, styles.fileTileTwo, { borderColor: color }]}> 
          <Icon color={color} size={17} source="image-outline" />
        </View>
      </View>
      <View style={styles.smallCloud}>
        <Icon color={color} size={58} source="cloud-outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { alignItems: 'center', flexGrow: 1, justifyContent: 'center' },
  content: { maxWidth: 510, width: '100%' },
  card: { borderCurve: 'continuous', borderRadius: 28, borderWidth: 1, boxShadow: '0 24px 70px rgba(30, 76, 112, 0.13)', paddingBottom: 40, paddingTop: 36 },
  brandLockup: { alignItems: 'center', alignSelf: 'center', height: 82, justifyContent: 'center', width: 230 },
  logo: { height: 82, width: 230 },
  heading: { alignItems: 'center', gap: 9, paddingTop: 27 },
  title: { fontFamily: fontFamilies.bold, fontSize: 31, letterSpacing: -0.9, lineHeight: 38, textAlign: 'center' },
  subtitle: { fontFamily: fontFamilies.regular, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  form: { gap: 26, paddingTop: 32 },
  orb: { borderRadius: 999, opacity: 0.07, position: 'absolute' },
  orbTop: { height: 360, left: -180, top: -130, width: 360 },
  orbBottom: { bottom: -190, height: 420, right: -210, width: 420 },
  cloudCluster: { opacity: 0.08, position: 'absolute', right: 24, top: 78 },
  fileTile: { alignItems: 'center', backgroundColor: '#FFFFFF', borderCurve: 'continuous', borderRadius: 8, borderWidth: 1, height: 32, justifyContent: 'center', position: 'absolute', width: 32 },
  fileTileOne: { right: 3, top: 56, transform: [{ rotate: '5deg' }] },
  fileTileTwo: { right: 38, top: 70, transform: [{ rotate: '-5deg' }] },
  smallCloud: { bottom: 62, left: 24, opacity: 0.055, transform: [{ rotate: '-4deg' }] },
});
