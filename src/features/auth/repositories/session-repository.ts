import {
  getSecureItem,
  removeSecureItem,
  setSecureItem,
} from '../../../core/storage/secureStore';

import {
  storageKeys,
} from '../../../core/storage/storageKeys';

import type {
  AuthUser,
  VerifyOtpResponse,
} from '../models/authApiModels';


/* ========================================================= */
/* SESSION CONFIGURATION */
/* ========================================================= */

export const SESSION_DURATION_MS =
 24 * 60 * 60 * 1000;


/* ========================================================= */
/* TYPES */
/* ========================================================= */

export type StoredSession = {
  accessToken: string;
  user: AuthUser | null;
  sessionCreatedAt: number;
};


/* ========================================================= */
/* GET STORED SESSION */
/* ========================================================= */

export async function getStoredSession(): Promise<StoredSession | null> {
  const [
    accessToken,
    serializedUser,
    sessionCreatedAt,
  ] = await Promise.all([
    getSecureItem(storageKeys.authToken),
    getSecureItem(storageKeys.authUser),
    getSecureItem(storageKeys.authSessionCreatedAt),
  ]);


  /*
   * No access token means there is no session.
   */
  if (!accessToken) {
    return null;
  }


  /*
   * Older installations may have a session but no
   * session timestamp.
   *
   * Treat that session as expired so the user signs
   * in once again after this update.
   */
  if (!sessionCreatedAt) {
    await clearSession();

    return null;
  }


  const parsedSessionCreatedAt =
    Number(sessionCreatedAt);


  /*
   * Invalid timestamp = invalid session.
   */
  if (
    !Number.isFinite(
      parsedSessionCreatedAt,
    ) ||
    parsedSessionCreatedAt <= 0
  ) {
    await clearSession();

    return null;
  }


  /*
   * Check whether the 24-hour session has expired.
   */
  const sessionAge =
    Date.now() -
    parsedSessionCreatedAt;


  if (
    sessionAge >=
    SESSION_DURATION_MS
  ) {
    await clearSession();

    return null;
  }


  /*
   * User profile is optional.
   */
  if (!serializedUser) {
    return {
      accessToken,
      user: null,
      sessionCreatedAt:
        parsedSessionCreatedAt,
    };
  }


  try {
    return {
      accessToken,
      user:
        JSON.parse(
          serializedUser,
        ) as AuthUser,

      sessionCreatedAt:
        parsedSessionCreatedAt,
    };
  } catch {
    await removeSecureItem(
      storageKeys.authUser,
    );

    return {
      accessToken,
      user: null,
      sessionCreatedAt:
        parsedSessionCreatedAt,
    };
  }
}


/* ========================================================= */
/* GET SESSION CREATION TIME */
/* ========================================================= */

export async function getSessionCreatedAt(): Promise<number | null> {
  const value =
    await getSecureItem(
      storageKeys.authSessionCreatedAt,
    );


  if (!value) {
    return null;
  }


  const timestamp =
    Number(value);


  if (
    !Number.isFinite(timestamp) ||
    timestamp <= 0
  ) {
    return null;
  }


  return timestamp;
}


/* ========================================================= */
/* SAVE SESSION */
/* ========================================================= */

export async function saveSession(
  response: VerifyOtpResponse,
) {
  const accessToken =
    response.access_token?.trim();


  if (
    !accessToken ||
    !response.user ||
    typeof response.user !== 'object'
  ) {
    throw new Error(
      'Cannot securely save an invalid login session. Please sign in again.',
    );
  }


  const serializedUser =
    JSON.stringify(
      response.user,
    );


  if (!serializedUser) {
    throw new Error(
      'Cannot securely save the user profile. Please sign in again.',
    );
  }


  /*
   * Start a completely new 24-hour session.
   *
   * This timestamp is created only after OTP
   * verification has succeeded.
   */
  const sessionCreatedAt =
    Date.now().toString();


  /*
   * Store the profile first.
   */
  await setSecureItem(
    storageKeys.authUser,
    serializedUser,
  );


  /*
   * Store the access token.
   */
  await setSecureItem(
    storageKeys.authToken,
    accessToken,
  );


  /*
   * Store the session creation timestamp.
   */
  await setSecureItem(
    storageKeys.authSessionCreatedAt,
    sessionCreatedAt,
  );
}


/* ========================================================= */
/* CLEAR SESSION */
/* ========================================================= */

export async function clearSession() {
  await Promise.all([
    removeSecureItem(
      storageKeys.authToken,
    ),

    removeSecureItem(
      storageKeys.authUser,
    ),

    removeSecureItem(
      storageKeys.authSessionCreatedAt,
    ),
  ]);
}