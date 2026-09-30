import { artifacts } from './traceability';
export interface ScenarioTestCase {
  id: string;
  requirementIds: string[];
  status: 'waiting' | 'passed' | 'failed';
}
// These are planned POC checks, not the Vitest suite or fabricated successful results.
export const scenarioTestCases: ScenarioTestCase[] = artifacts
  .filter((artifact) => artifact.kind === 'test')
  .map((artifact) => ({
    id: artifact.id,
    requirementIds: [...artifact.requirementIds],
    status: 'waiting',
  }));
export const demoEstimate = {
  timeToPocMinutes: 25,
  kind: 'illustrative-estimate',
} as const;
