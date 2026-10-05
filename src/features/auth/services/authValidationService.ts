import type { AuthCredentials, AuthFieldErrors } from '../models/authCredentials';

export function validateCredentials(credentials: AuthCredentials): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!/^\d{10}$/.test(credentials.loginId.trim())) {
  errors.loginId = 'Enter mobile number';
}

  if (credentials.password.length < 8) {
    errors.password = 'Password must contain at least 8 characters.';
  }

  return errors;
}

export function isValidOtp(value: string) {
  return /^\d{6}$/.test(value);
}
