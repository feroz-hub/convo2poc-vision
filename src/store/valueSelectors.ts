import type { DemoState } from './demoStore';
import { selectRequirementSummary } from './requirementSelectors';
import {
  selectClarificationSummary,
  selectResolutionReadiness,
} from './clarificationSelectors';
import { selectScopeSummary, selectSuccessCoverage } from './scopeSelectors';
import { selectGenerationSummary } from './generationSelectors';
import { selectTraceabilityModel } from './traceabilitySelectors';
import { selectChangeImpact, selectV2Ready } from './feedbackSelectors';
import { sessionDurationMs } from '@/data/liveSession';
import { generationDurationMs } from '@/simulation/generationEvents';
import { feedbackMilestones, deltaMilestones } from '@/data/feedbackEvolution';
import { clarifications } from '@/data/requirements';

export function calculateArtifactReuse(reused: number, modified: number) {
  return reused + modified ? (100 * reused) / (reused + modified) : 0;
}
// Active deterministic simulation time, not wall-clock telemetry or Director dwell.
// Discovery start -> validated v1: session + generation. Human review dwell is
// untimed in this prototype. Feedback capture -> v2: remaining capture + delta.
export function selectValueReport(state: DemoState) {
  const requirements = selectRequirementSummary(state);
  const clarification = selectClarificationSummary(state);
  const scope = selectScopeSummary(state);
  const generation = selectGenerationSummary(state);
  const model = selectTraceabilityModel(state);
  const trace = model.health;
  const mappedIds = new Set(
    model.chains.flatMap((c) =>
      c.nodes.filter((n) => n.kind === 'test').map((n) => n.canonicalId),
    ),
  );
  const mappedPassingChecks = [...mappedIds].filter(
    (id) => state.generation.testResults[id] === 'passed',
  ).length;
  const impact = selectChangeImpact(state);
  const v2Ready = selectV2Ready(state);
  const gates = [
    ...clarifications.map((q) => ({
      label: `${q.id} consultant clarification confirmation`,
      done: state.resolvedClarificationIds.includes(q.id),
    })),
    { label: 'RB-001 scope approval', done: !!state.pocBaseline },
    { label: 'POC v1 consultant review', done: !!state.pocRuntime.approval },
    {
      label: 'CR-001 change approval',
      done: state.approvedChangeIds.includes('CR-001'),
    },
    {
      label: 'POC v2 consultant review',
      done: !!state.feedback.v2Runtime?.approval,
    },
  ];
  return {
    requirements,
    clarification,
    scope,
    generation,
    trace,
    impact,
    gates,
    mappedPassingChecks,
    readiness: state.liveReadiness,
    criteria: selectSuccessCoverage(state),
    clarificationReadiness: selectResolutionReadiness(state, 'OQ-001'),
    timeToPocMs: generation.humanReviewReady
      ? sessionDurationMs + generationDurationMs
      : null,
    feedbackToV2Ms: v2Ready
      ? feedbackMilestones.at(-1)!.at -
        feedbackMilestones.find((m) => m.label === 'Client feedback captured')!
          .at +
        deltaMilestones.at(-1)!.at
      : null,
    changeCaptured:
      state.feedback.capture.elapsedMs >=
      feedbackMilestones.find((m) => m.label === 'CR-001 detected')!.at,
    impactAvailable:
      state.feedback.capture.elapsedMs >= feedbackMilestones.at(-1)!.at,
    reusePercent: calculateArtifactReuse(
      impact.reused.length,
      impact.modified.length,
    ),
    gatesCompleted: gates.filter((g) => g.done).length,
    v2Ready,
    versions: Number(generation.humanReviewReady) + Number(v2Ready),
    status: v2Ready
      ? state.feedback.v2Runtime?.approval
        ? 'POC v2 Approved for Demonstration'
        : 'POC v2 Ready for Human Review'
      : generation.humanReviewReady
        ? 'POC v1 Ready for Human Review'
        : 'Journey in progress',
  };
}
