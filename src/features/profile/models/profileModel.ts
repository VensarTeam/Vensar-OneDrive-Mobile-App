export type ProfileDetail = {
  icon: string;
  label: string;
  value: string;
  valueTone?: 'default' | 'positive';
};

export type ProfileSection = {
  details: ProfileDetail[];
  title: string;
};

export type UserProfile = {
  avatar: string | null;
  displayName: string;
  email: string;
  initials: string;
  role: string;
};
