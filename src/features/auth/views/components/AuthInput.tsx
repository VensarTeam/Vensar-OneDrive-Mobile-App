import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import { useAppTheme } from '../../../../core/theme';
import { fontFamilies } from '../../../../core/theme/typography';

type AuthInputProps = ComponentProps<typeof TextInput> & {
  errorMessage?: string;
};

export function AuthInput({
  errorMessage,
  style,
  ...props
}: AuthInputProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={styles.field}>
      <TextInput
        activeOutlineColor="#78AEE0"
        cursorColor="#78AEE0"
        error={Boolean(errorMessage)}
        mode="outlined"
        outlineColor="#6D89A8"
        outlineStyle={styles.outline}
        selectionColor="#78AEE0"
        style={[
          styles.input,
          {
            backgroundColor: '#F7F9FC',
          },
          style,
        ]}
        textColor="#66768A"
        placeholderTextColor="#C0CCDB"
        theme={{
          colors: {
            error: colors.danger,
            onSurfaceVariant: '#6D7D91',
          },
        }}
        {...props}
      />

      {errorMessage ? (
        <Text
          accessibilityRole="alert"
          selectable
          style={[
            styles.error,
            {
              color: colors.danger,
            },
          ]}
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 5,
  },

  input: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    height: 60,
  },

  outline: {
    borderCurve: 'continuous',
    borderRadius: 17,
    borderWidth: 1,
  },

  error: {
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 4,
  },
});