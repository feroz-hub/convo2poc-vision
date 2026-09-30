import type { ChangeRequest } from '@/types/domain';
// A future approved change expands the P1-only baseline; v1 requirements remain intact.
export const changeRequests: ChangeRequest[] = [
  {
    id: 'CR-001',
    sourceMessageId: 'feedback-001',
    previousValue: 'Only P1 requests require manager approval.',
    newValue: 'Both P1 and P2 requests require manager approval.',
    requirementIds: ['FR-007', 'BR-003'],
    impactedArtifacts: [
      'approval-rule',
      'approval-workflow',
      'approval-screen',
      'approval-api',
      'TC-015',
      'TC-016',
      'TC-017',
    ],
    status: 'detected',
  },
];
