import { useCallback } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TextInput } from 'react-native-paper';

import type { RootStackParamList } from '../../../navigation/routes';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import { AuthInput } from './components/AuthInput';
import { AuthShell } from './components/AuthShell';
import { PrimaryButton } from './components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const goToOtp = useCallback((email: string) => navigation.navigate('Otp', { email }), [navigation]);
  const vm = useLoginViewModel(goToOtp);

  return (
    <AuthShell
      subtitle="Sign in with your work email to continue."
      title="Welcome back"
    >
      <View style={{ gap: 18 }}>
        <AuthInput
          autoCapitalize="none"
          autoComplete="email"
          errorMessage={vm.errors.email}
          keyboardType="email-address"
          label="Email address"
          left={<TextInput.Icon icon="email-outline" />}
          onChangeText={vm.setEmail}
          onSubmitEditing={() => undefined}
          placeholder="name@company.com"
          returnKeyType="next"
          textContentType="emailAddress"
          value={vm.email}
        />
        <AuthInput
          autoComplete="current-password"
          errorMessage={vm.errors.password}
          label="Password"
          left={<TextInput.Icon icon="lock-outline" />}
          onChangeText={vm.setPassword}
          onSubmitEditing={vm.submit}
          placeholder="Enter your password"
          returnKeyType="done"
          secureTextEntry={!vm.isPasswordVisible}
          textContentType="password"
          value={vm.password}
          right={
            <TextInput.Icon
              accessibilityLabel={vm.isPasswordVisible ? 'Hide password' : 'Show password'}
              icon={vm.isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              onPress={vm.togglePasswordVisibility}
            />
          }
        />
      </View>
      <PrimaryButton disabled={!vm.canSubmit} loading={vm.isSubmitting} onPress={vm.submit} title="Sign in" />
    </AuthShell>
  );
}
