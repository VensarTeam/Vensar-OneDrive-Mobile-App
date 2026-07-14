import type { AuthCredentials } from '../models/authCredentials';

const requestDelayMs = 450;

function delay() {
  return new Promise<void>((resolve) => setTimeout(resolve, requestDelayMs));
}

export async function requestOtp(_credentials: AuthCredentials) {
  await delay();
}

export async function resendOtp(_email: string) {
  await delay();
}

export async function verifyOtp(_email: string, _otp: string) {
  await delay();
}
