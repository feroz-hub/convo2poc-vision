import { requirements } from '@/data/requirements';
import type { DemoState } from './demoStore';
export const selectSessionCounts = (state: DemoState) => ({
  requirements: state.detectedRequirementIds.filter((id) =>
    requirements.some(
      (r) =>
        r.id === id && (r.type === 'functional' || r.type === 'non-functional'),
    ),
  ).length,
  confirmed: state.confirmedRequirementIds.filter((id) =>
    requirements.some(
      (r) =>
        r.id === id && (r.type === 'functional' || r.type === 'non-functional'),
    ),
  ).length,
  clarifications: state.openClarificationIds.length,
  actors: state.detectedActorIds.length,
  rules: state.detectedRequirementIds.filter((id) =>
    requirements.some((r) => r.id === id && r.type === 'business-rule'),
  ).length,
  assumptions: state.detectedAssumptionIds.length,
});
export const selectPlaybackLabel = (state: DemoState) =>
  state.isRunning
    ? 'LIVE · SIMULATED'
    : state.isPaused
      ? 'PAUSED'
      : state.sessionComplete
        ? 'SESSION CAPTURED'
        : 'READY TO RUN';
