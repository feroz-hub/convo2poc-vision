import { requirements, clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { scopeItems } from '@/data/scope';
import { scenario } from '@/data/scenario';
import { liveInsights } from '@/data/liveSession';
import { selectGovernedRequirementIds } from './clarificationSelectors';
import type { DemoState } from './demoStore';
import type { Requirement, IntelligenceStatus } from '@/types/domain';
export const requirementTypeLabels = {
  functional: 'Functional',
  'business-rule': 'Business Rules',
  'non-functional': 'Non-Functional',
  assumption: 'Assumptions',
  'open-question': 'Open Questions',
} as const;
export const intelligenceStatusLabels: Record<IntelligenceStatus, string> = {
  detected: 'Detected',
  'needs-clarification': 'Needs Clarification',
  confirmed: 'Confirmed',
  'needs-review': 'Needs Review',
  acknowledged: 'Acknowledged',
};
export function getRequirementClarifications(r: Requirement) {
  return clarifications.filter(
    (q) =>
      q.requirementId === r.id ||
      q.affectedRequirementIds.includes(r.id) ||
      scopeItems.some(
        (s) =>
          s.requirementIds.includes(r.id) && s.clarificationIds.includes(q.id),
      ),
  );
}
// Scope relationships use explicit canonical references, clarification outputs or shared source evidence.
// They do not expand the canonical scope requirementIds or create new requirement claims.
export function getRequirementScopes(r: Requirement) {
  const questions = getRequirementClarifications(r);
  return scopeItems.filter(
    (s) =>
      s.requirementIds.includes(r.id) ||
      questions.some((q) => s.clarificationIds.includes(q.id)) ||
      (r.type === 'business-rule' &&
        requirements.some(
          (peer) =>
            peer.type === 'functional' &&
            peer.sourceMessageId === r.sourceMessageId &&
            !!r.sourceMessageId &&
            s.requirementIds.includes(peer.id),
        )),
  );
}
export function getRequirementRelationships(r: Requirement) {
  const questions = getRequirementClarifications(r);
  const scopes = getRequirementScopes(r);
  return requirements.filter(
    (other) =>
      other.id !== r.id &&
      (questions.some((q) => q.affectedRequirementIds.includes(other.id)) ||
        (!!r.sourceMessageId && other.sourceMessageId === r.sourceMessageId) ||
        scopes.some((s) => s.requirementIds.includes(other.id))),
  );
}
export function selectIntelligenceStatus(
  state: DemoState,
  r: Requirement,
): IntelligenceStatus {
  if (r.type === 'assumption')
    return state.scopeReviews.assumptions ||
      state.pocBaseline?.acknowledgedAssumptionIds.includes(r.id)
      ? 'acknowledged'
      : 'needs-review';
  if (r.type === 'open-question')
    return state.resolvedClarificationIds.includes(r.id)
      ? 'confirmed'
      : 'needs-clarification';
  if (selectGovernedRequirementIds(state).includes(r.id)) return 'confirmed';
  if (
    getRequirementClarifications(r).some(
      (q) => !state.resolvedClarificationIds.includes(q.id),
    )
  )
    return 'needs-clarification';
  return 'detected';
}
export function selectEvidenceState(state: DemoState, r: Requirement) {
  if (!r.sourceMessageId) return 'Scenario brief';
  return state.visibleTranscriptMessageIds.includes(r.sourceMessageId)
    ? 'Captured in Live Session'
    : 'Recorded evidence · capture pending';
}
export function selectRequirementList(state: DemoState) {
  const view = state.requirementView;
  const term = view.search.trim().toLowerCase();
  return requirements.filter(
    (r) =>
      (view.type === 'all' || r.type === view.type) &&
      (view.status === 'all' ||
        selectIntelligenceStatus(state, r) === view.status) &&
      (!view.actor || r.actors.includes(view.actor)) &&
      (!term ||
        `${r.id} ${r.title} ${r.description}`.toLowerCase().includes(term)),
  );
}
export function selectRequirementSummary(state: DemoState) {
  const count = (type: Requirement['type']) =>
    requirements.filter((r) => r.type === type).length;
  const statusCount = (status: IntelligenceStatus) =>
    requirements.filter((r) => selectIntelligenceStatus(state, r) === status)
      .length;
  const traceable = requirements.filter((r) =>
    r.sourceMessageId
      ? transcript.some((m) => m.id === r.sourceMessageId)
      : r.tags.includes('scenario brief'),
  ).length;
  return {
    total: requirements.length,
    confirmed: statusCount('confirmed'),
    needsClarification: statusCount('needs-clarification'),
    functional: count('functional'),
    rules: count('business-rule'),
    nonFunctional: count('non-functional'),
    assumptions: count('assumption'),
    questions: count('open-question'),
    actors: scenario.actors.length,
    captured: requirements.filter(
      (r) =>
        state.detectedRequirementIds.includes(r.id) ||
        state.detectedAssumptionIds.includes(r.id) ||
        liveInsights.some(
          (event) =>
            event.kind === 'open-question-detected' &&
            event.requirementId === r.id &&
            state.visibleInsightEventIds.includes(event.id),
        ),
    ).length,
    traceable,
    scoped: requirements.filter((r) => getRequirementScopes(r).length > 0)
      .length,
    clarified: clarifications.filter((q) =>
      state.resolvedClarificationIds.includes(q.id),
    ).length,
  };
}
