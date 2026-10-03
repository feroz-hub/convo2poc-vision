import type { DemoState } from '@/store/demoStore';
import { clarifications } from '@/data/requirements';
import {
  selectPreviewReady,
  selectPreviewTraceability,
} from '@/store/previewSelectors';
import { selectV2Ready } from '@/store/feedbackSelectors';
import type { DemoCondition } from './demoTypes';
export const demoConditionNames: readonly DemoCondition[] = [
  'ready',
  'requirements',
  'ambiguity',
  'answer',
  'session-complete',
  'oq001-confirmed',
  'clarifications-confirmed',
  'rb001',
  'parallel',
  'generation-complete',
  'p1-created',
  'p1-assigned',
  'p1-blocked',
  'p1-approved',
  'p1-progressed',
  'v1-approved',
  'trace-complete',
  'cr001',
  'feedback-analyzed',
  'rb002',
  'v2-ready',
  'v1-p2',
  'v2-p2',
];
export function demoConditionMet(
  s: DemoState,
  condition: DemoCondition,
): boolean {
  const p1 = s.pocRuntime.requests.find(
    (r) => r.id === s.director.requestIds.p1,
  );
  switch (condition) {
    case 'ready':
      return true;
    case 'requirements':
      return ['FR-001', 'FR-002'].every((id) =>
        s.detectedRequirementIds.includes(id),
      );
    case 'ambiguity':
      return s.visibleInsightEventIds.includes('insight-clarify-OQ-001');
    case 'answer':
      return (
        s.visibleTranscriptMessageIds.includes('msg-008') &&
        s.confirmedRequirementIds.includes('FR-007')
      );
    case 'session-complete':
      return s.sessionComplete;
    case 'oq001-confirmed':
      return s.resolvedClarificationIds.includes('OQ-001');
    case 'clarifications-confirmed':
      return clarifications.every((q) =>
        s.resolvedClarificationIds.includes(q.id),
      );
    case 'rb001':
      return s.pocBaseline?.id === 'RB-001' && s.scopeApproved;
    case 'parallel':
      return ['ui', 'backend', 'data'].every((id) =>
        s.agentStatuses.some(
          (a) => a.id === id && ['running', 'paused'].includes(a.status),
        ),
      );
    case 'generation-complete':
      return selectPreviewReady(s);
    case 'p1-created':
      return !!p1 && p1.priority === 'P1' && p1.approvalStatus === 'pending';
    case 'p1-assigned':
      return !!p1?.assignedEngineerId;
    case 'p1-blocked':
      return (
        p1?.status === 'awaiting-approval' && p1.approvalStatus === 'pending'
      );
    case 'p1-approved':
      return p1?.approvalStatus === 'approved';
    case 'p1-progressed':
      return p1?.status === 'in-progress';
    case 'v1-approved':
      return !!s.pocRuntime.approval;
    case 'trace-complete':
      return selectPreviewTraceability(s).coverage === 100;
    case 'cr001':
      return s.feedback.capture.elapsedMs >= 8000;
    case 'feedback-analyzed':
      return s.feedback.status === 'analyzed';
    case 'rb002':
      return s.feedback.baseline?.id === 'RB-002';
    case 'v2-ready':
      return selectV2Ready(s);
    case 'v1-p2':
      return (
        s.pocRuntime.requests.find((r) => r.id === s.director.requestIds.p2v1)
          ?.approvalStatus === 'not-required'
      );
    case 'v2-p2':
      return (
        s.feedback.v2Runtime?.requests.find(
          (r) => r.id === s.director.requestIds.p2v2,
        )?.approvalStatus === 'pending'
      );
  }
}
