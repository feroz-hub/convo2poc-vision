import { createInitialDemoState } from '@/store/demoStore';
import { advanceSession } from './demoEngine';
import { sessionEvents } from './sessionEvents';
import { liveInsights } from '@/data/liveSession';
import type { Clarification } from '@/types/domain';
// Replay immutable canonical events into an isolated snapshot: no mutation of the demo store.
// Separates the readiness gained from answer capture from the consultant-review contribution.
export function getEvidenceCaptureReadiness(item: Clarification) {
  const answerEvent = sessionEvents.find(
    (event) =>
      event.type === 'TRANSCRIPT_MESSAGE' &&
      event.messageId === item.resolutionMessageId,
  )!;
  const answerInsights = liveInsights
    .filter((event) => event.sourceMessageId === item.resolutionMessageId)
    .map((event) => event.id);
  const lastDetection = Math.max(
    answerEvent.at,
    ...sessionEvents
      .filter(
        (event) =>
          event.type === 'INSIGHT_DETECTED' &&
          answerInsights.includes(event.insightId),
      )
      .map((event) => event.at),
  );
  const before = advanceSession(
    createInitialDemoState(),
    answerEvent.at - 1,
  ).liveReadiness;
  const after = advanceSession(
    createInitialDemoState(),
    lastDetection,
  ).liveReadiness;
  return { before, after, delta: after - before };
}
