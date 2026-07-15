export type RequestOtpResponse = {
  message: string;
  email: string;
  mobile: string;
};

export type OtpDeliveryDetails = RequestOtpResponse & {
  identifier: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  mobile: string;
  createdBy: string;
  createdByName: string;
  updatedBy: string;
  address: string;
  designation: string;
  isActive: boolean;
  canCreateAdmin: boolean;
  canChangeRole: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VerifyOtpResponse = {
  access_token: string;
  user: AuthUser;
};
