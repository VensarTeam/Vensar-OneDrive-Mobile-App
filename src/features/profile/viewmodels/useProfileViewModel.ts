import { useCallback, useMemo, useState } from 'react';

import { useAppTheme } from '../../../core/theme';
import { useAuthSession } from '../../auth/services/auth-session-provider';
import type { ProfileSection, UserProfile } from '../models/profileModel';

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase())
    .join('') || 'U';
}

function formatRole(role: string) {
  return role.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());
}

export function useProfileViewModel(onSignedOut: () => void) {
  const [isSigningOut, setSigningOut] = useState(false);
  const { colorScheme, setColorScheme } = useAppTheme();
  const { signOut: clearAuthSession, user } = useAuthSession();
  const displayName = user?.name || 'User';

  const profile: UserProfile = {
    avatar: user?.avatar ?? null,
    displayName,
    email: user?.email ?? '',
    initials: getInitials(displayName),
    role: user ? formatRole(user.role) : 'Work account',
  };

  const sections = useMemo<ProfileSection[]>(
    () => [
      {
        title: 'Account',
        details: [
          { icon: 'email-outline', label: 'Email', value: user?.email || 'Not available' },
          { icon: 'phone-outline', label: 'Mobile', value: user?.mobile || 'Not available' },
          { icon: 'badge-account-outline', label: 'Designation', value: user?.designation || 'Not available' },
          { icon: 'map-marker-outline', label: 'Address', value: user?.address || 'Not available' },
        ],
      },
      {
        title: 'Access',
        details: [
          { icon: 'shield-account-outline', label: 'Role', value: user ? formatRole(user.role) : 'Not available' },
          { icon: 'check-decagram-outline', label: 'Account status', value: user?.isActive ? 'Active' : 'Inactive', valueTone: user?.isActive ? 'positive' : 'default' },
        ],
      },
      {
        title: 'Security',
        details: [
          { icon: 'lock-outline', label: 'Session', value: 'Protected' },
        ],
      },
    ],
    [user],
  );

  const signOut = useCallback(async () => {
    if (isSigningOut) return;
    setSigningOut(true);
    try {
      await clearAuthSession();
      onSignedOut();
    } finally {
      setSigningOut(false);
    }
  }, [clearAuthSession, isSigningOut, onSignedOut]);

  return {
    isDarkMode: colorScheme === 'dark',
    isSigningOut,
    profile,
    sections,
    setDarkMode: (enabled: boolean) => setColorScheme(enabled ? 'dark' : 'light'),
    signOut,
  };
}
