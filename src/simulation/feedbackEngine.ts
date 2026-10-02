import type { FeedbackRuntime } from '@/types/feedback';
import type { DemoState } from '@/store/demoStore';
import { selectChangeImpact } from '@/store/feedbackSelectors';
import { createPocRuntime, runtimeTime } from './pocRuntime';
export const createFeedbackRuntime = (): FeedbackRuntime => ({
  capture: { status: 'idle', elapsedMs: 0 },
  status: 'waiting',
  reviews: {
    evidence: false,
    requirements: false,
    scope: false,
    artifacts: false,
    tests: false,
  },
  selectedArtifactId: null,
  baseline: null,
  delta: {
    status: 'idle',
    elapsedMs: 0,
    artifactStatuses: {},
    testResults: {},
  },
  v2Runtime: null,
});
export function advanceFeedback(
  state: DemoState,
  target: number,
): FeedbackRuntime {
  const f = state.feedback;
  if (f.capture.status !== 'running' && f.capture.status !== 'paused') return f;
  const elapsedMs = Math.min(20000, Math.max(f.capture.elapsedMs, target));
  return {
    ...f,
    capture: {
      elapsedMs,
      status: elapsedMs === 20000 ? 'completed' : f.capture.status,
    },
    status:
      elapsedMs >= 20000
        ? 'analyzed'
        : elapsedMs >= 8000
          ? 'detected'
          : 'waiting',
  };
}
export function createV2Runtime() {
  const runtime = createPocRuntime();
  const policySequence = 92; // V2 begins at deterministic sandbox time 11:32.
  return {
    ...runtime,
    sequence: policySequence,
    requests: runtime.requests.map((r) =>
      r.priority === 'P2' && r.status !== 'closed'
        ? {
            ...r,
            status: 'awaiting-approval' as const,
            approvalStatus: 'pending' as const,
            history: [
              ...r.history,
              {
                id: `v2-policy-${r.id}`,
                timestamp: runtimeTime(policySequence),
                text: 'RB-002 policy applied · P2 manager approval required',
                userId: 'user-manager',
              },
            ],
          }
        : r,
    ),
  };
}
export function advanceDelta(
  state: DemoState,
  target: number,
): FeedbackRuntime {
  const f = state.feedback;
  if (!f.baseline) return f;
  const elapsedMs = Math.min(32000, Math.max(f.delta.elapsedMs, target));
  const impact = selectChangeImpact(state);
  const artifactStatuses: FeedbackRuntime['delta']['artifactStatuses'] =
    Object.fromEntries(impact.reused.map((a) => [a.id, 'reused']));
  for (const a of impact.modified) {
    const at =
      a.generatedBy === 'backend'
        ? 8000
        : a.generatedBy === 'ui'
          ? 14000
          : a.generatedBy === 'test'
            ? 20000
            : a.generatedBy === 'security'
              ? 26000
              : a.generatedBy === 'deployment'
                ? 32000
                : 4000;
    if (elapsedMs >= at)
      artifactStatuses[a.id] = elapsedMs >= 32000 ? 'validated' : 'modified';
  }
  if (elapsedMs >= 20000)
    artifactStatuses['TC-016'] = elapsedMs >= 32000 ? 'validated' : 'modified';
  return {
    ...f,
    status: elapsedMs === 32000 ? 'implemented' : 'approved',
    delta: {
      elapsedMs,
      status: elapsedMs === 32000 ? 'completed' : f.delta.status,
      artifactStatuses,
      testResults:
        elapsedMs >= 20000
          ? Object.fromEntries(impact.v2Tests.map((t) => [t.id, 'passed']))
          : {},
    },
    v2Runtime: elapsedMs === 32000 ? (f.v2Runtime ?? createV2Runtime()) : null,
  };
}
