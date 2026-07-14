import { useMemo } from 'react';

import type { HomeState } from '../models/homeModel';

export function useHomeViewModel(): HomeState {
  return useMemo(
    () => ({
      files: [
        { id: '1', name: 'Project proposal.docx', meta: 'Edited just now', icon: 'file-word-outline', tint: '#185ABD' },
        { id: '2', name: 'Q3 Planning.xlsx', meta: 'Edited yesterday', icon: 'file-excel-outline', tint: '#107C41' },
        { id: '3', name: 'Product presentation.pptx', meta: 'Shared with you', icon: 'file-powerpoint-outline', tint: '#C43E1C' },
        { id: '4', name: 'Design resources', meta: '12 items · Monday', icon: 'folder-outline', tint: '#F2C811' },
      ],
    }),
    [],
  );
}
