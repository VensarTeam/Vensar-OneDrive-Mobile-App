export type AuthCredentials = {
  loginId: string;
  password: string;
};

export type AuthFieldErrors = Partial<Record<keyof AuthCredentials, string>>;
