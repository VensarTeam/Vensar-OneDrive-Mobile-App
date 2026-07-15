import type { AuthCredentials, AuthFieldErrors } from '../models/authCredentials';

export function validateCredentials(credentials: AuthCredentials): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (credentials.loginId.trim().length < 3) {
    errors.loginId = 'Enter your mobile number or work email.';
  }

  if (credentials.password.length < 8) {
    errors.password = 'Password must contain at least 8 characters.';
  }

  return errors;
}

export function isValidOtp(value: string) {
  return /^\d{6}$/.test(value);
}
