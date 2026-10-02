import { getBaselineArtifacts, getBaselineTests } from '@/data/generation';
import { selectGenerationReadiness } from './scopeSelectors';
import type { DemoState } from './demoStore';
export function selectGenerationSummary(state: DemoState) {
  const tests = state.pocBaseline ? getBaselineTests(state.pocBaseline) : [];
  const complete = state.agentStatuses.filter(
    (a) => a.status === 'completed',
  ).length;
  const valid = state.buildChecks.every((c) => c.status === 'passed');
  const testsPassed = tests.filter(
    (t) => state.generation.testResults[t.id] === 'passed',
  ).length;
  const artifacts = state.pocBaseline
    ? getBaselineArtifacts(state.pocBaseline)
    : [];
  const traceReady =
    artifacts.length > 0 &&
    artifacts.every(
      (a) =>
        state.generation.artifactStatuses[a.id] === 'validated' &&
        a.requirementIds.every((id) =>
          state.pocBaseline!.requirementIds.includes(id),
        ),
    );
  return {
    progress: Math.round(
      state.agentStatuses.reduce((sum, a) => sum + a.progress, 0) /
        state.agentStatuses.length,
    ),
    active: state.agentStatuses.filter((a) => a.status === 'running').length,
    complete,
    artifacts: Object.keys(state.generation.artifactStatuses).length,
    testsTotal: tests.length,
    testsPassed,
    validationReady: valid,
    humanReviewReady:
      state.generation.status === 'completed' &&
      valid &&
      testsPassed === tests.length &&
      tests.length > 0 &&
      complete === state.agentStatuses.length &&
      traceReady &&
      selectGenerationReadiness(state) === 'Ready' &&
      state.generation.sandbox === 'ready',
  };
}
export function selectAgentContract(state: DemoState, id: string) {
  const agent = state.agentStatuses.find((a) => a.id === id)!;
  const artifacts = state.pocBaseline
    ? getBaselineArtifacts(state.pocBaseline)
    : [];
  const outputs = artifacts.filter((a) => a.generatedBy === id);
  const inputProducers: Record<string, string[]> = {
    requirements: [],
    architecture: ['requirements'],
    ui: ['architecture'],
    backend: ['architecture'],
    data: ['architecture'],
    test: ['ui', 'backend', 'data'],
    security: ['test'],
    deployment: ['security'],
  };
  return {
    ...agent,
    inputArtifactIds: artifacts
      .filter((a) => inputProducers[id]!.includes(a.generatedBy))
      .map((a) => a.id),
    outputArtifactIds: outputs.map((a) => a.id),
    requirementIds: [...new Set(outputs.flatMap((a) => a.requirementIds))],
  };
}
