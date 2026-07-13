import { useMemo } from 'react';

import type { HomeState } from '../models/homeModel';

export function useHomeViewModel(): HomeState {
  return useMemo(
    () => ({
      title: 'OneDrive Vensar',
      subtitle: 'A clean Expo base is ready for Microsoft sign-in, secure token storage, and file features.',
      actions: [
        {
          id: 'auth',
          title: 'Authentication',
          description: 'Add Microsoft OAuth flow in the auth feature without crowding the UI layer.',
        },
        {
          id: 'drive',
          title: 'Drive Files',
          description: 'Place OneDrive data models, repositories, and screens inside a dedicated drive feature.',
        },
        {
          id: 'ui',
          title: 'Shared UI',
          description: 'Reuse theme values and simple components so screens stay small and consistent.',
        },
      ],
    }),
    [],
  );
}
