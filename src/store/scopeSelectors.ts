import {
  scopeItems,
  successCriteria,
  workflowDependencyIds,
} from '@/data/scope';
import { requirements, clarifications } from '@/data/requirements';
import type { DemoState } from './demoStore';
import type { ScopeItem, ScopeDecision } from '@/types/domain';
export function selectScopeDecision(
  state: DemoState,
  item: ScopeItem,
): ScopeDecision {
  return (
    state.pocBaseline?.decisions[item.id]?.decision ??
    state.scopeOverrides[item.id]?.decision ??
    item.decision
  );
}
export function selectScopeSummary(state: DemoState) {
  const count = (decision: ScopeDecision) =>
    scopeItems.filter((item) => selectScopeDecision(state, item) === decision)
      .length;
  const units = scopeItems.reduce((sum, item) => {
    const decision = selectScopeDecision(state, item);
    return (
      sum +
      (decision === 'excluded'
        ? 0
        : decision === 'mocked'
          ? 1
          : { low: 1, medium: 2, high: 3 }[item.complexity] +
            { none: 0, low: 0, medium: 1, high: 2 }[item.externalDependency])
    );
  }, 0);
  return {
    total: scopeItems.length,
    included: count('included'),
    mocked: count('mocked'),
    excluded: count('excluded'),
    overrides: Object.keys(state.scopeOverrides).length,
    complexityUnits: units,
    complexity: units <= 12 ? 'Focused' : units <= 18 ? 'Expanded' : 'Broad',
  };
}
export function selectSuccessCoverage(state: DemoState) {
  return successCriteria.filter((criterion) =>
    criterion.scopeItemIds.every((id) => {
      const item = scopeItems.find((s) => s.id === id)!;
      return selectScopeDecision(state, item) === 'included';
    }),
  );
}
export function selectScopePrerequisites(state: DemoState) {
  const requirementsCaptured = requirements
    .filter(
      (r) =>
        r.type === 'functional' ||
        r.type === 'business-rule' ||
        r.type === 'non-functional',
    )
    .every((r) => state.detectedRequirementIds.includes(r.id));
  const clarificationsResolved = clarifications.every((q) =>
    state.resolvedClarificationIds.includes(q.id),
  );
  const criteriaCovered =
    selectSuccessCoverage(state).length === successCriteria.length;
  const dependenciesCovered = workflowDependencyIds.every(
    (id) =>
      selectScopeDecision(
        state,
        scopeItems.find((item) => item.id === id)!,
      ) !== 'excluded',
  );
  return {
    requirementsCaptured,
    requirementsReviewed: state.scopeReviews.requirements,
    clarificationsResolved,
    assumptionsAcknowledged: state.scopeReviews.assumptions,
    scopeReviewed: state.scopeReviews.scope,
    successCriteriaReviewed: state.scopeReviews.successCriteria,
    criteriaCovered,
    dependenciesCovered,
  };
}
export function canApproveScope(state: DemoState) {
  return (
    !state.scopeApproved &&
    Object.values(selectScopePrerequisites(state)).every(Boolean)
  );
}
export function selectScopeReadiness(state: DemoState) {
  const gates = selectScopePrerequisites(state);
  const reviewed = [
    gates.requirementsReviewed && gates.requirementsCaptured,
    gates.clarificationsResolved,
    gates.assumptionsAcknowledged,
    gates.scopeReviewed && gates.dependenciesCovered,
    gates.successCriteriaReviewed && gates.criteriaCovered,
  ].filter(Boolean).length;
  return Math.round(((reviewed + (state.scopeApproved ? 1 : 0)) / 6) * 100);
}
export function selectGenerationReadiness(
  state: DemoState,
): 'Ready' | 'Review required' | 'Awaiting approval' {
  if (!state.scopeApproved || !state.pocBaseline) return 'Awaiting approval';
  if (
    !Object.values(selectScopePrerequisites(state)).every(Boolean) ||
    state.pocBaseline.clarificationReviewSequence !==
      state.clarificationHistory.length
  )
    return 'Review required';
  return 'Ready';
}
export function getScopeScore(item: ScopeItem) {
  const linked = requirements.filter((r) => item.requirementIds.includes(r.id));
  const confidence = linked.length
    ? Math.round(
        linked.reduce((sum, r) => sum + r.confidence, 0) / linked.length,
      )
    : null;
  const relevance = { core: 1, supporting: 0.6, future: 0.25 }[item.relevance];
  const demoValue = { core: 1, supporting: 0.7, future: 0.3 }[item.relevance];
  const feasibility = { low: 1, medium: 0.65, high: 0.35 }[item.complexity];
  const integration = { none: 1, low: 0.8, medium: 0.5, high: 0.1 }[
    item.externalDependency
  ];
  return {
    confidence,
    score: Math.round(
      relevance * 30 +
        demoValue * 25 +
        (confidence === null ? 0 : (confidence / 100) * 20) +
        feasibility * 15 +
        integration * 10,
    ),
  };
}
