import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Icon, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../core/theme';
import { fontFamilies } from '../../core/theme/typography';

export type ToastTone = 'error' | 'success';

type ShowToastOptions = {
  duration?: number;
  message: string;
  title?: string;
  tone?: ToastTone;
};

type ToastState = Required<Omit<ShowToastOptions, 'duration'>> & {
  duration: number;
  id: number;
};

type ToastContextValue = {
  hideToast: () => void;
  showToast: (options: ShowToastOptions) => void;
};

const defaultDuration = 3_500;
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const hideToast = useCallback(() => setToast(null), []);
  const showToast = useCallback((options: ShowToastOptions) => {
    const tone = options.tone ?? 'success';
    const title = options.title ?? (tone === 'success' ? 'Success' : 'Something went wrong');
    setToast({
      duration: options.duration ?? defaultDuration,
      id: Date.now(),
      message: options.message,
      title,
      tone,
    });
    AccessibilityInfo.announceForAccessibility(`${title}. ${options.message}`);
  }, []);

  const value = useMemo(() => ({ hideToast, showToast }), [hideToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport onDismiss={hideToast} toast={toast} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ onDismiss, toast }: { onDismiss: () => void; toast: ToastState | null }) {
  const insets = useSafeAreaInsets();
  const { colorScheme, theme } = useAppTheme();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, toast.duration);
    return () => clearTimeout(timer);
  }, [onDismiss, toast]);

  if (!toast) return null;

  const isSuccess = toast.tone === 'success';
  const toneColor = isSuccess ? theme.colors.success : theme.colors.danger;

  return (
    <Portal>
      <View pointerEvents="box-none" style={[styles.viewport, { paddingTop: insets.top + 12 }]}>
        <Animated.View
          entering={FadeInDown.duration(280).springify().damping(18)}
          exiting={FadeOutUp.duration(180)}
          key={toast.id}
          style={[
            styles.toast,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              boxShadow: colorScheme === 'dark' ? '0 12px 32px rgba(0, 0, 0, 0.42)' : '0 12px 32px rgba(15, 23, 42, 0.18)',
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${toneColor}16` }]}>
            <Icon color={toneColor} size={23} source={isSuccess ? 'check-circle' : 'alert-circle'} />
          </View>
          <View style={styles.copy}>
            <Text selectable style={[styles.title, { color: theme.colors.text }]}>
              {toast.title}
            </Text>
            <Text selectable style={[styles.message, { color: theme.colors.textMuted }]}>
              {toast.message}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Dismiss notification"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onDismiss}
            style={({ pressed }) => [styles.dismiss, { opacity: pressed ? 0.45 : 1 }]}
          >
            <Icon color={theme.colors.textMuted} size={19} source="close" />
          </Pressable>
          <View style={[styles.accent, { backgroundColor: toneColor }]} />
        </Animated.View>
      </View>
    </Portal>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}

const styles = StyleSheet.create({
  viewport: {
    alignItems: 'center',
    left: 0,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  toast: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    maxWidth: 520,
    minHeight: 72,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 19 },
  message: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 18 },
  dismiss: { alignItems: 'center', height: 32, justifyContent: 'center', width: 28 },
  accent: { bottom: 0, height: 3, left: 0, position: 'absolute', right: 0 },
});
