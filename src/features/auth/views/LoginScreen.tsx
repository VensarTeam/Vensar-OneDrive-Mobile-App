import { useCallback } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TextInput } from 'react-native-paper';

import type { RootStackParamList } from '../../../navigation/routes';
import type { OtpDeliveryDetails } from '../models/authApiModels';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import { AuthInput } from './components/AuthInput';
import { AuthShell } from './components/AuthShell';
import { PrimaryButton } from './components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const goToOtp = useCallback(
    ({ email, identifier, mobile }: OtpDeliveryDetails) =>
      navigation.navigate('Otp', { email, identifier, mobile }),
    [navigation],
  );
  const vm = useLoginViewModel(goToOtp);

  return (
    <AuthShell
      subtitle="Sign in with your mobile number or work email to continue."
      title="Welcome back"
    >
      <View style={{ gap: 18 }}>
        <AuthInput
          autoCapitalize="none"
          autoComplete="username"
          errorMessage={vm.errors.loginId}
          label="Mobile number or email"
          left={<TextInput.Icon icon="account-outline" />}
          onChangeText={vm.setLoginId}
          onSubmitEditing={() => undefined}
          placeholder="Mobile number or work email"
          returnKeyType="next"
          textContentType="username"
          value={vm.loginId}
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
