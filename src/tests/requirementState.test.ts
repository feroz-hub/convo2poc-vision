import { beforeEach, describe, expect, it } from 'vitest';
import { useDemoStore } from '@/store/demoStore';
import { requirements, clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { scopeItems } from '@/data/scope';
import {
  calculateLiveReadiness,
  getLiveReadinessBreakdown,
} from '@/simulation/readiness';
import {
  selectRequirementSummary,
  selectRequirementList,
  selectIntelligenceStatus,
  selectEvidenceState,
  getRequirementRelationships,
  getRequirementScopes,
} from '@/store/requirementSelectors';
const record = (id: string) => requirements.find((r) => r.id === id)!;
const capture = () => {
  const actions = useDemoStore.getState();
  actions.start();
  actions.tick(80000);
  return actions;
};
beforeEach(() => useDemoStore.getState().reset());
describe('requirement intelligence selectors', () => {
  it('derives the five canonical types and differentiates catalog availability from capture', () => {
    expect(selectRequirementSummary(useDemoStore.getState())).toMatchObject({
      total: 20,
      functional: 8,
      rules: 4,
      nonFunctional: 2,
      assumptions: 3,
      questions: 3,
      actors: 4,
      captured: 0,
      confirmed: 0,
      needsClarification: 8,
      traceable: 20,
    });
    expect(selectEvidenceState(useDemoStore.getState(), record('FR-007'))).toBe(
      'Recorded evidence · capture pending',
    );
    expect(
      selectEvidenceState(useDemoStore.getState(), record('ASM-001')),
    ).toBe('Scenario brief');
    const state = useDemoStore.getState();
    state.reviewClarificationEvidence('OQ-001');
    state.acceptClarificationResolution('OQ-001');
    expect(selectRequirementSummary(useDemoStore.getState()).captured).toBe(0);
    expect(
      selectIntelligenceStatus(useDemoStore.getState(), record('OQ-001')),
    ).toBe('confirmed');
  });
  it('filters types, status, actors and search with canonical source records', () => {
    const state = useDemoStore.getState();
    state.setRequirementView({ type: 'business-rule' });
    expect(
      selectRequirementList(useDemoStore.getState()).map((r) => r.id),
    ).toEqual(['BR-001', 'BR-002', 'BR-003', 'BR-004']);
    state.setRequirementView({ type: 'all', actor: 'Administrator' });
    expect(
      selectRequirementList(useDemoStore.getState()).every((r) =>
        r.actors.includes('Administrator'),
      ),
    ).toBe(true);
    state.setRequirementView({ actor: null, status: 'needs-review' });
    expect(selectRequirementList(useDemoStore.getState())).toHaveLength(3);
    state.setRequirementView({ status: 'all', search: ' manager approval ' });
    expect(
      selectRequirementList(useDemoStore.getState()).map((r) => r.id),
    ).toEqual(['FR-007', 'BR-003']);
  });
  it('preserves live priority confirmations while formal clarification review remains pending', () => {
    capture();
    const state = useDemoStore.getState();
    expect(selectIntelligenceStatus(state, record('FR-007'))).toBe('confirmed');
    expect(selectIntelligenceStatus(state, record('BR-001'))).toBe('confirmed');
    expect(selectIntelligenceStatus(state, record('BR-003'))).toBe(
      'needs-clarification',
    );
    expect(selectIntelligenceStatus(state, record('OQ-001'))).toBe(
      'needs-clarification',
    );
    expect(selectEvidenceState(state, record('FR-007'))).toBe(
      'Captured in Live Session',
    );
  });
  it('uses consultant approvals, reopening and baseline acknowledgements without changing the catalog', () => {
    const original = JSON.stringify(requirements);
    const actions = capture();
    for (const q of clarifications) {
      actions.reviewClarificationEvidence(q.id);
      actions.acceptClarificationResolution(q.id);
    }
    expect(
      selectIntelligenceStatus(useDemoStore.getState(), record('OQ-003')),
    ).toBe('confirmed');
    expect(
      selectIntelligenceStatus(useDemoStore.getState(), record('BR-003')),
    ).toBe('confirmed');
    expect(
      selectIntelligenceStatus(useDemoStore.getState(), record('ASM-001')),
    ).toBe('needs-review');
    for (const key of [
      'requirements',
      'assumptions',
      'scope',
      'successCriteria',
    ] as const)
      actions.setScopeReview(key, true);
    actions.approveScope();
    expect(
      selectIntelligenceStatus(useDemoStore.getState(), record('ASM-001')),
    ).toBe('acknowledged');
    actions.reopenClarification('OQ-001');
    expect(
      selectIntelligenceStatus(useDemoStore.getState(), record('BR-003')),
    ).toBe('needs-clarification');
    expect(
      selectIntelligenceStatus(useDemoStore.getState(), record('FR-007')),
    ).toBe('confirmed');
    expect(JSON.stringify(requirements)).toBe(original);
  });
  it('builds relationships exclusively from valid canonical references', () => {
    const linked = getRequirementRelationships(record('FR-007')).map(
      (r) => r.id,
    );
    expect(linked).toEqual(expect.arrayContaining(['BR-001', 'BR-003']));
    expect(getRequirementScopes(record('BR-003')).map((s) => s.id)).toContain(
      'scope-FR-007',
    );
    expect(getRequirementScopes(record('BR-004')).map((s) => s.id)).toContain(
      'scope-FR-005',
    );
    for (const r of requirements) {
      expect(
        getRequirementRelationships(r).every((other) =>
          requirements.includes(other),
        ),
      ).toBe(true);
      expect(getRequirementScopes(r).every((s) => scopeItems.includes(s))).toBe(
        true,
      );
      if (r.sourceMessageId) {
        const source = transcript.find((m) => m.id === r.sourceMessageId)!;
        expect(source.timestamp).toBe(r.sourceTimestamp);
        expect(source.speaker).toBe(r.speaker);
      }
    }
  });
  it('exposes the unchanged weighted readiness calculation at every simulation event', () => {
    const actions = useDemoStore.getState();
    for (let i = 0; i < 46; i++) {
      actions.nextEvent();
      const state = useDemoStore.getState();
      const dims = getLiveReadinessBreakdown(state);
      expect(dims.reduce((n, d) => n + d.weight, 0)).toBe(100);
      expect(calculateLiveReadiness(state)).toBe(
        Math.round(dims.reduce((n, d) => n + (d.score * d.weight) / 100, 0)),
      );
      expect(state.liveReadiness).toBe(calculateLiveReadiness(state));
    }
    expect(useDemoStore.getState().liveReadiness).toBe(90);
    actions.reviewClarificationEvidence('OQ-001');
    actions.acceptClarificationResolution('OQ-001');
    expect(useDemoStore.getState().liveReadiness).toBe(93);
  });
  it('resets UI selection/filters and ignores invalid selection without mutating canonical requirements', () => {
    const original = JSON.stringify(requirements);
    const state = useDemoStore.getState();
    state.setRequirementView({
      selectedId: 'BR-004',
      type: 'business-rule',
      status: 'confirmed',
      actor: 'Administrator',
      search: 'closed',
    });
    state.reset();
    expect(useDemoStore.getState().requirementView).toEqual({
      selectedId: 'FR-007',
      type: 'all',
      status: 'all',
      actor: null,
      search: '',
    });
    state.setRequirementView({ selectedId: 'FR-404' });
    expect(useDemoStore.getState().requirementView.selectedId).toBe('FR-007');
    expect(JSON.stringify(requirements)).toBe(original);
  });
});
