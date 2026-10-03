import { beforeEach, describe, expect, it } from 'vitest';
import { useDemoStore } from '@/store/demoStore';
import {
  calculateArtifactReuse,
  selectValueReport,
} from '@/store/valueSelectors';
import { selectGenerationSummary } from '@/store/generationSelectors';
import { selectRequirementSummary } from '@/store/requirementSelectors';
import { selectScopeSummary } from '@/store/scopeSelectors';
import { selectTraceabilityModel } from '@/store/traceabilitySelectors';
import { selectChangeImpact } from '@/store/feedbackSelectors';
import { prepareV2, analyzeFeedback } from './feedbackFixtures';
import { demoStory, fullDemoDurationMs } from '@/demo/demoStory';
import { requirements } from '@/data/requirements';
beforeEach(() => {
  useDemoStore.getState().exitFullDemo();
  useDemoStore.getState().reset();
});
describe('read-only executive value projection', () => {
  it('reports pending timing, change impact and approval before evidence exists', () => {
    const r = selectValueReport(useDemoStore.getState());
    expect(r.timeToPocMs).toBeNull();
    expect(r.feedbackToV2Ms).toBeNull();
    expect(r.impactAvailable).toBe(false);
    expect(r.gatesCompleted).toBe(0);
    expect(r.trace.coverage).toBe(0);
  });
  it('uses the source-page selectors directly after a validated change', () => {
    const s = prepareV2(),
      r = selectValueReport(s);
    expect(r.generation).toEqual(selectGenerationSummary(s));
    expect(r.requirements).toEqual(selectRequirementSummary(s));
    expect(r.scope).toEqual(selectScopeSummary(s));
    expect(r.trace).toEqual(selectTraceabilityModel(s).health);
    expect(r.impact).toEqual(selectChangeImpact(s));
    expect(r.timeToPocMs).toBe(160000);
    expect(r.feedbackToV2Ms).toBe(47000);
    expect(r.versions).toBe(2);
    expect(r.status).toBe('POC v2 Ready for Human Review');
    expect(r.gatesCompleted).toBe(6);
    expect(r.trace.coverage).toBe(100);
  });
  it('does not equate analyzed feedback with validated v2 or human approval', () => {
    const r = selectValueReport(analyzeFeedback());
    expect(r.impactAvailable).toBe(true);
    expect(r.feedbackToV2Ms).toBeNull();
    expect(r.v2Ready).toBe(false);
  });
  it('calculates reuse from counts rather than fixing a percentage', () => {
    expect(calculateArtifactReuse(25, 15)).toBe(62.5);
    expect(calculateArtifactReuse(3, 1)).toBe(75);
    expect(calculateArtifactReuse(0, 0)).toBe(0);
    const r = selectValueReport(prepareV2());
    expect(r.reusePercent).toBe(
      calculateArtifactReuse(r.impact.reused.length, r.impact.modified.length),
    );
  });
  it('failed validation cannot report successful completion', () => {
    const s = prepareV2();
    const failed = {
      ...s,
      generation: {
        ...s.generation,
        testResults: {
          ...s.generation.testResults,
          'TC-023': 'failed' as const,
        },
      },
    };
    const r = selectValueReport(failed);
    expect(r.timeToPocMs).toBeNull();
    expect(r.feedbackToV2Ms).toBeNull();
    expect(r.trace.coverage).toBeLessThan(100);
  });
  it('reset preserves the immutable requirement catalog and clears achieved outcomes', () => {
    const canonical = JSON.stringify(requirements);
    prepareV2();
    useDemoStore.getState().reset();
    expect(JSON.stringify(requirements)).toBe(canonical);
    expect(selectValueReport(useDemoStore.getState()).versions).toBe(0);
  });
  it('extends the Outcome chapter only after v2 readiness, with no domain mutations', () => {
    const outcome = demoStory.filter((s) => s.chapterId === 'outcome');
    expect(
      outcome.every(
        (s) =>
          s.route === '/value' &&
          s.condition === 'v2-ready' &&
          !s.action &&
          !s.simulation,
      ),
    ).toBe(true);
    expect(fullDemoDurationMs).toBe(351000);
    expect(outcome.filter((s) => s.spotlight)).toHaveLength(8);
  });
  it('supports pause, next, previous, resume, exit and replay in the Outcome chapter', () => {
    const a = useDemoStore.getState();
    a.startFullDemo();
    a.jumpToDemoChapter('outcome');
    a.acknowledgeDemoRoute();
    const canonical = JSON.stringify(requirements);
    const first = useDemoStore.getState().director.stepIndex;
    expect(selectValueReport(useDemoStore.getState()).v2Ready).toBe(true);
    a.pauseFullDemo();
    const elapsed = useDemoStore.getState().director.elapsedMs;
    a.tick(10000);
    expect(useDemoStore.getState().director.elapsedMs).toBe(elapsed);
    a.nextDemoStep();
    a.acknowledgeDemoRoute();
    expect(useDemoStore.getState().director.stepIndex).toBe(first + 1);
    a.previousDemoStep();
    a.acknowledgeDemoRoute();
    expect(useDemoStore.getState().director.stepIndex).toBe(first);
    a.resumeFullDemo();
    a.tick(5000);
    expect(useDemoStore.getState().director.stepIndex).toBe(first + 1);
    a.exitFullDemo();
    a.tick(10000);
    expect(useDemoStore.getState().director.mode).toBe('manual');
    a.restartFullDemo();
    expect(useDemoStore.getState().director.stepIndex).toBe(0);
    expect(selectValueReport(useDemoStore.getState()).timeToPocMs).toBeNull();
    expect(JSON.stringify(requirements)).toBe(canonical);
  });
});
