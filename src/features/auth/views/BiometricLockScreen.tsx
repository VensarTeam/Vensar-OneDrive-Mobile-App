import { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../../core/theme';
import { fontFamilies } from '../../../core/theme/typography';
import { useAuthSession } from '../services/auth-session-provider';

export function BiometricLockScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { biometricLabel, isUnlocking, lockError, signOut, unlock, user } = useAuthSession();
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    void unlock();
  }, [unlock]);

  const iconName = biometricLabel === 'Face ID' ? 'face-recognition' : 'fingerprint';

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingBottom: insets.bottom + 28,
          paddingTop: insets.top + 28,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconShell, { backgroundColor: theme.colors.surfaceMuted }]}> 
          <MaterialCommunityIcons color={theme.colors.primary} name={iconName} size={52} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Vensar Drive is locked</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. Use {biometricLabel} to
            securely continue.
          </Text>
          {lockError ? (
            <Text accessibilityLiveRegion="polite" style={[styles.error, { color: theme.colors.danger }]}>
              {lockError}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={`Unlock with ${biometricLabel}`}
          accessibilityRole="button"
          disabled={isUnlocking}
          onPress={() => void unlock()}
          style={({ pressed }) => [
            styles.unlockButton,
            { backgroundColor: pressed ? theme.colors.primaryPressed : theme.colors.primary },
          ]}
        >
          {isUnlocking ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <>
              <MaterialCommunityIcons color={theme.colors.onPrimary} name={iconName} size={23} />
              <Text style={[styles.unlockText, { color: theme.colors.onPrimary }]}>Unlock with {biometricLabel}</Text>
            </>
          )}
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.signOutButton}>
          <Text style={[styles.signOutText, { color: theme.colors.textMuted }]}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 10, width: '100%' },
  content: { alignItems: 'center', gap: 28 },
  copy: { alignItems: 'center', gap: 10 },
  error: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 20, maxWidth: 330, textAlign: 'center' },
  iconShell: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 32, height: 112, justifyContent: 'center', width: 112 },
  screen: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28 },
  signOutButton: { alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  signOutText: { fontFamily: fontFamilies.semibold, fontSize: 15 },
  subtitle: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24, maxWidth: 340, textAlign: 'center' },
  title: { fontFamily: fontFamilies.bold, fontSize: 27, lineHeight: 34, textAlign: 'center' },
  unlockButton: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 16, flexDirection: 'row', gap: 10, justifyContent: 'center', minHeight: 56, paddingHorizontal: 20 },
  unlockText: { fontFamily: fontFamilies.semibold, fontSize: 16 },
});
