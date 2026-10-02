import { changeRequests } from './feedback';
import { artifacts } from './traceability';
import type {
  RequirementRevision,
  ReviewKey,
  VersionedTest,
} from '@/types/feedback';
export const feedbackMessages = [
  {
    id: 'review-001',
    speaker: 'Arjun Mehta',
    role: 'Consultant',
    timestamp: '00:02',
    text: 'Does the approval flow match what you expected?',
  },
  {
    id: changeRequests[0]!.sourceMessageId,
    speaker: 'Maya Rao',
    role: 'Client',
    timestamp: '00:05',
    text: 'The workflow looks good. We also want P2 requests to require manager approval.',
  },
] as const;
export const changeClassification = {
  category: 'Business Rule Change',
  changeType: 'Modify Existing Requirement',
  domain: 'Approval Workflow',
  priority: 'Medium',
  confidence: 97,
  regeneration: 'Targeted',
  architecture: 'No major architecture change',
  scopeEffect: 'Existing POC Scope',
  newCapability: false,
} as const;
export const requirementRevisions: RequirementRevision[] = [
  {
    id: 'REV-FR-007-v2',
    requirementId: 'FR-007',
    changeRequestId: 'CR-001',
    baselineFrom: 'RB-001',
    baselineTo: 'RB-002',
    revisedText: 'P1 and P2 requests require manager approval.',
  },
  {
    id: 'REV-BR-003-v2',
    requirementId: 'BR-003',
    changeRequestId: 'CR-001',
    baselineFrom: 'RB-001',
    baselineTo: 'RB-002',
    revisedText:
      'P1 and P2 requests require manager approval before work begins.',
  },
];
export const criterionRevision = {
  id: 'REV-SC-004-v2',
  criterionId: 'SC-004',
  changeRequestId: 'CR-001',
  revisedText:
    'P1 and P2 requests demonstrate manager approval before work begins.',
} as const;
// Policy consumers are the canonical runtime features, not every document mentioning FR-007.
export const policyConsumerFeatureIds = [
  'approval',
  'create',
  'status',
  'history',
] as const;
export const feedbackReviews: { key: ReviewKey; label: string }[] = [
  { key: 'evidence', label: 'Client evidence reviewed' },
  { key: 'requirements', label: 'Requirement revisions reviewed' },
  { key: 'scope', label: 'Scope impact reviewed' },
  { key: 'artifacts', label: 'Artifact impact reviewed' },
  { key: 'tests', label: 'Test impact reviewed' },
];
const p2Test = artifacts.find((a) => a.id === 'TC-016')!;
export const p2ApprovalTest: VersionedTest = {
  id: p2Test.id,
  label: 'P2 requires manager approval before work',
  requirementIds: p2Test.requirementIds,
  successCriterionId: 'SC-004',
  category: 'Workflow',
  artifactIds: ['approval-screen', 'approval-api', 'create-api', 'status-api'],
  baselineId: 'RB-002',
  changeRequestId: 'CR-001',
  supersedesTestId: 'TC-023',
};
export const feedbackMilestones = [
  { at: 0, label: 'Client POC Review Session begins' },
  { at: 5000, label: 'Client feedback captured' },
  { at: 8000, label: 'CR-001 detected' },
  { at: 12000, label: 'Business-rule change classified' },
  { at: 16000, label: 'Requirement revisions proposed' },
  {
    at: 20000,
    label: 'Artifact and test impact ready · human approval required',
  },
] as const;
export const deltaMilestones = [
  { at: 0, label: 'RB-002 delta contract loaded', agent: 'requirements' },
  {
    at: 4000,
    label: 'Approval policy consumers identified',
    agent: 'requirements',
  },
  { at: 8000, label: 'Workflow and API guards modified', agent: 'backend' },
  { at: 14000, label: 'Approval UI and request state modified', agent: 'ui' },
  {
    at: 20000,
    label: 'Versioned tests and regression checks executed',
    agent: 'test',
  },
  {
    at: 26000,
    label: 'Security and build validation passed',
    agent: 'security',
  },
  {
    at: 32000,
    label: 'Sandbox updated · POC v2 ready for human review',
    agent: 'deployment',
  },
] as const;
