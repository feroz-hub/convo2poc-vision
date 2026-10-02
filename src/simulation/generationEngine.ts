import { agents, buildChecks } from '@/data/agents';
import { getBaselineArtifacts, getBaselineTests } from '@/data/generation';
import { selectGenerationReadiness } from '@/store/scopeSelectors';
import type { DemoState } from '@/store/demoStore';
import type { GenerationRuntime } from '@/types/domain';
import {
  generationEvents,
  generationDurationMs,
  type GenerationEvent,
} from './generationEvents';
export const createGenerationRuntime = (): GenerationRuntime => ({
  status: 'idle',
  elapsedMs: 0,
  eventCursor: 0,
  baselineId: null,
  visibleEventIds: [],
  artifactStatuses: {},
  testResults: {},
  sandbox: 'waiting',
  selectedAgentId: 'requirements',
  selectedArtifactId: null,
});
export const createEngineeringState = () => ({
  generation: createGenerationRuntime(),
  agentStatuses: agents.map((a) => ({ ...a })),
  buildChecks: buildChecks.map((c) => ({ ...c })),
});
const dependencies: Record<string, string[]> = {
  requirements: [],
  architecture: ['requirements'],
  ui: ['architecture'],
  backend: ['architecture'],
  data: ['architecture'],
  test: ['ui', 'backend', 'data'],
  security: ['test'],
  deployment: ['security'],
};
function apply(state: DemoState, e: GenerationEvent): DemoState {
  const baseline = state.pocBaseline!;
  const g = {
    ...state.generation,
    eventCursor: state.generation.eventCursor + 1,
    visibleEventIds: [...state.generation.visibleEventIds, e.id],
  };
  const next = { ...state, generation: g };
  switch (e.type) {
    case 'BASELINE_LOADED':
      g.baselineId = baseline.id;
      break;
    case 'AGENT_UPDATED': {
      if (
        e.status === 'running' &&
        !dependencies[e.agentId]!.every((id) =>
          next.agentStatuses.some(
            (a) => a.id === id && a.status === 'completed',
          ),
        )
      )
        return {
          ...state,
          generation: { ...state.generation, status: 'failed' },
        };
      next.agentStatuses = state.agentStatuses.map((a) =>
        a.id === e.agentId
          ? {
              ...a,
              status: e.status,
              progress: e.progress,
              ...(e.status === 'running' && !a.startedAt
                ? { startedAt: formatGenerationTime(e.at) }
                : {}),
              ...(e.status === 'completed'
                ? { completedAt: formatGenerationTime(e.at) }
                : {}),
            }
          : a,
      );
      break;
    }
    case 'ARTIFACT_GENERATED':
      g.artifactStatuses = {
        ...g.artifactStatuses,
        ...Object.fromEntries(
          getBaselineArtifacts(baseline)
            .filter((a) => a.generatedBy === e.agentId)
            .map((a) => [a.id, 'generated' as const]),
        ),
      };
      break;
    case 'BUILD_CHECK_UPDATED':
      next.buildChecks = state.buildChecks.map((c) =>
        c.id === e.checkId ? { ...c, status: e.status } : c,
      );
      break;
    case 'TEST_GENERATED':
      g.testResults = Object.fromEntries(
        getBaselineTests(baseline).map((t) => [t.id, 'generated' as const]),
      );
      g.artifactStatuses = {
        ...g.artifactStatuses,
        ...Object.fromEntries(
          getBaselineArtifacts(baseline)
            .filter((a) => a.kind === 'test')
            .map((a) => [a.id, 'generated' as const]),
        ),
      };
      break;
    case 'TEST_PASSED':
      g.testResults = Object.fromEntries(
        Object.keys(g.testResults).map((id) => [id, 'passed' as const]),
      );
      break;
    case 'SANDBOX_STARTED':
      g.sandbox = 'preparing';
      break;
    case 'SANDBOX_READY':
      g.sandbox = 'ready';
      break;
    case 'GENERATION_COMPLETE': {
      const valid =
        next.buildChecks.every((c) => c.status === 'passed') &&
        getBaselineTests(baseline).every(
          (t) => g.testResults[t.id] === 'passed',
        ) &&
        next.agentStatuses.every((a) => a.status === 'completed') &&
        g.sandbox === 'ready';
      g.status = valid ? 'completed' : 'failed';
      if (valid)
        g.artifactStatuses = Object.fromEntries(
          Object.keys(g.artifactStatuses).map((id) => [
            id,
            'validated' as const,
          ]),
        );
      break;
    }
  }
  return next;
}
export function advanceGeneration(
  state: DemoState,
  targetMs: number,
): DemoState {
  if (
    selectGenerationReadiness(state) !== 'Ready' ||
    state.pocBaseline?.id !== 'RB-001'
  )
    return { ...state, generation: { ...state.generation, status: 'paused' } };
  let next = {
    ...state,
    generation: {
      ...state.generation,
      elapsedMs: Math.min(
        generationDurationMs,
        Math.max(state.generation.elapsedMs, targetMs),
      ),
    },
  };
  while (
    generationEvents[next.generation.eventCursor] &&
    generationEvents[next.generation.eventCursor]!.at <=
      next.generation.elapsedMs
  ) {
    next = apply(next, generationEvents[next.generation.eventCursor]!);
    if (next.generation.status === 'failed') break;
  }
  return next;
}
export function formatGenerationTime(ms: number) {
  return `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
}
