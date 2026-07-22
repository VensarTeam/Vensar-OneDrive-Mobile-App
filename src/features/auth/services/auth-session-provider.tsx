import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import type { AuthUser, VerifyOtpResponse } from '../models/authApiModels';
import { clearSession, getStoredSession, saveSession } from '../repositories/session-repository';

type AuthSessionContextValue = {
  biometricLabel: string;
  completeSignIn: (response: VerifyOtpResponse) => Promise<void>;
  isAuthenticated: boolean;
  isHydrating: boolean;
  isLocked: boolean;
  isUnlocking: boolean;
  lockError: string | null;
  signOut: () => Promise<void>;
  unlock: () => Promise<void>;
  user: AuthUser | null;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);
const BACKGROUND_LOCK_DELAY_MS = 5 * 60 * 1000;

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isHydrating, setHydrating] = useState(true);
  const [isLocked, setLocked] = useState(false);
  const [isUnlocking, setUnlocking] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const [biometricLabel, setBiometricLabel] = useState('biometrics');
  const [user, setUser] = useState<AuthUser | null>(null);
  const isAuthenticatingRef = useRef(false);
  const backgroundedAtRef = useRef<number | null>(null);
  const backgroundLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    void getStoredSession()
      .then((session) => {
        setAuthenticated(Boolean(session));
        setLocked(Boolean(session));
        setUser(session?.user ?? null);
      })
      .catch(() => {
        setAuthenticated(false);
        setUser(null);
      })
      .finally(() => setHydrating(false));
  }, []);

  useEffect(() => {
    void LocalAuthentication.supportedAuthenticationTypesAsync()
      .then((types) => {
        if (process.env.EXPO_OS === 'ios') {
          setBiometricLabel(
            types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
              ? 'Face ID'
              : 'Touch ID',
          );
          return;
        }
        setBiometricLabel('fingerprint');
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasActive = appStateRef.current === 'active';
      appStateRef.current = nextState;

      if (nextState !== 'active' && wasActive && isAuthenticated && !isAuthenticatingRef.current) {
        backgroundedAtRef.current = Date.now();
        if (backgroundLockTimerRef.current) clearTimeout(backgroundLockTimerRef.current);
        backgroundLockTimerRef.current = setTimeout(() => {
          setLocked(true);
          setLockError(null);
        }, BACKGROUND_LOCK_DELAY_MS);
        return;
      }

      if (nextState === 'active') {
        if (backgroundLockTimerRef.current) {
          clearTimeout(backgroundLockTimerRef.current);
          backgroundLockTimerRef.current = null;
        }
        const backgroundedAt = backgroundedAtRef.current;
        backgroundedAtRef.current = null;
        if (
          backgroundedAt !== null
          && Date.now() - backgroundedAt >= BACKGROUND_LOCK_DELAY_MS
          && isAuthenticated
          && !isAuthenticatingRef.current
        ) {
          setLocked(true);
          setLockError(null);
        }
      }
    });

    return () => {
      subscription.remove();
      if (backgroundLockTimerRef.current) clearTimeout(backgroundLockTimerRef.current);
    };
  }, [isAuthenticated]);

  const completeSignIn = useCallback(async (response: VerifyOtpResponse) => {
    await saveSession(response);
    setUser(response.user);
    setAuthenticated(true);
    setLocked(false);
    setLockError(null);
  }, []);

  const unlock = useCallback(async () => {
    if (isAuthenticatingRef.current) return;

    isAuthenticatingRef.current = true;
    setUnlocking(true);
    setLockError(null);

    try {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);

      if (!hasHardware || !isEnrolled) {
        setLocked(false);
        setLockError(null);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        biometricsSecurityLevel: 'strong',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
        fallbackLabel: '',
        promptDescription: 'Confirm your identity to access company files.',
        promptMessage: 'Unlock Vensar Drive',
        promptSubtitle: 'Use your enrolled biometric',
      });

      if (result.success) {
        setLocked(false);
        setLockError(null);
      } else if (result.error !== 'user_cancel' && result.error !== 'system_cancel') {
        setLockError(
          result.error === 'lockout'
            ? 'Biometrics are temporarily locked. Try again later or sign out.'
            : 'Biometric authentication failed. Please try again.',
        );
      }
    } catch {
      setLockError('Biometric authentication is unavailable right now. Please try again.');
    } finally {
      isAuthenticatingRef.current = false;
      setUnlocking(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
    setAuthenticated(false);
    setLocked(false);
    setLockError(null);
  }, []);

  const value = useMemo(
    () => ({
      biometricLabel,
      completeSignIn,
      isAuthenticated,
      isHydrating,
      isLocked,
      isUnlocking,
      lockError,
      signOut,
      unlock,
      user,
    }),
    [
      biometricLabel,
      completeSignIn,
      isAuthenticated,
      isHydrating,
      isLocked,
      isUnlocking,
      lockError,
      signOut,
      unlock,
      user,
    ],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const value = useContext(AuthSessionContext);
  if (!value) throw new Error('useAuthSession must be used inside AuthSessionProvider');
  return value;
}
