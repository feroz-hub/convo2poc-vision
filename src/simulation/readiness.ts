import { requirements, clarifications } from '@/data/requirements';
import { scenario } from '@/data/scenario';
import type { DemoState } from '@/store/demoStore';
import type { ReadinessDimension } from '@/types/domain';
// The same illustrative model drives live playback, clarification review and requirement inspection.
// Scores retain precision until the overall weighted total is rounded.
export function getLiveReadinessBreakdown(
  state: DemoState,
): ReadinessDimension[] {
  const coverage = (type: 'functional' | 'business-rule') => {
    const records = requirements.filter((r) => r.type === type);
    return (
      (records.filter((r) => state.detectedRequirementIds.includes(r.id))
        .length /
        records.length) *
      100
    );
  };
  const brief = requirements.filter((r) => !r.sourceMessageId);
  const briefIds = [
    ...state.detectedRequirementIds,
    ...state.detectedAssumptionIds,
  ];
  return [
    {
      id: 'problem',
      label: 'Business problem',
      score: state.visibleInsightEventIds.includes('insight-problem') ? 100 : 0,
      weight: 25,
    },
    {
      id: 'actors',
      label: 'Actors',
      score: (state.detectedActorIds.length / scenario.actors.length) * 100,
      weight: 15,
    },
    {
      id: 'workflow',
      label: 'Core workflow',
      score: coverage('functional'),
      weight: 30,
    },
    {
      id: 'rules',
      label: 'Business rules',
      score: coverage('business-rule'),
      weight: 15,
    },
    {
      id: 'brief',
      label: 'Scenario brief',
      score:
        (brief.filter((r) => briefIds.includes(r.id)).length / brief.length) *
        100,
      weight: 5,
    },
    {
      id: 'review',
      label: 'Clarification review',
      score:
        (state.resolvedClarificationIds.length / clarifications.length) * 100,
      weight: 10,
    },
  ];
}
export function calculateLiveReadiness(state: DemoState): number {
  return Math.round(
    getLiveReadinessBreakdown(state).reduce(
      (sum, d) => sum + (d.score * d.weight) / 100,
      0,
    ),
  );
}
