export type AuthToken = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};
