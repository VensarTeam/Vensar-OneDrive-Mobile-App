import type { AuthCredentials, AuthFieldErrors } from '../models/authCredentials';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(credentials: AuthCredentials): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!emailPattern.test(credentials.email.trim())) {
    errors.email = 'Enter a valid work email address.';
  }

  if (credentials.password.length < 8) {
    errors.password = 'Password must contain at least 8 characters.';
  }

  return errors;
}

export function isValidOtp(value: string) {
  return /^\d{6}$/.test(value);
}
