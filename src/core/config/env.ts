function required(value: string | undefined, name: string) {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function withTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`;
}

export const env = {
  apiBaseUrl: withTrailingSlash(
    required(process.env.EXPO_PUBLIC_API_BASE_URL, 'EXPO_PUBLIC_API_BASE_URL'),
  ),
  endpoints: {
    documents: required(
      process.env.EXPO_PUBLIC_DOCUMENTS_ENDPOINT,
      'EXPO_PUBLIC_DOCUMENTS_ENDPOINT',
    ),
    files: required(process.env.EXPO_PUBLIC_FILES_ENDPOINT, 'EXPO_PUBLIC_FILES_ENDPOINT'),
    folders: required(process.env.EXPO_PUBLIC_FOLDERS_ENDPOINT, 'EXPO_PUBLIC_FOLDERS_ENDPOINT'),
    projects: required(
      process.env.EXPO_PUBLIC_PROJECTS_ENDPOINT,
      'EXPO_PUBLIC_PROJECTS_ENDPOINT',
    ),
    requestOtp: required(
      process.env.EXPO_PUBLIC_REQUEST_OTP_ENDPOINT,
      'EXPO_PUBLIC_REQUEST_OTP_ENDPOINT',
    ),
    services: required(
      process.env.EXPO_PUBLIC_SERVICES_ENDPOINT,
      'EXPO_PUBLIC_SERVICES_ENDPOINT',
    ),
    sharing: required(process.env.EXPO_PUBLIC_SHARING_ENDPOINT, 'EXPO_PUBLIC_SHARING_ENDPOINT'),
    verifyOtp: required(
      process.env.EXPO_PUBLIC_VERIFY_OTP_ENDPOINT,
      'EXPO_PUBLIC_VERIFY_OTP_ENDPOINT',
    ),
  },
} as const;
