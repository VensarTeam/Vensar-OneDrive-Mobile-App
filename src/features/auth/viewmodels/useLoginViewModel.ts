import { useCallback, useMemo, useState } from 'react';

import type { AuthFieldErrors } from '../models/authCredentials';
import { requestOtp } from '../repositories/authRepository';
import { validateCredentials } from '../services/authValidationService';

export function useLoginViewModel(onSuccess: (email: string) => void) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !isSubmitting,
    [email, isSubmitting, password],
  );

  const submit = useCallback(async () => {
    const nextErrors = validateCredentials({ email, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await requestOtp({ email: email.trim(), password });
      onSuccess(email.trim());
    } finally {
      setSubmitting(false);
    }
  }, [email, onSuccess, password]);

  return {
    canSubmit,
    email,
    errors,
    isPasswordVisible,
    isSubmitting,
    password,
    setEmail: (value: string) => {
      setEmail(value);
      if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
    },
    setPassword: (value: string) => {
      setPassword(value);
      if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
    },
    submit,
    togglePasswordVisibility: () => setPasswordVisible((visible) => !visible),
  };
}
