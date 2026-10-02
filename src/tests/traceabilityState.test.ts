import { beforeEach, describe, expect, it } from 'vitest';
import { useDemoStore } from '@/store/demoStore';
import {
  selectTraceChain,
  selectTraceabilityModel,
} from '@/store/traceabilitySelectors';
import { preparePreview } from './previewFixtures';
import { requirements, clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { scopeItems, successCriteria } from '@/data/scope';
import { engineeringArtifacts, engineeringTests } from '@/data/generation';
import { featureEvidence } from '@/data/pocRuntime';
import { linkedTraceIds } from '@/components/traceability/tracePresentation';
describe('canonical end-to-end traceability projections', () => {
  beforeEach(() => useDemoStore.getState().reset());
  it('does not claim validated or captured chains in initial state', () => {
    const model = selectTraceabilityModel(useDemoStore.getState());
    expect(model.health).toMatchObject({
      coverage: 0,
      features: 0,
      featuresTotal: 8,
      sources: 0,
      testsPassed: 0,
    });
    expect(model.chains.every((c) => !c.complete)).toBe(true);
    expect(
      model.chains.some((c) =>
        c.nodes.some((n) => n.status === 'Planned · not executed'),
      ),
    ).toBe(true);
  });
  it('derives completed health from all eight workflows and canonical tests', () => {
    const model = selectTraceabilityModel(preparePreview());
    expect(model.health).toMatchObject({
      coverage: 100,
      features: 8,
      featuresTotal: 8,
      sources: 8,
      unmapped: 0,
      tests: engineeringTests.length,
      testsTotal: engineeringTests.length,
      testsPassed: engineeringTests.length,
    });
    expect(model.health.requirements).toBe(model.health.requirementsTotal);
  });
  it('uses valid canonical nodes and edges without changing source catalogs', () => {
    const source = JSON.stringify({
      requirements,
      clarifications,
      transcript,
      scopeItems,
      successCriteria,
      engineeringTests,
      engineeringArtifacts,
      featureEvidence,
    });
    const model = selectTraceabilityModel(preparePreview());
    const catalogs = {
      conversation: transcript,
      clarification: clarifications,
      requirement: requirements,
      scope: scopeItems,
      criterion: successCriteria,
      artifact: engineeringArtifacts,
      feature: featureEvidence,
      test: engineeringTests,
    };
    for (const c of model.chains) {
      expect(new Set(c.nodes.map((n) => n.id)).size).toBe(c.nodes.length);
      expect(new Set(c.edges.map((e) => e.id)).size).toBe(c.edges.length);
      for (const n of c.nodes)
        expect(
          catalogs[n.kind].some((record) => record.id === n.canonicalId),
        ).toBe(true);
      for (const e of c.edges) {
        expect(c.nodes.some((n) => n.id === e.source)).toBe(true);
        expect(c.nodes.some((n) => n.id === e.target)).toBe(true);
      }
    }
    expect(
      JSON.stringify({
        requirements,
        clarifications,
        transcript,
        scopeItems,
        successCriteria,
        engineeringTests,
        engineeringArtifacts,
        featureEvidence,
      }),
    ).toBe(source);
  });
  it('preserves the priority ambiguity, client answer, reviewed requirements and passing checks', () => {
    const chain = selectTraceChain(preparePreview(), 'approval');
    for (const id of [
      'conversation:msg-006',
      'conversation:msg-008',
      'clarification:OQ-001',
      'requirement:FR-007',
      'requirement:BR-001',
      'requirement:BR-003',
      'scope:scope-FR-007',
      'criterion:SC-004',
      'artifact:approval-screen',
      'artifact:approval-api',
      'feature:approval',
      'test:TC-015',
      'test:TC-017',
    ])
      expect(chain.nodes.some((n) => n.id === id)).toBe(true);
    expect(
      chain.nodes.find((n) => n.id === 'conversation:msg-008')?.description,
    ).toBe(transcript.find((m) => m.id === 'msg-008')?.text);
    expect(
      chain.edges.some(
        (e) =>
          e.source === 'conversation:msg-008' &&
          e.target === 'clarification:OQ-001',
      ),
    ).toBe(true);
    expect(chain.nodes.some((n) => n.canonicalId === 'TC-016')).toBe(false);
  });
  it.each([
    ['requests', 'TC-021'],
    ['history', 'TC-022'],
  ])(
    'traces %s without inventing a clarification or success criterion',
    (feature, id) => {
      const chain = selectTraceChain(preparePreview(), feature);
      expect(
        chain.nodes.some(
          (n) => n.kind === 'clarification' || n.kind === 'criterion',
        ),
      ).toBe(false);
      expect(chain.nodes.find((n) => n.canonicalId === id)?.status).toBe(
        'passed',
      );
      expect(
        chain.edges.some(
          (e) =>
            e.source.startsWith('scope:') && e.target.startsWith('artifact:'),
        ),
      ).toBe(true);
    },
  );
  it('decreases computed health after failed test or artifact validation', () => {
    const state = preparePreview();
    useDemoStore.setState({
      generation: {
        ...state.generation,
        testResults: { ...state.generation.testResults, 'TC-021': 'failed' },
      },
    });
    expect(
      selectTraceabilityModel(useDemoStore.getState()).health.coverage,
    ).toBeLessThan(100);
    expect(selectTraceChain(useDemoStore.getState(), 'requests').complete).toBe(
      false,
    );
    useDemoStore.setState({
      generation: {
        ...state.generation,
        artifactStatuses: {
          ...state.generation.artifactStatuses,
          'detail-screen': 'generated',
        },
      },
    });
    expect(selectTraceChain(useDemoStore.getState(), 'history').complete).toBe(
      false,
    );
  });
  it('withdraws completed-chain claims when consultant review is reopened', () => {
    preparePreview();
    useDemoStore.getState().reopenClarification('OQ-001');
    expect(
      selectTraceChain(useDemoStore.getState(), 'approval').issues,
    ).toContain('Consultant clarification review pending');
    expect(
      selectTraceabilityModel(useDemoStore.getState()).health.coverage,
    ).toBeLessThan(100);
  });
  it('honors baseline exclusions without silently regenerating them', () => {
    const state = preparePreview();
    const baseline = state.pocBaseline!;
    useDemoStore.setState({
      pocBaseline: {
        ...baseline,
        decisions: {
          ...baseline.decisions,
          'scope-FR-002': { decision: 'excluded', reason: 'Deferred' },
        },
      },
    });
    expect(
      selectTraceabilityModel(useDemoStore.getState()).chains.some(
        (c) => c.featureId === 'requests',
      ),
    ).toBe(false);
    expect(useDemoStore.getState().generation).toBe(state.generation);
  });
  it('highlights upstream and downstream nodes for a selected artifact', () => {
    const chain = selectTraceChain(preparePreview(), 'approval');
    const ids = linkedTraceIds(chain, 'artifact:approval-api');
    expect(ids.has('requirement:FR-007')).toBe(true);
    expect(ids.has('feature:approval')).toBe(true);
    expect(ids.has('test:TC-015')).toBe(true);
    expect(ids.has('artifact:approval-screen')).toBe(false);
  });
  it('keeps view state in the shared store and restores its initial state on reset', () => {
    const state = preparePreview();
    const baseline = state.pocBaseline;
    state.setTraceView({
      workflow: 'approval',
      selectedId: 'requirement:FR-007',
      search: 'P1',
      filter: 'complete',
    });
    expect(useDemoStore.getState().pocBaseline).toBe(baseline);
    state.setTraceView({ workflow: 'invalid' });
    expect(useDemoStore.getState().traceView.workflow).toBe('approval');
    state.reset();
    expect(useDemoStore.getState().traceView).toEqual({
      workflow: 'overview',
      selectedId: null,
      search: '',
      filter: 'all',
    });
  });
});
