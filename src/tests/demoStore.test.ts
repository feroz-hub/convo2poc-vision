import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialDemoState, useDemoStore } from '@/store/demoStore';
import { agents, buildChecks } from '@/data/agents';
describe('demo store foundation', () => {
  beforeEach(() => useDemoStore.getState().reset());
  it('starts idle with no approved baseline or revealed data', () => {
    expect(useDemoStore.getState()).toMatchObject({
      isRunning: false,
      isPaused: false,
      elapsedMs: 0,
      scopeApproved: false,
      baselineVersion: null,
      currentPocVersion: 'v1',
      visibleTranscriptMessageIds: [],
      detectedRequirementIds: [],
    });
  });
  it('resets all progress and preserves callable actions', () => {
    useDemoStore.setState({
      isRunning: true,
      isPaused: true,
      elapsedMs: 4200,
      currentStage: 'feedback',
      visibleTranscriptMessageIds: ['msg-001'],
      detectedRequirementIds: ['FR-001'],
      openClarificationIds: ['OQ-001'],
      resolvedClarificationIds: ['OQ-002'],
      scopeApproved: true,
      baselineVersion: 'RB-002',
      currentPocVersion: 'v2',
      approvedChangeIds: ['CR-001'],
      demoSpeed: 4,
      agentStatuses: [{ ...agents[0]!, status: 'completed', progress: 100 }],
      buildChecks: [{ ...buildChecks[0]!, status: 'passed' }],
    });
    useDemoStore.getState().reset();
    expect(useDemoStore.getState()).toMatchObject(createInitialDemoState());
    useDemoStore.getState().setDemoSpeed(2);
    expect(useDemoStore.getState().demoSpeed).toBe(2);
  });
  it('creates fresh mutable state without mutating canonical catalogs', () => {
    const first = createInitialDemoState();
    first.agentStatuses[0]!.progress = 90;
    first.buildChecks[0]!.status = 'failed';
    first.detectedRequirementIds.push('FR-001');
    const second = createInitialDemoState();
    expect(second.agentStatuses[0]?.progress).toBe(0);
    expect(second.buildChecks[0]?.status).toBe('waiting');
    expect(second.detectedRequirementIds).toEqual([]);
    expect(agents[0]?.progress).toBe(0);
  });
  it('rejects invalid speed values', () => {
    for (const speed of [0, -1, 5, NaN, Infinity])
      useDemoStore.getState().setDemoSpeed(speed);
    expect(useDemoStore.getState().demoSpeed).toBe(1);
    useDemoStore.getState().setDemoSpeed(0.25);
    expect(useDemoStore.getState().demoSpeed).toBe(0.25);
  });
});
