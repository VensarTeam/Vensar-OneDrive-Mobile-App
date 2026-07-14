import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { resendOtp, verifyOtp } from '../repositories/authRepository';
import { isValidOtp } from '../services/authValidationService';

const otpLifetimeSeconds = 5 * 60;
const automaticVerificationDurationMs = 4_000;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export function useOtpViewModel(email: string, onSuccess: () => void) {
  const [otp, setOtp] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(otpLifetimeSeconds);
  const [error, setError] = useState<string>();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isResending, setResending] = useState(false);
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
      await Promise.all([verifyOtp(email, otp), wait(automaticVerificationDurationMs)]);
      onSuccess();
    } catch {
      setError('Automatic verification failed. Check the code and try again.');
    } finally {
      setAutoVerifying(false);
    }
  }, [email, isAutoVerifying, isExpired, onSuccess, otp]);

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
      await verifyOtp(email, otp);
      onSuccess();
    } catch {
      setError('Verification failed. Check the code and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [email, isExpired, onSuccess, otp]);

  const resend = useCallback(async () => {
    setResending(true);
    try {
      await resendOtp(email);
      setOtp('');
      automaticAttemptedOtp.current = undefined;
      setError(undefined);
      setSecondsRemaining(otpLifetimeSeconds);
    } finally {
      setResending(false);
    }
  }, [email]);

  return {
    canSubmit: otp.length === 6 && !isExpired && !isSubmitting && !isAutoVerifying,
    error,
    formattedTime,
    isExpired,
    isResending,
    isSubmitting,
    isAutoVerifying,
    otp,
    resend,
    setOtp: (value: string) => {
      const nextOtp = value.replace(/\D/g, '').slice(0, 6);
      if (nextOtp !== otp) automaticAttemptedOtp.current = undefined;
      setOtp(nextOtp);
      setError(undefined);
    },
    submit,
  };
}
