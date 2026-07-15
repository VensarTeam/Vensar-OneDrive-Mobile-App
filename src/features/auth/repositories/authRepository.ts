import { apiRequest } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import type { AuthCredentials } from '../models/authCredentials';
import type { OtpDeliveryDetails, RequestOtpResponse, VerifyOtpResponse } from '../models/authApiModels';

type RequestOtpApiResponse = RequestOtpResponse | { data: RequestOtpResponse; message?: string };
type VerifyOtpApiResponse = VerifyOtpResponse | { data: VerifyOtpResponse };

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function requestOtp(credentials: AuthCredentials): Promise<OtpDeliveryDetails> {
  const response = await apiRequest<RequestOtpApiResponse>(env.endpoints.requestOtp, {
    method: 'POST',
    body: credentials,
  });
  const payload = 'data' in response ? response.data : response;
  const email = stringValue(payload?.email);
  const mobile = stringValue(payload?.mobile);
  const submittedLoginId = credentials.loginId.trim();
  const identifier = email || mobile || submittedLoginId;

  if (!identifier) {
    throw new Error('The server did not return a valid OTP identifier. Please sign in again.');
  }

  return {
    email: email || (submittedLoginId.includes('@') ? submittedLoginId : ''),
    identifier,
    message: stringValue(payload?.message) || stringValue('message' in response ? response.message : '') || 'OTP sent',
    mobile: mobile || (!submittedLoginId.includes('@') ? submittedLoginId : ''),
  };
}

export async function verifyOtp(identifier: string, otp: string) {
  const normalizedIdentifier = identifier.trim();
  if (!normalizedIdentifier) {
    throw new Error('A valid email or mobile number is required to verify the OTP.');
  }

  const response = await apiRequest<VerifyOtpApiResponse>(env.endpoints.verifyOtp, {
    method: 'POST',
    body: { identifier: normalizedIdentifier, otp },
  });
  const payload = 'data' in response ? response.data : response;
  const accessToken = stringValue(payload?.access_token);

  if (!accessToken || !payload?.user || typeof payload.user !== 'object') {
    throw new Error('The verification response did not contain a valid session. Please sign in again.');
  }

  return { access_token: accessToken, user: payload.user };
}
