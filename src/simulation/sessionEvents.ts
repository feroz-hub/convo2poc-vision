import { transcript } from '@/data/transcript';
import {
  liveInsights,
  sessionDurationMs,
  transcriptTime,
} from '@/data/liveSession';
export type SessionEvent =
  | { id: string; at: number; type: 'TRANSCRIPT_MESSAGE'; messageId: string }
  | { id: string; at: number; type: 'INSIGHT_DETECTED'; insightId: string }
  | { id: string; at: number; type: 'SESSION_COMPLETED' };
export const sessionEvents: SessionEvent[] = [
  ...transcript.map((message, index): SessionEvent => ({
    id: `event-${message.id}`,
    at: transcriptTime(index),
    type: 'TRANSCRIPT_MESSAGE',
    messageId: message.id,
  })),
  ...liveInsights.map((insight): SessionEvent => ({
    id: `event-${insight.id}`,
    at: insight.at,
    type: 'INSIGHT_DETECTED',
    insightId: insight.id,
  })),
  {
    id: 'session-complete',
    at: sessionDurationMs,
    type: 'SESSION_COMPLETED' as const,
  },
].sort((a, b) => a.at - b.at);
