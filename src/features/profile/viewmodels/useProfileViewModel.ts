import { useCallback, useMemo, useState } from 'react';

import { clearAuthToken } from '../../auth/repositories/tokenRepository';
import type { ProfileSection, UserProfile } from '../models/profileModel';

const profile: UserProfile = {
  displayName: 'Ritesh Mehra',
  email: 'ritesh@vensar.com',
  initials: 'RM',
  organization: 'Vensar',
  role: 'Work account',
};

export function useProfileViewModel(onSignedOut: () => void) {
  const [isSigningOut, setSigningOut] = useState(false);

  const sections = useMemo<ProfileSection[]>(
    () => [
      {
        title: 'Account',
        details: [
          { icon: 'email-outline', label: 'Email', value: profile.email },
          { icon: 'domain', label: 'Organization', value: profile.organization },
          { icon: 'eye-outline', label: 'Access', value: 'Read only' },
        ],
      },
      {
        title: 'Security',
        details: [
          {
            icon: 'shield-check-outline',
            label: 'Two-step verification',
            value: 'Enabled',
            valueTone: 'positive',
          },
          { icon: 'lock-outline', label: 'Session', value: 'Protected' },
        ],
      },
      {
        title: 'App',
        details: [
          { icon: 'theme-light-dark', label: 'Appearance', value: 'System default' },
          { icon: 'information-outline', label: 'Version', value: '1.0.0' },
        ],
      },
    ],
    [],
  );

  const signOut = useCallback(async () => {
    if (isSigningOut) return;

    setSigningOut(true);
    try {
      await clearAuthToken();
      onSignedOut();
    } finally {
      setSigningOut(false);
    }
  }, [isSigningOut, onSignedOut]);

  return { isSigningOut, profile, sections, signOut };
}
