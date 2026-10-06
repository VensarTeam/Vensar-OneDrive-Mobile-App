export type RootStackParamList = {
  Welcome: undefined;

  PrivacyPolicy: {
    privacyAccepted?: boolean;
    termsAccepted?: boolean;
  };

  PrivacyPolicyDetail: {
    fromProfile?: boolean;
  };

  TermsConditionsDetail: {
  fromProfile?: boolean;
};

  ContactSupport: undefined;

  Login: undefined;

  Otp: {
    email: string;
    identifier: string;
    mobile: string;
  };

  Home: undefined;

  Notifications: undefined;

  AccessRequests: undefined;
};