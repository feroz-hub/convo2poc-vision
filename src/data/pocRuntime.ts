import type {
  FeatureEvidence,
  PocPriority,
  PocRequestStatus,
  PocRole,
  PocUser,
  ServiceRequest,
  PocReviewKey,
} from '@/types/pocRuntime';
export const pocRoleLabels: Record<PocRole, string> = {
  employee: 'Employee',
  administrator: 'Administrator',
  'support-engineer': 'Support Engineer',
  manager: 'Manager',
};
export const pocStatusLabels: Record<PocRequestStatus, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  'awaiting-approval': 'Awaiting Approval',
};
export const pocPriorities: PocPriority[] = ['P1', 'P2', 'P3', 'P4'];
export const pocCategories = [
  'IT Support',
  'Access',
  'Facilities',
  'Equipment',
];
export const pocUsers: PocUser[] = [
  { id: 'user-employee', name: 'Tara Sen', role: 'employee' },
  { id: 'user-employee-2', name: 'Ishan Roy', role: 'employee' },
  { id: 'user-admin', name: 'Sana Iyer', role: 'administrator' },
  { id: 'user-engineer', name: 'Nikhil Shah', role: 'support-engineer' },
  { id: 'user-engineer-2', name: 'Leena Das', role: 'support-engineer' },
  { id: 'user-manager', name: 'Dev Kapur', role: 'manager' },
];
// Fictional, deterministic sandbox fixtures. They never become canonical requirements.
const requestSeeds: [string, PocPriority, PocRequestStatus, boolean][] = [
  ['Production access request', 'P1', 'awaiting-approval', true],
  ['Laptop VPN connection', 'P2', 'in-progress', true],
  ['New monitor setup', 'P3', 'open', false],
  ['Printer configuration', 'P4', 'closed', true],
  ['Finance workspace access', 'P1', 'awaiting-approval', false],
  ['Meeting room display', 'P3', 'resolved', true],
  ['Shared drive permissions', 'P2', 'open', false],
  ['Headset replacement', 'P4', 'closed', true],
  ['Critical account recovery', 'P1', 'in-progress', true],
  ['Office Wi-Fi setup', 'P2', 'closed', true],
  ['New starter keyboard', 'P3', 'open', false],
  ['Software installation', 'P4', 'resolved', true],
];
export function createSyntheticRequests(): ServiceRequest[] {
  return requestSeeds.map(([title, priority, status, assigned], i) => ({
    id: `SR-${1041 + i}`,
    title,
    description: `Synthetic service request: ${title.toLowerCase()}. Please help restore normal service.`,
    category: pocCategories[i % pocCategories.length]!,
    priority,
    requesterId: i < 6 ? 'user-employee' : 'user-employee-2',
    assignedEngineerId: assigned
      ? i % 2
        ? 'user-engineer'
        : 'user-engineer-2'
      : null,
    status,
    approvalStatus:
      priority === 'P1'
        ? status === 'awaiting-approval'
          ? 'pending'
          : 'approved'
        : 'not-required',
    history: [
      {
        id: `seed-${i}-created`,
        timestamp: '09:00',
        text: 'Request created',
        userId: i < 6 ? 'user-employee' : 'user-employee-2',
      },
      ...(assigned
        ? [
            {
              id: `seed-${i}-assigned`,
              timestamp: '09:05',
              text: `Assigned to ${i % 2 ? 'Nikhil Shah' : 'Leena Das'}`,
              userId: 'user-admin',
            },
          ]
        : []),
      ...(priority === 'P1'
        ? [
            {
              id: `seed-${i}-approval`,
              timestamp: '09:06',
              text:
                status === 'awaiting-approval'
                  ? 'Manager approval requested'
                  : 'Manager approved P1 request',
              userId:
                status === 'awaiting-approval'
                  ? 'user-employee'
                  : 'user-manager',
            },
          ]
        : []),
      ...(status !== 'open' && status !== 'awaiting-approval'
        ? [
            {
              id: `seed-${i}-status`,
              timestamp: '09:10',
              text: `Status changed to ${pocStatusLabels[status]}`,
              userId: i % 2 ? 'user-engineer' : 'user-engineer-2',
            },
          ]
        : []),
    ],
  }));
}
// Relationships reference existing canonical records; descriptions/evidence/tests are resolved at read time.
export const featureEvidence: FeatureEvidence[] = [
  {
    id: 'create',
    label: 'Create Request',
    requirementIds: ['FR-001'],
    scopeItemIds: ['scope-FR-001'],
    artifactIds: ['create-screen', 'create-api', 'schema'],
    clarificationIds: [],
  },
  {
    id: 'requests',
    label: 'View Requests',
    requirementIds: ['FR-002'],
    scopeItemIds: ['scope-FR-002'],
    artifactIds: ['list-screen', 'list-api'],
    clarificationIds: [],
  },
  {
    id: 'assignment',
    label: 'Admin Assignment',
    requirementIds: ['FR-003', 'BR-002'],
    scopeItemIds: ['scope-FR-003'],
    artifactIds: ['assignment-screen', 'assignment-api'],
    clarificationIds: ['OQ-002'],
  },
  {
    id: 'status',
    label: 'Status Update',
    requirementIds: ['FR-004', 'BR-003'],
    scopeItemIds: ['scope-FR-004'],
    artifactIds: ['status-screen', 'status-api'],
    clarificationIds: [],
  },
  {
    id: 'history',
    label: 'Request History',
    requirementIds: ['FR-005', 'BR-004'],
    scopeItemIds: ['scope-FR-005'],
    artifactIds: ['detail-screen', 'detail-api'],
    clarificationIds: [],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    requirementIds: ['FR-006'],
    scopeItemIds: ['scope-FR-006'],
    artifactIds: ['dashboard-screen', 'dashboard-api'],
    clarificationIds: [],
  },
  {
    id: 'approval',
    label: 'P1 Manager Approval',
    requirementIds: ['FR-007', 'BR-001', 'BR-003'],
    scopeItemIds: ['scope-FR-007'],
    artifactIds: ['approval-screen', 'approval-api'],
    clarificationIds: ['OQ-001'],
  },
  {
    id: 'closed-search',
    label: 'Closed Search',
    requirementIds: ['FR-008'],
    scopeItemIds: ['scope-FR-008'],
    artifactIds: ['search-screen', 'search-api'],
    clarificationIds: [],
  },
  {
    id: 'identity',
    label: 'Demo Identity',
    requirementIds: ['NFR-002', 'ASM-001', 'ASM-003'],
    scopeItemIds: ['scope-auth', 'scope-directory'],
    artifactIds: ['dependency-scope-auth', 'dependency-scope-directory'],
    clarificationIds: [],
  },
];
export const pocReviewItems: { key: PocReviewKey; label: string }[] = [
  { key: 'workflow', label: 'Core workflow demonstrated' },
  { key: 'scope', label: 'Approved scope implemented' },
  { key: 'criteria', label: 'Success criteria verified' },
  { key: 'limitations', label: 'Known limitations reviewed' },
  { key: 'content', label: 'Client-demo content reviewed' },
];
