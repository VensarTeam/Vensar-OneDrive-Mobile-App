import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import type {
  AuthUser,
  VerifyOtpResponse,
} from '../models/authApiModels';

import {
  clearSession,
  getSessionCreatedAt,
  getStoredSession,
  saveSession,
  SESSION_DURATION_MS,
} from '../repositories/session-repository';

type AuthSessionContextValue = {
  biometricLabel: string;
  completeSignIn: (
    response: VerifyOtpResponse,
  ) => Promise<void>;

  isAuthenticated: boolean;
  isHydrating: boolean;
  isLocked: boolean;
  isUnlocking: boolean;

  lockError: string | null;

  signOut: () => Promise<void>;

  unlock: () => Promise<boolean>;

  user: AuthUser | null;
};

const AuthSessionContext =
  createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({
  children,
}: PropsWithChildren) {
  const [isAuthenticated, setAuthenticated] =
    useState(false);

  const [isHydrating, setHydrating] =
    useState(true);

  const [isLocked, setLocked] =
    useState(false);

  const [isUnlocking, setUnlocking] =
    useState(false);

  const [lockError, setLockError] =
    useState<string | null>(null);

  const [biometricLabel, setBiometricLabel] =
    useState('biometrics');

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const isAuthenticatingRef =
    useRef(false);

  const appStateRef =
    useRef(AppState.currentState);

  useEffect(() => {
    void getStoredSession()
      .then((session) => {
        setAuthenticated(Boolean(session));

        setLocked(Boolean(session));

        setUser(session?.user ?? null);
      })
      .catch(() => {
        setAuthenticated(false);
        setLocked(false);
        setUser(null);
      })
      .finally(() => {
        setHydrating(false);
      });
  }, []);

  useEffect(() => {
    void LocalAuthentication
      .supportedAuthenticationTypesAsync()
      .then((types) => {
        if (process.env.EXPO_OS === 'ios') {
          setBiometricLabel(
            types.includes(
              LocalAuthentication
                .AuthenticationType
                .FACIAL_RECOGNITION,
            )
              ? 'Face ID'
              : 'Touch ID',
          );

          return;
        }

        setBiometricLabel('fingerprint');
      })
      .catch(() => undefined);
  }, []);

  /*
   * Sign out the current session.
   */
  const signOut = useCallback(
    async () => {
      await clearSession();

      setUser(null);
      setAuthenticated(false);
      setLocked(false);
      setLockError(null);
    },
    [],
  );

  /*
   * Check whether the stored session has expired.
   *
   * This is specifically used when the app returns
   * from the background.
   */
  const checkSessionExpiry =
    useCallback(async () => {
      if (
        !isAuthenticated ||
        isAuthenticatingRef.current
      ) {
        return;
      }

      const sessionCreatedAt =
        await getSessionCreatedAt();

      /*
       * No timestamp means the session cannot
       * be trusted.
       */
      if (sessionCreatedAt === null) {
        await signOut();
        return;
      }

      const sessionAge =
        Date.now() -
        sessionCreatedAt;

      if (
        sessionAge >=
        SESSION_DURATION_MS
      ) {
        await signOut();
      }
    }, [
      isAuthenticated,
      signOut,
    ]);

  /*
   * Handle app background / foreground transitions.
   */
  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        'change',
        (nextState) => {
          const wasActive =
            appStateRef.current ===
            'active';

          appStateRef.current =
            nextState;

          // Lock as soon as the app leaves the foreground.
          // The authentication prompt itself can make iOS inactive,
          // so that transition must not restart the lock flow.
          if (
            nextState !== 'active' &&
            isAuthenticated &&
            (nextState === 'background' ||
              (wasActive &&
                !isAuthenticatingRef.current))
          ) {
            setLocked(true);
            setLockError(null);

            return;
          }

          if (
            nextState === 'active' &&
            !wasActive &&
            isAuthenticated &&
            !isAuthenticatingRef.current
          ) {
            void checkSessionExpiry()
              .catch(() => {
                void signOut();
              });
          }
        },
      );

    return () => {
      subscription.remove();
    };
  }, [
    isAuthenticated,
    checkSessionExpiry,
    signOut,
  ]);

  const completeSignIn =
    useCallback(
      async (
        response: VerifyOtpResponse,
      ) => {
        await saveSession(response);

        setUser(response.user);
        setAuthenticated(true);
        setLocked(false);
        setLockError(null);
      },
      [],
    );

  const unlock =
    useCallback(
      async (): Promise<boolean> => {
        if (
          isAuthenticatingRef.current
        ) {
          return false;
        }

        isAuthenticatingRef.current =
          true;

        setUnlocking(true);
        setLockError(null);

        try {
          const result =
            await LocalAuthentication
              .authenticateAsync({
                biometricsSecurityLevel:
                  'weak',

                cancelLabel:
                  'Cancel',

                disableDeviceFallback:
                  false,

                promptDescription:
                  'Confirm your identity to access company files.',

                promptMessage:
                  'Unlock V Drive',

                promptSubtitle:
                  'Use your device security to continue',
              });

          if (result.success) {
            setLocked(false);
            setLockError(null);

            return true;
          }

          if (
            result.error !==
              'user_cancel' &&
            result.error !==
              'system_cancel'
          ) {
            setLockError(
              result.error ===
                'lockout'
                ? 'Device security is temporarily locked. Try again later or sign out.'
                : result.error === 'not_available' ||
                    result.error === 'not_enrolled' ||
                    result.error === 'passcode_not_set'
                  ? 'Set up device security to unlock, or sign out.'
                : 'Authentication failed. Please try again.',
            );
          }

          return false;
        } catch {
          setLockError(
            'Authentication is unavailable right now. Please try again.',
          );

          return false;
        } finally {
          isAuthenticatingRef.current =
            false;

          setUnlocking(false);
        }
      },
      [],
    );

  const value =
    useMemo(
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

  return (
    <AuthSessionContext.Provider
      value={value}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const value =
    useContext(AuthSessionContext);

  if (!value) {
    throw new Error(
      'useAuthSession must be used inside AuthSessionProvider',
    );
  }

  return value;
}
