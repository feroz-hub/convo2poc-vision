import { liveInsights, sessionDurationMs } from '@/data/liveSession';
import { transcript } from '@/data/transcript';
import { requirements } from '@/data/requirements';
import type { DemoState } from '@/store/demoStore';
import { sessionEvents, type SessionEvent } from './sessionEvents';
import { calculateLiveReadiness } from './readiness';
const add = <T>(items: T[], value: T) =>
  items.includes(value) ? items : [...items, value];
function applyEvent(state: DemoState, event: SessionEvent): DemoState {
  const next = { ...state, eventCursor: state.eventCursor + 1 };
  if (event.type === 'SESSION_COMPLETED') {
    next.isRunning = false;
    next.isPaused = false;
    next.activeSpeaker = null;
    next.sessionComplete = true;
  } else if (event.type === 'TRANSCRIPT_MESSAGE') {
    const message = transcript.find((m) => m.id === event.messageId)!;
    next.visibleTranscriptMessageIds = add(
      state.visibleTranscriptMessageIds,
      message.id,
    );
    next.currentTranscriptPosition = transcript.indexOf(message);
    next.activeSpeaker = message.role;
    next.speakerUntilMs = event.at + 3200;
    next.currentStage = 'conversation';
  } else {
    const insight = liveInsights.find((i) => i.id === event.insightId)!;
    next.visibleInsightEventIds = add(state.visibleInsightEventIds, insight.id);
    next.currentStage =
      insight.kind === 'clarification-needed' ||
      insight.kind === 'open-question-detected'
        ? 'clarification'
        : 'requirements';
    if (insight.actor)
      next.detectedActorIds = add(state.detectedActorIds, insight.actor);
    if (insight.requirementId) {
      const requirement = requirements.find(
        (r) => r.id === insight.requirementId,
      )!;
      if (insight.kind === 'requirement-confirmed')
        next.confirmedRequirementIds = add(
          state.confirmedRequirementIds,
          requirement.id,
        );
      else if (requirement.type === 'assumption')
        next.detectedAssumptionIds = add(
          state.detectedAssumptionIds,
          requirement.id,
        );
      else if (
        requirement.type === 'open-question' &&
        !state.resolvedClarificationIds.includes(requirement.id)
      )
        next.openClarificationIds = add(
          state.openClarificationIds,
          requirement.id,
        );
      else if (requirement.type !== 'open-question')
        next.detectedRequirementIds = add(
          state.detectedRequirementIds,
          requirement.id,
        );
    }
  }
  next.liveReadiness = calculateLiveReadiness(next);
  return next;
}
// Pure deterministic reducer shared by timed playback and manual advance.
// No later-phase events are scheduled, and no clarification is resolved automatically.
export function advanceSession(state: DemoState, targetMs: number): DemoState {
  let next = { ...state, elapsedMs: Math.min(targetMs, sessionDurationMs) };
  while (
    sessionEvents[next.eventCursor] &&
    sessionEvents[next.eventCursor]!.at <= next.elapsedMs
  ) {
    next = applyEvent(next, sessionEvents[next.eventCursor]!);
  }
  if (next.elapsedMs >= next.speakerUntilMs) next.activeSpeaker = null;
  return next;
}
// The shell owns one clock for the single store. Cleanup makes StrictMode remounts safe.
export function attachDemoClock(tick: (deltaMs: number) => void): () => void {
  const clock = setInterval(() => tick(100), 100);
  return () => clearInterval(clock);
}
