import { requirements, clarifications } from './requirements';
import { transcript } from './transcript';
import type { Actor, TranscriptMessage } from '@/types/domain';

export const participants: {
  name: string;
  title: string;
  initials: string;
  role: TranscriptMessage['role'];
}[] = [
  {
    name: 'Maya Rao',
    title: 'Operations Manager · Client',
    initials: 'MR',
    role: 'client',
  },
  {
    name: 'Arjun Mehta',
    title: 'HCLTech Consultant',
    initials: 'AM',
    role: 'consultant',
  },
  {
    name: 'Convo2POC Intelligence',
    title: 'Requirement intelligence',
    initials: 'C2',
    role: 'system',
  },
];
export type InsightKind =
  | 'requirement-detected'
  | 'business-rule-detected'
  | 'actor-detected'
  | 'assumption-detected'
  | 'open-question-detected'
  | 'clarification-needed'
  | 'requirement-confirmed'
  | 'business-problem-detected';
export interface LiveInsightEvent {
  id: string;
  kind: InsightKind;
  at: number;
  sourceMessageId?: string;
  requirementId?: string;
  actor?: Actor;
}
export const sessionDurationMs = 80_000;
export const transcriptTime = (index: number) => 2_000 + index * 4_800;
// Reference canonical records; brief evidence is deliberately distinct from spoken evidence.
const seenActors = new Set<Actor>();
export const liveInsights: LiveInsightEvent[] = [
  ...requirements
    .filter((r) => !r.sourceMessageId)
    .map((r, index) => ({
      id: `insight-${r.id}`,
      kind:
        r.type === 'assumption'
          ? ('assumption-detected' as const)
          : ('requirement-detected' as const),
      requirementId: r.id,
      at: 700 + index * 100,
    })),
  ...transcript.flatMap((message, index): LiveInsightEvent[] => {
    const at = transcriptTime(index);
    const records = requirements.filter(
      (r) => r.sourceMessageId === message.id,
    );
    const events: LiveInsightEvent[] = records.map((r) => ({
      id: `insight-${r.id}`,
      at: at + 900,
      sourceMessageId: message.id,
      requirementId: r.id,
      kind:
        r.type === 'open-question'
          ? 'open-question-detected'
          : r.type === 'business-rule'
            ? 'business-rule-detected'
            : 'requirement-detected',
    }));
    if (message.id === 'msg-002')
      events.push({
        id: 'insight-problem',
        kind: 'business-problem-detected',
        at: at + 900,
        sourceMessageId: message.id,
      });
    records
      .flatMap((r) => r.actors)
      .forEach((actor) => {
        if (seenActors.has(actor)) return;
        seenActors.add(actor);
        events.push({
          id: `insight-actor-${actor}`,
          kind: 'actor-detected',
          at: at + 1200,
          sourceMessageId: message.id,
          actor,
        });
      });
    records.forEach((r) => {
      if (r.type === 'open-question') {
        events.push({
          id: `insight-clarify-${r.id}`,
          kind: 'clarification-needed',
          at: at + 1500,
          sourceMessageId: message.id,
          requirementId: r.id,
        });
      } else if (
        !clarifications.some((q) => q.affectedRequirementIds.includes(r.id))
      ) {
        events.push({
          id: `insight-confirm-${r.id}`,
          kind: 'requirement-confirmed',
          at: at + 1800,
          sourceMessageId: message.id,
          requirementId: r.id,
        });
      }
    });
    return events;
  }),
].sort((a, b) => a.at - b.at);

export const insightLabels: Record<InsightKind, string> = {
  'requirement-detected': 'Requirement detected',
  'business-rule-detected': 'Business rule detected',
  'actor-detected': 'Actor detected',
  'assumption-detected': 'Assumption detected',
  'open-question-detected': 'Open question detected',
  'clarification-needed': 'Clarification needed',
  'requirement-confirmed': 'Requirement confirmed',
  'business-problem-detected': 'Business problem detected',
};
