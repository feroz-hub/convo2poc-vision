import type { Artifact, TraceNode, TraceEdge } from '@/types/domain';
export const artifacts: Artifact[] = [
  {
    id: 'assignment-screen',
    label: 'Admin Assignment',
    kind: 'screen',
    requirementIds: ['FR-003', 'BR-002'],
  },
  {
    id: 'assignment-api',
    label: 'PUT /requests/{id}/assign',
    kind: 'api',
    requirementIds: ['FR-003', 'BR-002'],
  },
  {
    id: 'assignment-rule',
    label: 'Administrator-only authorization',
    kind: 'rule',
    requirementIds: ['FR-003', 'BR-002'],
  },
  {
    id: 'TC-012',
    label: 'Administrator assignment allowed',
    kind: 'test',
    requirementIds: ['FR-003', 'BR-002'],
  },
  {
    id: 'TC-013',
    label: 'Engineer assignment denied',
    kind: 'test',
    requirementIds: ['FR-003', 'BR-002'],
  },
  {
    id: 'TC-014',
    label: 'Manager assignment denied',
    kind: 'test',
    requirementIds: ['FR-003', 'BR-002'],
  },
  {
    id: 'approval-rule',
    label: 'Priority-based manager approval rule',
    kind: 'rule',
    requirementIds: ['FR-007', 'BR-003'],
  },
  {
    id: 'approval-workflow',
    label: 'Manager approval before work begins',
    kind: 'document',
    requirementIds: ['FR-007', 'BR-003'],
  },
  {
    id: 'approval-screen',
    label: 'Request approval state and manager action',
    kind: 'screen',
    requirementIds: ['FR-007', 'BR-003'],
  },
  {
    id: 'approval-api',
    label: 'POST /requests/{id}/approve · priority approval logic',
    kind: 'api',
    requirementIds: ['FR-007', 'BR-003'],
  },
  {
    id: 'TC-015',
    label: 'P1 requires approval before work',
    kind: 'test',
    requirementIds: ['FR-007', 'BR-003'],
  },
  {
    id: 'TC-016',
    label: 'P2 approval changes from optional to required in v2',
    kind: 'test',
    requirementIds: ['FR-007', 'BR-003'],
  },
  {
    id: 'TC-017',
    label: 'P3 and P4 do not require manager approval',
    kind: 'test',
    requirementIds: ['FR-007', 'BR-003'],
  },
];
export const traceNodes: TraceNode[] = [
  {
    id: 'msg-004',
    type: 'conversation',
    label:
      'Admins should be able to assign requests to the right support engineer.',
  },
  {
    id: 'FR-003',
    type: 'requirement',
    label: 'Administrators assign requests',
  },
  {
    id: 'US-004',
    type: 'user-story',
    label: 'As an administrator, assign a support engineer',
  },
  {
    id: 'assignment-screen',
    type: 'screen',
    label: 'Admin Assignment',
  },
  {
    id: 'assignment-api',
    type: 'api',
    label: 'PUT /requests/{id}/assign',
  },
  {
    id: 'TC-012',
    type: 'test',
    label: 'Administrator assignment allowed',
  },
  {
    id: 'TC-013',
    type: 'test',
    label: 'Engineer assignment denied',
  },
  {
    id: 'TC-014',
    type: 'test',
    label: 'Manager assignment denied',
  },
];
export const traceEdges: TraceEdge[] = [
  {
    id: 'edge-1',
    source: 'msg-004',
    target: 'FR-003',
  },
  {
    id: 'edge-2',
    source: 'FR-003',
    target: 'US-004',
  },
  {
    id: 'edge-3',
    source: 'US-004',
    target: 'assignment-screen',
  },
  {
    id: 'edge-4',
    source: 'US-004',
    target: 'assignment-api',
  },
  {
    id: 'edge-5',
    source: 'assignment-screen',
    target: 'TC-012',
  },
  {
    id: 'edge-6',
    source: 'assignment-screen',
    target: 'TC-013',
  },
  {
    id: 'edge-7',
    source: 'assignment-screen',
    target: 'TC-014',
  },
  {
    id: 'edge-8',
    source: 'assignment-api',
    target: 'TC-012',
  },
  {
    id: 'edge-9',
    source: 'assignment-api',
    target: 'TC-013',
  },
  {
    id: 'edge-10',
    source: 'assignment-api',
    target: 'TC-014',
  },
];
