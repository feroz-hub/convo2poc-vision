import { clarifications } from '@/data/requirements';
import { calculateLiveReadiness } from '@/simulation/readiness';
import type { DemoState } from './demoStore';
import type { Clarification, ClarificationStatus } from '@/types/domain';
export const clarificationStatusLabels: Record<ClarificationStatus, string> = {
  open: 'Open',
  'evidence-captured': 'Evidence Captured',
  'needs-review': 'Needs Review',
  resolved: 'Resolved',
  confirmed: 'Confirmed',
};
export function selectClarificationStatus(
  state: DemoState,
  item: Clarification,
): ClarificationStatus {
  if (state.resolvedClarificationIds.includes(item.id)) return 'confirmed';
  if (state.reviewedEvidenceIds.includes(item.id)) return 'needs-review';
  if (
    state.reopenedClarificationIds.includes(item.id) ||
    state.rejectedResolutionIds.includes(item.id)
  )
    return 'open';
  if (state.visibleTranscriptMessageIds.includes(item.resolutionMessageId))
    return 'evidence-captured';
  return item.status;
}
export function selectClarificationQueue(state: DemoState) {
  return clarifications.filter((item) => {
    const status = selectClarificationStatus(state, item);
    switch (state.clarificationFilter) {
      case 'open':
        return status === 'open';
      case 'needs-review':
        return status === 'evidence-captured' || status === 'needs-review';
      case 'resolved':
        return status === 'confirmed' || status === 'resolved';
      default:
        return true;
    }
  });
}
export function selectClarificationSummary(state: DemoState) {
  const statuses = clarifications.map((q) =>
    selectClarificationStatus(state, q),
  );
  return {
    open: statuses.filter((s) => s === 'open').length,
    resolved: statuses.filter((s) => s === 'confirmed' || s === 'resolved')
      .length,
    needsReview: statuses.filter(
      (s) => s === 'needs-review' || s === 'evidence-captured',
    ).length,
    affected: new Set(clarifications.flatMap((q) => q.affectedRequirementIds))
      .size,
    readiness: state.liveReadiness,
  };
}
export function selectResolutionReadiness(state: DemoState, id: string) {
  const before = calculateLiveReadiness({
    ...state,
    resolvedClarificationIds: state.resolvedClarificationIds.filter(
      (value) => value !== id,
    ),
  });
  const after = calculateLiveReadiness({
    ...state,
    resolvedClarificationIds: [
      ...new Set([...state.resolvedClarificationIds, id]),
    ],
  });
  return { before, after, delta: after - before };
}

// Consultant approvals overlay canonical records; live detections remain independently traceable.
export function selectGovernedRequirementIds(state: DemoState) {
  return [
    ...new Set([
      ...state.confirmedRequirementIds,
      ...clarifications
        .filter((q) => state.resolvedClarificationIds.includes(q.id))
        .flatMap((q) => q.affectedRequirementIds),
    ]),
  ];
}
