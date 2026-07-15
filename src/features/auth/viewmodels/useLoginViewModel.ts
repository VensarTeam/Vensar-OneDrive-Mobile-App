import { useCallback, useMemo, useState } from 'react';

import { useToast } from '../../../shared/toast/toast-provider';
import type { AuthFieldErrors } from '../models/authCredentials';
import type { OtpDeliveryDetails } from '../models/authApiModels';
import { requestOtp } from '../repositories/authRepository';
import { validateCredentials } from '../services/authValidationService';

export function useLoginViewModel(onSuccess: (details: OtpDeliveryDetails) => void) {
  const { showToast } = useToast();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => loginId.trim().length > 0 && password.length > 0 && !isSubmitting,
    [isSubmitting, loginId, password],
  );

  const submit = useCallback(async () => {
    const nextErrors = validateCredentials({ loginId, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await requestOtp({ loginId: loginId.trim(), password });
      showToast({ message: response.message, title: 'OTP sent' });
      onSuccess(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to request OTP.';
      setErrors({ loginId: message });
      showToast({ message, tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [loginId, onSuccess, password, showToast]);

  return {
    canSubmit,
    loginId,
    errors,
    isPasswordVisible,
    isSubmitting,
    password,
    setLoginId: (value: string) => {
      setLoginId(value);
      if (errors.loginId) setErrors((current) => ({ ...current, loginId: undefined }));
    },
    setPassword: (value: string) => {
      setPassword(value);
      if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
    },
    submit,
    togglePasswordVisibility: () => setPasswordVisible((visible) => !visible),
  };
}
