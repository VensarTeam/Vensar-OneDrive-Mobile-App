import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import { useAppTheme } from '../../../../core/theme';
import { fontFamilies } from '../../../../core/theme/typography';

type AuthInputProps = ComponentProps<typeof TextInput> & {
  errorMessage?: string;
};

export function AuthInput({ errorMessage, style, ...props }: AuthInputProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={styles.field}>
      <TextInput
        activeOutlineColor={colors.primary}
        error={Boolean(errorMessage)}
        mode="outlined"
        outlineColor={colors.border}
        outlineStyle={styles.outline}
        selectionColor={colors.primary}
        style={[styles.input, { backgroundColor: colors.surfaceMuted }, style]}
        textColor={colors.text}
        theme={{ colors: { error: colors.danger, onSurfaceVariant: colors.textMuted } }}
        {...props}
      />
      {errorMessage ? (
        <Text accessibilityRole="alert" selectable style={[styles.error, { color: colors.danger }]}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: { fontFamily: fontFamilies.regular, fontSize: 16, height: 60 },
  outline: { borderCurve: 'continuous', borderRadius: 14 },
  error: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 17, paddingHorizontal: 4 },
});
