import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialDemoState, useDemoStore } from '@/store/demoStore';
import { demoStory, fullDemoDurationMs } from '@/demo/demoStory';
import { demoChapters, type DemoStep } from '@/demo/demoTypes';
import { demoConditionMet } from '@/demo/demoConditions';
import { validateDemoStory } from '@/demo/demoValidation';
import { requirements, clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { selectV2Ready } from '@/store/feedbackSelectors';
import { selectPreviewTraceability } from '@/store/previewSelectors';
const state = useDemoStore.getState;
function advanceStep() {
  state().acknowledgeDemoRoute();
  const index = state().director.stepIndex;
  const step = demoStory[index]!;
  for (let t = 0; t <= step.durationMs; t += 100) {
    if (
      state().director.stepIndex !== index ||
      state().director.status === 'completed'
    )
      break;
    state().tick(100);
  }
  expect(state().director.error, step.id).toBeNull();
  expect(demoConditionMet(state(), step.condition), step.id).toBe(true);
  return step;
}
function runTo(id: string) {
  while (demoStory[state().director.stepIndex]!.id !== id) advanceStep();
  state().acknowledgeDemoRoute();
}
describe('deterministic guided director using real domain transitions', () => {
  beforeEach(() => {
    state().exitFullDemo();
    state().reset();
  });
  it('loads a valid story, all nine chapters, and a five to seven minute default duration', () => {
    expect(validateDemoStory()).toBe(true);
    expect(new Set(demoStory.map((s) => s.chapterId))).toEqual(
      new Set(demoChapters.map((c) => c.id)),
    );
    expect(fullDemoDurationMs).toBeGreaterThanOrEqual(300000);
    expect(fullDemoDurationMs).toBeLessThanOrEqual(420000);
  });
  it('rejects invalid IDs, routes, actions, conditions, targets and references', () => {
    for (const patch of [
      { id: demoStory[1]!.id },
      { route: '/missing' },
      { condition: 'missing' },
      { spotlight: 'missing' },
      { action: { type: 'missing' } },
      { action: { type: 'select-requirement', id: 'FR-404' } },
      { action: { type: 'clarification', ids: ['OQ-404'] } },
    ]) {
      expect(() =>
        validateDemoStory([
          { ...demoStory[0], ...patch } as DemoStep,
          ...demoStory.slice(1),
        ]),
      ).toThrow('Invalid demo story');
    }
  });
  it('runs the full story through P1 enforcement, consultant gates, CR-001, RB-002 and distinct P2 versions', () => {
    const canonical = JSON.stringify({
      requirements,
      clarifications,
      transcript,
    });
    state().startFullDemo();
    runTo('engineer-guard');
    const id = state().director.requestIds.p1!;
    const before = state().pocRuntime.requests.find((r) => r.id === id)!;
    expect(before.status).toBe('awaiting-approval');
    expect(before.approvalStatus).toBe('pending');
    expect(state().pocRuntime.notice).toBeTruthy();
    runTo('v1-consultant-review');
    expect(state().pocRuntime.approval).toBeNull();
    state().tick(2900);
    expect(state().pocRuntime.approval).toBeNull();
    state().tick(100);
    expect(state().pocRuntime.approval).not.toBeNull();
    while (state().director.status !== 'completed') advanceStep();
    expect(selectV2Ready(state())).toBe(true);
    expect(state().feedback.baseline?.id).toBe('RB-002');
    expect(state().pocBaseline?.id).toBe('RB-001');
    expect(selectPreviewTraceability(state()).coverage).toBe(100);
    expect(demoConditionMet(state(), 'v1-p2')).toBe(true);
    expect(demoConditionMet(state(), 'v2-p2')).toBe(true);
    expect(JSON.stringify({ requirements, clarifications, transcript })).toBe(
      canonical,
    );
    const completed = JSON.stringify(state());
    state().tick(5000);
    expect(JSON.stringify(state())).toBe(completed);
  });
  it('freezes domain progression, elapsed presentation time and governance countdown while paused', () => {
    state().startFullDemo();
    runTo('confirm-priority');
    state().tick(1000);
    state().pauseFullDemo();
    const paused = JSON.stringify(state());
    state().tick(20000);
    expect(JSON.stringify(state())).toBe(paused);
    expect(state().resolvedClarificationIds).not.toContain('OQ-001');
    state().resumeFullDemo();
    state().tick(2000);
    expect(state().resolvedClarificationIds).toContain('OQ-001');
  });
  it('holds canonical generation time for reading while keeping active-agent visuals until actual pause', () => {
    state().startFullDemo();
    state().jumpToDemoChapter('generate');
    state().acknowledgeDemoRoute();
    state().tick(10000);
    state().acknowledgeDemoRoute();
    state().tick(5000);
    const elapsed = state().generation.elapsedMs;
    expect(state().generation.status).toBe('running');
    expect(
      state()
        .agentStatuses.filter((a) => ['ui', 'backend', 'data'].includes(a.id))
        .every((a) => a.status === 'running'),
    ).toBe(true);
    state().tick(1000);
    expect(state().generation.elapsedMs).toBe(elapsed);
    state().pauseFullDemo();
    expect(state().generation.status).toBe('paused');
    const paused = JSON.stringify(state());
    state().tick(20000);
    expect(JSON.stringify(state())).toBe(paused);
  });
  it('waits for semantic conditions even after minimum display time', () => {
    state().startFullDemo();
    runTo('scope-boundary');
    useDemoStore.setState({ resolvedClarificationIds: [] });
    const index = state().director.stepIndex;
    state().tick(10000);
    expect(state().director.stepIndex).toBe(index);
    state().tick(16000);
    expect(state().director.status).toBe('paused');
    expect(state().director.error).toContain('clarifications-confirmed');
  });
  it('reconstructs deterministic valid prerequisites for Next, Previous and every chapter', () => {
    state().startFullDemo();
    state().pauseFullDemo();
    state().nextDemoStep();
    expect(state().director.stepIndex).toBe(1);
    expect(state().director.status).toBe('paused');
    state().previousDemoStep();
    expect(state().director.stepIndex).toBe(0);
    for (const c of demoChapters) {
      state().jumpToDemoChapter(c.id);
      state().acknowledgeDemoRoute();
      expect(state().director.error, c.id).toBeNull();
      expect(demoStory[state().director.stepIndex]!.chapterId).toBe(c.id);
      expect(state().director.prepared).toBe(c.id !== 'understand');
    }
    expect(state().pocBaseline?.id).toBe('RB-001');
    expect(state().feedback.baseline?.id).toBe('RB-002');
    expect(selectV2Ready(state())).toBe(true);
  });
  it('guards manual mutations but preserves inspection, then exits to the reached manual product state', () => {
    state().startFullDemo();
    state().jumpToDemoChapter('generate');
    state().acknowledgeDemoRoute();
    state().tick(1000);
    const baseline = state().pocBaseline;
    state().reset();
    state().restart();
    state().setScopeDecision('scope-create', 'excluded');
    expect(state().pocBaseline).toEqual(baseline);
    state().setRequirementView({ selectedId: 'FR-007' });
    expect(state().requirementView.selectedId).toBe('FR-007');
    state().exitFullDemo();
    expect(state().director.mode).toBe('manual');
    expect(state().pocBaseline).toEqual(baseline);
    expect(state().generation.status).toBe('paused');
    state().resumeGeneration();
    state().tick(1000);
    expect(state().generation.status).toBe('running');
    state().reset();
    expect(state()).toMatchObject(createInitialDemoState());
  });
  it('blocks clock progression on a manual route deviation until return or exit', () => {
    state().startFullDemo();
    state().acknowledgeDemoRoute();
    state().tick(1000);
    state().blockDemoRoute();
    const blocked = JSON.stringify(state());
    state().tick(10000);
    expect(JSON.stringify(state())).toBe(blocked);
    state().returnToDemo();
    expect(state().director.routeReady).toBe(false);
    state().tick(10000);
    expect(state().director.stepElapsedMs).toBe(1000);
    state().acknowledgeDemoRoute();
    state().tick(1000);
    expect(state().director.stepElapsedMs).toBe(2000);
  });
  it('supports all presentation speeds without changing canonical timing and resets predictably', () => {
    for (const speed of [0.75, 1, 1.5, 2] as const) {
      state().startFullDemo();
      state().setPresentationSpeed(speed);
      state().acknowledgeDemoRoute();
      state().tick(1000);
      expect(state().director.stepElapsedMs).toBe(1000 * speed);
      expect(state().elapsedMs).toBe(0);
      state().restartFullDemo();
      expect(state().director.stepElapsedMs).toBe(0);
      expect(state().director.stepIndex).toBe(0);
    }
  });
});
