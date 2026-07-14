export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthFieldErrors = Partial<Record<keyof AuthCredentials, string>>;
