import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useToast } from '../../../shared/toast/toast-provider';
import { verifyOtp } from '../repositories/authRepository';
import { useAuthSession } from '../services/auth-session-provider';
import { isValidOtp } from '../services/authValidationService';

const otpLifetimeSeconds = 5 * 60;

export function useOtpViewModel(identifier: string, onSuccess: () => void) {
  const { showToast } = useToast();
  const { completeSignIn } = useAuthSession();
  const [otp, setOtp] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(otpLifetimeSeconds);
  const [error, setError] = useState<string>();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isAutoVerifying, setAutoVerifying] = useState(false);
  const automaticAttemptedOtp = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = setTimeout(() => setSecondsRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  const isExpired = secondsRemaining === 0;
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    return `${minutes}:${String(secondsRemaining % 60).padStart(2, '0')}`;
  }, [secondsRemaining]);

  const verifyAutomatically = useCallback(async () => {
    if (
      !isValidOtp(otp) ||
      isExpired ||
      isAutoVerifying ||
      automaticAttemptedOtp.current === otp
    ) {
      return;
    }

    automaticAttemptedOtp.current = otp;
    setError(undefined);
    setAutoVerifying(true);
    try {
      const response = await verifyOtp(identifier, otp);
      await completeSignIn(response);
      showToast({ message: 'Your account has been verified securely.', title: 'Welcome back' });
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Verification failed. Check the code and try again.';
      setError(message);
      showToast({ message, tone: 'error' });
    } finally {
      setAutoVerifying(false);
    }
  }, [completeSignIn, identifier, isAutoVerifying, isExpired, onSuccess, otp, showToast]);

  useEffect(() => {
    if (otp.length === 6) void verifyAutomatically();
  }, [otp, verifyAutomatically]);

  const submit = useCallback(async () => {
    if (isExpired) {
      setError('This code has expired. Request a new code.');
      return;
    }
    if (!isValidOtp(otp)) {
      setError('Enter the complete 6-digit code.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await verifyOtp(identifier, otp);
      await completeSignIn(response);
      showToast({ message: 'Your account has been verified securely.', title: 'Welcome back' });
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Verification failed. Check the code and try again.';
      setError(message);
      showToast({ message, tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [completeSignIn, identifier, isExpired, onSuccess, otp, showToast]);

  return {
    canSubmit: otp.length === 6 && !isExpired && !isSubmitting && !isAutoVerifying,
    error,
    formattedTime,
    isExpired,
    isSubmitting,
    isAutoVerifying,
    otp,
    setOtp: (value: string) => {
      const nextOtp = value.replace(/\D/g, '').slice(0, 6);
      if (nextOtp !== otp) automaticAttemptedOtp.current = undefined;
      setOtp(nextOtp);
      setError(undefined);
    },
    submit,
  };
}
