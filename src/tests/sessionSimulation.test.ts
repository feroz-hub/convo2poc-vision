import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { useDemoStore, createInitialDemoState } from '@/store/demoStore';
import { selectSessionCounts } from '@/store/sessionSelectors';
import { sessionEvents } from '@/simulation/sessionEvents';
import { attachDemoClock } from '@/simulation/demoEngine';
import { calculateLiveReadiness } from '@/simulation/readiness';
import { liveInsights, sessionDurationMs } from '@/data/liveSession';
import { transcript } from '@/data/transcript';
import { requirements } from '@/data/requirements';
import { scenario } from '@/data/scenario';
const store = () => useDemoStore.getState();
const stepUntil = (id: string) => {
  const target = sessionEvents.findIndex((event) => event.id === id);
  expect(target).toBeGreaterThanOrEqual(0);
  while (store().eventCursor <= target) store().nextEvent();
};
beforeEach(() => store().reset());
afterEach(() => vi.useRealTimers());
describe('canonical session events and integrity', () => {
  it('starts with empty intelligence, no speaker, zero readiness and unapproved state', () => {
    expect(store()).toMatchObject(createInitialDemoState());
    expect(selectSessionCounts(store())).toEqual({
      requirements: 0,
      confirmed: 0,
      clarifications: 0,
      actors: 0,
      rules: 0,
      assumptions: 0,
    });
    expect(calculateLiveReadiness(store())).toBe(0);
  });
  it('has unique ordered events and reveals evidence before every spoken detection', () => {
    expect(new Set(sessionEvents.map((e) => e.id)).size).toBe(
      sessionEvents.length,
    );
    expect(sessionEvents.map((e) => e.at)).toEqual(
      sessionEvents.map((e) => e.at).sort((a, b) => a - b),
    );
    for (const insight of liveInsights) {
      if (insight.sourceMessageId) {
        const source = sessionEvents.find(
          (e) =>
            e.type === 'TRANSCRIPT_MESSAGE' &&
            e.messageId === insight.sourceMessageId,
        )!;
        expect(source.at).toBeLessThan(insight.at);
      }
      if (insight.requirementId) {
        const record = requirements.find(
          (r) => r.id === insight.requirementId,
        )!;
        expect(record).toBeDefined();
        expect(insight.sourceMessageId).toBe(record.sourceMessageId);
      }
      if (insight.actor) expect(scenario.actors).toContain(insight.actor);
    }
  });
  it('Next Event reveals transcript in order and requirements only at their detection event', () => {
    stepUntil('event-msg-003');
    expect(store().visibleTranscriptMessageIds).toEqual(
      transcript.slice(0, 3).map((m) => m.id),
    );
    expect(store().detectedRequirementIds).not.toContain('FR-001');
    store().nextEvent();
    expect(store().detectedRequirementIds).toContain('FR-001');
    expect(store().visibleTranscriptMessageIds).toContain('msg-003');
    expect(selectSessionCounts(store()).requirements).toBe(4); // two brief NFRs + simultaneous FR-001 / FR-002
    store().nextEvent();
    expect(selectSessionCounts(store()).requirements).toBe(4);
    stepUntil('event-insight-confirm-FR-002');
    expect(selectSessionCounts(store()).confirmed).toBe(2);
  });
  it('detects ambiguity after its statement, keeps questions open after client responses', () => {
    stepUntil('event-msg-006');
    expect(store().openClarificationIds).not.toContain('OQ-001');
    stepUntil('event-insight-clarify-OQ-001');
    expect(store().openClarificationIds).toEqual(['OQ-001']);
    expect(store().currentStage).toBe('clarification');
    stepUntil('event-msg-008');
    expect(store().resolvedClarificationIds).toEqual([]);
    expect(store().openClarificationIds).toContain('OQ-001');
    expect(store().confirmedRequirementIds).not.toContain('FR-007');
    const beforeAnswer = store().liveReadiness;
    stepUntil('event-insight-confirm-FR-007');
    expect(store().confirmedRequirementIds).toEqual(
      expect.arrayContaining(['BR-001', 'FR-007']),
    );
    expect(store().confirmedRequirementIds).not.toContain('BR-003');
    expect(store().liveReadiness).toBeGreaterThan(beforeAnswer);
    expect(store().openClarificationIds).toContain('OQ-001');
    expect(store().resolvedClarificationIds).toEqual([]);
    expect(store().scopeApproved).toBe(false);
  });
  it('updates readiness and derives final counters without advancing into later phases', () => {
    store().start();
    store().tick(sessionDurationMs);
    expect(store().visibleTranscriptMessageIds).toEqual(
      transcript.map((m) => m.id),
    );
    expect(selectSessionCounts(store())).toEqual({
      requirements: 10,
      confirmed: 7,
      clarifications: 3,
      actors: 4,
      rules: 4,
      assumptions: 3,
    });
    expect(store().liveReadiness).toBe(90);
    expect(store().liveReadiness).toBe(calculateLiveReadiness(store()));
    expect(store()).toMatchObject({
      isRunning: false,
      sessionComplete: true,
      scopeApproved: false,
      baselineVersion: null,
      currentPocVersion: 'v1',
      approvedChangeIds: [],
      resolvedClarificationIds: [],
      activeSpeaker: null,
    });
    expect(store().agentStatuses.every((a) => a.status === 'waiting')).toBe(
      true,
    );
    const completed = store().eventCursor;
    store().nextEvent();
    store().tick(1000);
    expect(store().eventCursor).toBe(completed);
  });
  it('timed playback and stepping produce identical results', () => {
    while (!store().sessionComplete) store().nextEvent();
    const manual = { ...store() };
    store().reset();
    store().start();
    for (let time = 0; time < sessionDurationMs; time += 100) store().tick(100);
    expect(store()).toMatchObject(manual);
  });
});
describe('global clock and playback controls', () => {
  it('Run starts, Pause freezes timed events, Resume continues, cleanup stops clock', () => {
    vi.useFakeTimers();
    const detach = attachDemoClock((delta) => store().tick(delta));
    store().start();
    vi.advanceTimersByTime(2000);
    expect(store().isRunning).toBe(true);
    expect(store().visibleTranscriptMessageIds).toEqual(['msg-001']);
    store().pause();
    const elapsed = store().elapsedMs;
    vi.advanceTimersByTime(10000);
    expect(store().elapsedMs).toBe(elapsed);
    store().resume();
    vi.advanceTimersByTime(4800);
    expect(store().visibleTranscriptMessageIds).toEqual(['msg-001', 'msg-002']);
    detach();
    vi.advanceTimersByTime(10000);
    expect(store().elapsedMs).toBe(elapsed + 4800);
  });
  it('restart runs from beginning; reset restores every initial field; speed scales only demo time', () => {
    store().start();
    store().tick(25000);
    store().pause();
    store().restart();
    expect(store()).toMatchObject({
      ...createInitialDemoState(),
      isRunning: true,
    });
    store().setDemoSpeed(2);
    store().tick(1000);
    expect(store().elapsedMs).toBe(2000);
    store().reset();
    expect(store()).toMatchObject(createInitialDemoState());
    store().resume();
    expect(store().isRunning).toBe(false);
  });
});
