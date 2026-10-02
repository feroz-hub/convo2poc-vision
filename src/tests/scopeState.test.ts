import { beforeEach, describe, expect, it } from 'vitest';
import { useDemoStore, createInitialDemoState } from '@/store/demoStore';
import { scopeItems, successCriteria } from '@/data/scope';
import { requirements, clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import {
  canApproveScope,
  selectScopeSummary,
  selectGenerationReadiness,
  selectScopeReadiness,
  selectSuccessCoverage,
  getScopeScore,
} from '@/store/scopeSelectors';
const reviewKeys = [
  'requirements',
  'assumptions',
  'scope',
  'successCriteria',
] as const;
function readyScenario() {
  const actions = useDemoStore.getState();
  actions.start();
  actions.tick(80000);
  for (const q of clarifications) {
    actions.reviewClarificationEvidence(q.id);
    actions.acceptClarificationResolution(q.id);
  }
  for (const key of reviewKeys) actions.setScopeReview(key, true);
  return actions;
}
beforeEach(() => useDemoStore.getState().reset());
describe('scope planning and baseline governance', () => {
  it('loads the canonical 15-capability recommended partition with derived complexity', () => {
    expect(selectScopeSummary(useDemoStore.getState())).toEqual({
      total: 15,
      included: 8,
      mocked: 2,
      excluded: 5,
      overrides: 0,
      complexityUnits: 12,
      complexity: 'Focused',
    });
    expect(selectSuccessCoverage(useDemoStore.getState())).toHaveLength(6);
    expect(selectGenerationReadiness(useDemoStore.getState())).toBe(
      'Awaiting approval',
    );
    expect(selectScopeReadiness(useDemoStore.getState())).toBe(0);
  });
  it('reclassifies an item, stores rationale and invalidates scope contract reviews without mutating catalogs', () => {
    const initial = JSON.stringify(scopeItems);
    const actions = readyScenario();
    const readiness = useDemoStore.getState().liveReadiness;
    actions.setScopeDecision(
      'scope-email',
      'included',
      'Consultant wants notification behavior demonstrated.',
    );
    expect(selectScopeSummary(useDemoStore.getState())).toMatchObject({
      included: 9,
      mocked: 2,
      excluded: 4,
      overrides: 1,
      complexityUnits: 15,
      complexity: 'Expanded',
    });
    expect(useDemoStore.getState().scopeOverrides['scope-email']).toEqual({
      decision: 'included',
      reason: 'Consultant wants notification behavior demonstrated.',
    });
    expect(useDemoStore.getState().scopeReviews).toMatchObject({
      scope: false,
      successCriteria: false,
    });
    expect(useDemoStore.getState().liveReadiness).toBe(readiness);
    expect(JSON.stringify(scopeItems)).toBe(initial);
    actions.resetScopeRecommendation('scope-email');
    expect(selectScopeSummary(useDemoStore.getState())).toMatchObject({
      included: 8,
      excluded: 5,
      overrides: 0,
      complexityUnits: 12,
    });
  });
  it('requires full capture, clarification resolutions, acknowledgements and explicit reviews before approval', () => {
    const actions = useDemoStore.getState();
    for (const key of reviewKeys) actions.setScopeReview(key, true);
    actions.approveScope();
    expect(useDemoStore.getState().pocBaseline).toBeNull();
    for (const q of clarifications) {
      actions.reviewClarificationEvidence(q.id);
      actions.acceptClarificationResolution(q.id);
    }
    expect(canApproveScope(useDemoStore.getState())).toBe(false);
    actions.start();
    actions.tick(80000);
    expect(canApproveScope(useDemoStore.getState())).toBe(true);
    expect(selectScopeReadiness(useDemoStore.getState())).toBe(83);
  });
  it('blocks missing success criteria and excluded essential demo dependencies', () => {
    const actions = readyScenario();
    actions.setScopeDecision('scope-FR-007', 'excluded');
    for (const key of reviewKeys) actions.setScopeReview(key, true);
    expect(selectSuccessCoverage(useDemoStore.getState())).toHaveLength(5);
    expect(canApproveScope(useDemoStore.getState())).toBe(false);
    actions.resetScopeRecommendation('scope-FR-007');
    actions.setScopeDecision('scope-auth', 'excluded');
    for (const key of reviewKeys) actions.setScopeReview(key, true);
    actions.approveScope();
    expect(useDemoStore.getState().pocBaseline).toBeNull();
  });
  it('creates an immutable deterministic RB-001 snapshot without starting generation or changing readiness', () => {
    const actions = readyScenario();
    const readiness = useDemoStore.getState().liveReadiness;
    actions.approveScope();
    const state = useDemoStore.getState();
    const baseline = state.pocBaseline!;
    expect(baseline).toMatchObject({
      id: 'RB-001',
      version: 'v1',
      approvedBy: 'Consultant',
      approvedAt: 'Demo 01:20',
    });
    expect(baseline.requirementIds).toEqual(requirements.map((r) => r.id));
    expect(baseline.includedScopeItemIds).toHaveLength(8);
    expect(baseline.mockedScopeItemIds).toHaveLength(2);
    expect(baseline.excludedScopeItemIds).toHaveLength(5);
    expect(baseline.successCriteriaIds).toEqual(
      successCriteria.map((c) => c.id),
    );
    expect(baseline.resolvedClarificationIds).toHaveLength(3);
    expect(baseline.acknowledgedAssumptionIds).toHaveLength(3);
    expect(Object.isFrozen(baseline)).toBe(true);
    expect(Object.isFrozen(baseline.requirementIds)).toBe(true);
    expect(Object.isFrozen(baseline.decisions['scope-FR-007'])).toBe(true);
    expect(selectGenerationReadiness(state)).toBe('Ready');
    expect(selectScopeReadiness(state)).toBe(100);
    expect(state.liveReadiness).toBe(readiness);
    expect(
      state.agentStatuses.every((agent) => agent.status === 'waiting'),
    ).toBe(true);
    expect(state.buildChecks.every((c) => c.status === 'waiting')).toBe(true);
  });
  it('locks decision and review actions and preserves the approved snapshot after clarification changes', () => {
    const actions = readyScenario();
    actions.approveScope();
    const baseline = useDemoStore.getState().pocBaseline;
    actions.setScopeDecision('scope-FR-007', 'excluded');
    actions.setScopeReview('scope', false);
    actions.resetScopeRecommendation('scope-FR-007');
    actions.approveScope();
    expect(useDemoStore.getState().pocBaseline).toBe(baseline);
    expect(selectScopeSummary(useDemoStore.getState()).included).toBe(8);
    expect(useDemoStore.getState().scopeReviews.scope).toBe(true);
    actions.reopenClarification('OQ-001');
    expect(selectGenerationReadiness(useDemoStore.getState())).toBe(
      'Review required',
    );
    expect(useDemoStore.getState().pocBaseline).toBe(baseline);
    actions.reviewClarificationEvidence('OQ-001');
    actions.acceptClarificationResolution('OQ-001');
    expect(selectGenerationReadiness(useDemoStore.getState())).toBe(
      'Review required',
    );
  });
  it('snapshots the actual consultant decision partition and local reasons', () => {
    const actions = readyScenario();
    actions.setScopeDecision('scope-email', 'mocked', 'Simulate only.');
    actions.setScopeReview('scope', true);
    actions.setScopeReview('successCriteria', true);
    actions.approveScope();
    expect(useDemoStore.getState().pocBaseline!.mockedScopeItemIds).toContain(
      'scope-email',
    );
    expect(
      useDemoStore.getState().pocBaseline!.excludedScopeItemIds,
    ).not.toContain('scope-email');
    expect(
      useDemoStore.getState().pocBaseline!.decisions['scope-email'],
    ).toEqual({ decision: 'mocked', reason: 'Simulate only.' });
  });
  it('resets the complete scope state and ignores unknown item IDs', () => {
    const actions = readyScenario();
    actions.setScopeDecision('invalid', 'included');
    actions.selectScopeItem('invalid');
    expect(useDemoStore.getState().scopeOverrides).toEqual({});
    actions.approveScope();
    actions.reset();
    expect(useDemoStore.getState()).toMatchObject(createInitialDemoState());
    expect(useDemoStore.getState().pocBaseline).toBeNull();
  });
  it('keeps scope scoring deterministic and uses canonical confidence without inventing evidence', () => {
    const approval = scopeItems.find((item) => item.id === 'scope-FR-007')!;
    expect(getScopeScore(approval)).toEqual(getScopeScore(approval));
    expect(getScopeScore(approval).confidence).toBe(
      requirements.find((r) => r.id === 'FR-007')!.confidence,
    );
    expect(
      getScopeScore(scopeItems.find((item) => item.id === 'scope-sla')!)
        .confidence,
    ).toBeNull();
    for (const item of scopeItems) {
      for (const id of item.requirementIds)
        expect(requirements.some((r) => r.id === id)).toBe(true);
      for (const id of item.clarificationIds)
        expect(clarifications.some((q) => q.id === id)).toBe(true);
      for (const id of item.evidenceMessageIds)
        expect(transcript.some((m) => m.id === id)).toBe(true);
    }
    for (const c of successCriteria) {
      for (const id of c.requirementIds)
        expect(requirements.some((r) => r.id === id)).toBe(true);
      for (const id of c.scopeItemIds)
        expect(scopeItems.some((s) => s.id === id)).toBe(true);
    }
  });
});
