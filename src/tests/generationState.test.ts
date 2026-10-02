import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDemoStore, createInitialDemoState } from '@/store/demoStore';
import { selectGenerationSummary } from '@/store/generationSelectors';
import { selectGenerationReadiness } from '@/store/scopeSelectors';
import { generationEvents } from '@/simulation/generationEvents';
import { attachDemoClock } from '@/simulation/demoEngine';
import {
  getBaselineArtifacts,
  getBaselineTests,
  engineeringTests,
} from '@/data/generation';
import { requirements, clarifications } from '@/data/requirements';
import { successCriteria, scopeItems } from '@/data/scope';
import { approveGenerationBaseline } from './generationFixtures';
beforeEach(() => useDemoStore.getState().reset());
describe('governed generation engine', () => {
  it('blocks every progression action without RB-001', () => {
    const a = useDemoStore.getState();
    a.startGeneration();
    a.nextGenerationEvent();
    a.restartGeneration();
    a.resumeGeneration();
    a.tick(80000);
    expect(useDemoStore.getState().generation).toEqual(
      createInitialDemoState().generation,
    );
  });
  it('loads the approved immutable baseline without modifying capture or readiness', () => {
    const a = approveGenerationBaseline();
    const before = useDemoStore.getState();
    a.startGeneration();
    const after = useDemoStore.getState();
    expect(after.generation).toMatchObject({
      status: 'running',
      baselineId: 'RB-001',
      elapsedMs: 0,
      eventCursor: 1,
    });
    expect(after.pocBaseline).toBe(before.pocBaseline);
    expect(after.elapsedMs).toBe(80000);
    expect(after.liveReadiness).toBe(before.liveReadiness);
  });
  it('completes architecture before activating three parallel branches', () => {
    const a = approveGenerationBaseline();
    a.startGeneration();
    a.tick(22000);
    const s = useDemoStore.getState();
    expect(s.agentStatuses.find((a) => a.id === 'architecture')?.status).toBe(
      'completed',
    );
    expect(
      s.agentStatuses.filter((a) => a.status === 'running').map((a) => a.id),
    ).toEqual(['ui', 'backend', 'data']);
    expect(s.agentStatuses.find((a) => a.id === 'test')?.status).toBe(
      'waiting',
    );
  });
  it('converges branches before testing and sequences security and sandbox', () => {
    const a = approveGenerationBaseline();
    a.startGeneration();
    a.tick(44000);
    expect(
      useDemoStore.getState().agentStatuses.find((a) => a.id === 'test')
        ?.status,
    ).toBe('waiting');
    a.tick(3000);
    let s = useDemoStore.getState();
    expect(
      s.agentStatuses
        .filter((a) => ['ui', 'backend', 'data'].includes(a.id))
        .every((a) => a.status === 'completed'),
    ).toBe(true);
    expect(
      s.buildChecks
        .filter((c) => ['frontend', 'backend', 'schema'].includes(c.id))
        .every((c) => c.status === 'passed'),
    ).toBe(true);
    expect(s.agentStatuses.find((a) => a.id === 'test')?.status).toBe(
      'running',
    );
    a.tick(15000);
    s = useDemoStore.getState();
    expect(s.agentStatuses.find((a) => a.id === 'test')?.status).toBe(
      'completed',
    );
    expect(s.agentStatuses.find((a) => a.id === 'security')?.status).toBe(
      'running',
    );
    expect(s.generation.sandbox).toBe('waiting');
    a.tick(10000);
    expect(useDemoStore.getState().generation.sandbox).toBe('preparing');
  });
  it('pause stops shell-clock progression and resume continues at deterministic speed', () => {
    vi.useFakeTimers();
    try {
      const a = approveGenerationBaseline();
      const detach = attachDemoClock((delta) =>
        useDemoStore.getState().tick(delta),
      );
      a.startGeneration();
      vi.advanceTimersByTime(22000);
      a.pauseGeneration();
      const snapshot = useDemoStore.getState().generation;
      expect(
        useDemoStore
          .getState()
          .agentStatuses.filter((a) => a.status === 'paused'),
      ).toHaveLength(3);
      vi.advanceTimersByTime(5000);
      expect(useDemoStore.getState().generation).toEqual(snapshot);
      a.setDemoSpeed(2);
      a.resumeGeneration();
      vi.advanceTimersByTime(1000);
      expect(useDemoStore.getState().generation.elapsedMs).toBe(24000);
      detach();
    } finally {
      vi.useRealTimers();
    }
  });
  it('manual next event and elapsed-time playback produce identical canonical outputs', () => {
    const a = approveGenerationBaseline();
    while (useDemoStore.getState().generation.status !== 'completed')
      a.nextGenerationEvent();
    const manual = useDemoStore.getState();
    a.restartGeneration();
    a.tick(80000);
    const timed = useDemoStore.getState();
    expect(timed.generation).toEqual(manual.generation);
    expect(timed.agentStatuses).toEqual(manual.agentStatuses);
    expect(timed.buildChecks).toEqual(manual.buildChecks);
    expect(timed.generation.visibleEventIds).toEqual(
      generationEvents.map((e) => e.id),
    );
  });
  it('restart resets engineering only and full reset restores canonical initial state', () => {
    const a = approveGenerationBaseline();
    a.startGeneration();
    a.tick(80000);
    const baseline = useDemoStore.getState().pocBaseline;
    const history = useDemoStore.getState().clarificationHistory;
    a.restartGeneration();
    const s = useDemoStore.getState();
    expect(s.generation.elapsedMs).toBe(0);
    expect(s.generation.artifactStatuses).toEqual({});
    expect(s.pocBaseline).toBe(baseline);
    expect(s.clarificationHistory).toBe(history);
    expect(s.scopeApproved).toBe(true);
    a.reset();
    expect(useDemoStore.getState()).toMatchObject(createInitialDemoState());
  });
  it('reopening after approval blocks ongoing work and completed review access', () => {
    const a = approveGenerationBaseline();
    a.startGeneration();
    a.tick(22000);
    a.reopenClarification('OQ-001');
    a.tick(1000);
    expect(useDemoStore.getState().generation.elapsedMs).toBe(22000);
    expect(useDemoStore.getState().generation.status).toBe('paused');
    a.resumeGeneration();
    a.nextGenerationEvent();
    expect(useDemoStore.getState().generation.elapsedMs).toBe(22000);
    expect(
      selectGenerationSummary(useDemoStore.getState()).humanReviewReady,
    ).toBe(false);
    expect(selectGenerationReadiness(useDemoStore.getState())).toBe(
      'Review required',
    );
  });
  it('completion requires all agent, build, test and sandbox outputs', () => {
    const a = approveGenerationBaseline();
    a.startGeneration();
    a.tick(80000);
    const s = useDemoStore.getState();
    expect(selectGenerationSummary(s)).toMatchObject({
      progress: 100,
      active: 0,
      complete: 8,
      testsPassed: engineeringTests.length,
      testsTotal: engineeringTests.length,
      validationReady: true,
      humanReviewReady: true,
    });
    expect(s.generation.sandbox).toBe('ready');
    expect(
      Object.values(s.generation.artifactStatuses).every(
        (status) => status === 'validated',
      ),
    ).toBe(true);
    a.reopenClarification('OQ-002');
    expect(
      selectGenerationSummary(useDemoStore.getState()).humanReviewReady,
    ).toBe(false);
  });
  it('derives artifact and test metadata from canonical IDs and all approved success criteria', () => {
    approveGenerationBaseline();
    const baseline = useDemoStore.getState().pocBaseline!;
    const outputs = getBaselineArtifacts(baseline);
    expect(new Set(outputs.map((a) => a.id)).size).toBe(outputs.length);
    for (const output of outputs) {
      expect(output.requirementIds.length).toBeGreaterThan(0);
      for (const id of output.requirementIds)
        expect(requirements.some((r) => r.id === id)).toBe(true);
      for (const id of output.successCriterionIds)
        expect(successCriteria.some((c) => c.id === id)).toBe(true);
    }
    const tests = getBaselineTests(baseline);
    expect(tests.some((t) => t.id === 'TC-016')).toBe(false);
    for (const c of successCriteria)
      expect(
        tests.some(
          (t) =>
            t.successCriterionId === c.id &&
            c.requirementIds.some((id) => t.requirementIds.includes(id)),
        ),
      ).toBe(true);
    expect(tests).toHaveLength(engineeringTests.length);
    expect(new Set(tests.map((t) => t.id)).size).toBe(tests.length);
    for (const t of tests) {
      for (const id of t.requirementIds)
        expect(requirements.some((r) => r.id === id)).toBe(true);
      for (const id of t.artifactIds ?? [])
        expect(
          outputs.some(
            (a) =>
              a.id === id &&
              a.requirementIds.some((r) => t.requirementIds.includes(r)),
          ),
        ).toBe(true);
    }
  });
  it('honors approved scope overrides and preserves immutable catalogs', () => {
    const a = useDemoStore.getState();
    a.start();
    a.tick(80000);
    for (const q of clarifications) {
      a.reviewClarificationEvidence(q.id);
      a.acceptClarificationResolution(q.id);
    }
    a.setScopeDecision('scope-FR-002', 'excluded');
    a.setScopeDecision(
      'scope-email',
      'mocked',
      'Simulate notification behavior',
    );
    for (const k of [
      'requirements',
      'assumptions',
      'scope',
      'successCriteria',
    ] as const)
      a.setScopeReview(k, true);
    a.approveScope();
    const initial = JSON.stringify({ requirements, scopeItems });
    const outputs = getBaselineArtifacts(useDemoStore.getState().pocBaseline!);
    expect(outputs.some((a) => a.id === 'list-screen')).toBe(false);
    expect(
      getBaselineTests(useDemoStore.getState().pocBaseline!).some(
        (t) => t.id === 'TC-021',
      ),
    ).toBe(false);
    expect(outputs.some((a) => a.id === 'dependency-scope-email')).toBe(true);
    a.startGeneration();
    a.tick(80000);
    expect(JSON.stringify({ requirements, scopeItems })).toBe(initial);
  });
  it('invalidated test or artifact results close the human review gate even after completion', () => {
    const a = approveGenerationBaseline();
    a.startGeneration();
    a.tick(80000);
    const complete = useDemoStore.getState().generation;
    useDemoStore.setState({
      generation: {
        ...complete,
        testResults: { ...complete.testResults, 'TC-012': 'failed' },
      },
    });
    expect(
      selectGenerationSummary(useDemoStore.getState()).humanReviewReady,
    ).toBe(false);
    useDemoStore.setState({
      generation: {
        ...complete,
        artifactStatuses: {
          ...complete.artifactStatuses,
          'api-contract': 'generated',
        },
      },
    });
    expect(
      selectGenerationSummary(useDemoStore.getState()).humanReviewReady,
    ).toBe(false);
  });
  it('typed failure state does not advertise human review readiness', () => {
    approveGenerationBaseline();
    useDemoStore.setState({
      generation: { ...useDemoStore.getState().generation, status: 'failed' },
      agentStatuses: useDemoStore
        .getState()
        .agentStatuses.map((a) =>
          a.id === 'architecture' ? { ...a, status: 'failed' } : a,
        ),
    });
    expect(
      selectGenerationSummary(useDemoStore.getState()).humanReviewReady,
    ).toBe(false);
  });
});
