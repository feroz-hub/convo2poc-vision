export type PocRole =
  'employee' | 'administrator' | 'support-engineer' | 'manager';
export type PocPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type PocRequestStatus =
  'open' | 'in-progress' | 'resolved' | 'closed' | 'awaiting-approval';
export interface PocUser {
  id: string;
  name: string;
  role: PocRole;
}
export interface RequestHistoryEvent {
  id: string;
  timestamp: string;
  text: string;
  userId: string;
}
export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: PocPriority;
  requesterId: string;
  assignedEngineerId: string | null;
  status: PocRequestStatus;
  approvalStatus: 'not-required' | 'pending' | 'approved' | 'rejected';
  history: RequestHistoryEvent[];
}
export interface FeatureEvidence {
  id: string;
  label: string;
  requirementIds: string[];
  scopeItemIds: string[];
  artifactIds: string[];
  clarificationIds: string[];
}
export type PocRoute = 'dashboard' | 'requests' | 'create' | 'detail';
export type PocReviewKey =
  'workflow' | 'scope' | 'criteria' | 'limitations' | 'content';
export interface PocRuntime {
  route: PocRoute;
  userId: string;
  requests: ServiceRequest[];
  selectedRequestId: string | null;
  selectedFeatureId: string;
  statusFilter: PocRequestStatus | 'all';
  priorityFilter: PocPriority | 'all';
  search: string;
  sequence: number;
  notice: string;
  reviews: Record<PocReviewKey, boolean>;
  approval: {
    baselineId: string;
    approvedBy: 'Consultant';
    approvedAt: string;
  } | null;
  presentation: boolean;
  evidenceOpen: boolean;
}
export type PocAction =
  | { type: 'navigate'; route: PocRoute }
  | { type: 'role'; role: PocRole }
  | { type: 'select-request'; id: string }
  | { type: 'feature'; id: string }
  | {
      type: 'filters';
      status?: PocRuntime['statusFilter'];
      priority?: PocRuntime['priorityFilter'];
      search?: string;
    }
  | {
      type: 'create';
      title: string;
      description: string;
      category: string;
      priority: PocPriority;
    }
  | { type: 'assign'; engineerId: string }
  | { type: 'progress' }
  | { type: 'approval'; decision: 'approved' | 'rejected' }
  | { type: 'note'; text: string }
  | { type: 'review'; key: PocReviewKey; checked: boolean }
  | { type: 'approve-review' }
  | { type: 'presentation'; enabled: boolean }
  | { type: 'evidence'; open: boolean };
