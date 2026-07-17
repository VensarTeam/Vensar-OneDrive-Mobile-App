import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../core/theme';
import { fontFamilies } from '../../core/theme/typography';

export function BottomSheetShell({
  children,
  leading,
  onClose,
  title,
  visible,
}: PropsWithChildren<{
  leading?: ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
}>) {
  const insets = useSafeAreaInsets();
  const { colorScheme, theme } = useAppTheme();

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
        style={styles.fill}
      >
        <Pressable accessibilityLabel="Close sheet" onPress={onClose} style={styles.backdrop} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              boxShadow: colorScheme === 'dark' ? '0 -18px 48px rgba(0, 0, 0, 0.52)' : '0 -18px 48px rgba(8, 15, 28, 0.24)',
              marginTop: insets.top + 24,
              paddingBottom: Math.max(insets.bottom, 14),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.leading}>{leading}</View>
            <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            <Pressable
              accessibilityLabel="Close"
              hitSlop={10}
              onPress={onClose}
              style={({ pressed }) => [styles.close, { opacity: pressed ? 0.45 : 1 }]}
            >
              <Icon color={theme.colors.textMuted} size={21} source="close" />
            </Pressable>
          </View>
          <View style={styles.body}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(8, 15, 28, 0.52)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  sheet: {
    borderCurve: 'continuous',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  handle: { alignSelf: 'center', borderRadius: 3, height: 5, marginTop: 9, width: 42 },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 16,
  },
  leading: { alignItems: 'flex-start', width: 36 },
  title: { flex: 1, fontFamily: fontFamilies.bold, fontSize: 16, textAlign: 'center' },
  close: { alignItems: 'flex-end', justifyContent: 'center', width: 36 },
  body: { flexShrink: 1 },
});
