import { requirements, clarifications } from '@/data/requirements';
import { scenario } from '@/data/scenario';
import type { DemoState } from '@/store/demoStore';
// One shared illustrative model: problem 25%, actors 15%, functional coverage 30%,
// business rules 15%, brief coverage 5%, reviewed clarifications 10%.
// Unresolved questions retain their weight; a response in a transcript is not review approval.
export function calculateLiveReadiness(state: DemoState): number {
  const coverage = (type: 'functional' | 'business-rule') => {
    const records = requirements.filter((r) => r.type === type);
    return (
      records.filter((r) => state.detectedRequirementIds.includes(r.id))
        .length / records.length
    );
  };
  const brief = requirements.filter((r) => !r.sourceMessageId);
  const briefIds = [
    ...state.detectedRequirementIds,
    ...state.detectedAssumptionIds,
  ];
  return Math.round(
    (state.visibleInsightEventIds.includes('insight-problem') ? 25 : 0) +
      (state.detectedActorIds.length / scenario.actors.length) * 15 +
      coverage('functional') * 30 +
      coverage('business-rule') * 15 +
      (brief.filter((r) => briefIds.includes(r.id)).length / brief.length) * 5 +
      (state.resolvedClarificationIds.length / clarifications.length) * 10,
  );
}
