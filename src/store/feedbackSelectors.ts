import type { DemoState } from './demoStore';
import { selectPreviewReady } from './previewSelectors';
import { getBaselineArtifacts, getBaselineTests } from '@/data/generation';
import { scopeItems } from '@/data/scope';
import { featureEvidence } from '@/data/pocRuntime';
import {
  policyConsumerFeatureIds,
  p2ApprovalTest,
  requirementRevisions,
  feedbackReviews,
  deltaMilestones,
} from '@/data/feedbackEvolution';
import type { VersionedTest } from '@/types/feedback';
export function selectChangeImpact(state: DemoState) {
  const baseline = state.pocBaseline;
  const allArtifacts = baseline ? getBaselineArtifacts(baseline) : [];
  const v1Tests = baseline ? getBaselineTests(baseline) : [];
  const consumers = featureEvidence.filter((f) =>
    policyConsumerFeatureIds.some((id) => id === f.id),
  );
  const consumerIds = new Set(consumers.flatMap((f) => f.artifactIds));
  const changedTestIds = new Set(
    v1Tests
      .filter((t) =>
        t.requirementIds.some((id) =>
          requirementRevisions.some((r) => r.requirementId === id),
        ),
      )
      .map((t) => t.id),
  );
  const modified = allArtifacts.filter(
    (a) =>
      (consumerIds.has(a.id) && (a.kind === 'screen' || a.kind === 'api')) ||
      changedTestIds.has(a.id) ||
      [
        'mapped-requirements',
        'implementation-plan',
        'security-report',
        'runtime-manifest',
      ].includes(a.id),
  );
  const reused = allArtifacts.filter(
    (a) => !modified.some((m) => m.id === a.id),
  );
  const v2Tests: VersionedTest[] = [
    ...v1Tests
      .filter((t) => t.id !== 'TC-023')
      .map((t) => ({
        ...t,
        baselineId: 'RB-002' as const,
        ...(changedTestIds.has(t.id)
          ? { changeRequestId: 'CR-001' as const }
          : {}),
      })),
    p2ApprovalTest,
  ];
  return {
    allArtifacts,
    modified,
    reused,
    v1Tests,
    v2Tests,
    consumers,
    changedTestIds,
    reusedTests: v1Tests.filter((t) => !changedTestIds.has(t.id)),
    scopeCategoryChanges:
      baseline && state.feedback.baseline
        ? Object.keys(baseline.decisions).filter(
            (id) =>
              baseline.decisions[id]?.decision !==
              state.feedback.baseline!.decisions[id]?.decision,
          ).length
        : 0,
    scopeItemIds: scopeItems
      .filter((item) =>
        item.requirementIds.some((id) =>
          requirementRevisions.some((r) => r.requirementId === id),
        ),
      )
      .map((item) => item.id),
    architectureChanges: modified.filter(
      (a) => a.generatedBy === 'architecture',
    ),
    unchangedFeatures: featureEvidence.filter(
      (f) => f.id !== 'identity' && !consumers.some((c) => c.id === f.id),
    ),
    businessRules: requirementRevisions.filter((r) =>
      r.requirementId.startsWith('BR-'),
    ),
    newTests: [p2ApprovalTest],
  };
}
export const selectFeedbackReviewComplete = (state: DemoState) =>
  state.feedback.status === 'analyzed' &&
  feedbackReviews.every((r) => state.feedback.reviews[r.key]);
export function selectV2Ready(state: DemoState) {
  const f = state.feedback,
    impact = selectChangeImpact(state);
  return (
    selectPreviewReady(state) &&
    !!f.baseline &&
    f.status === 'implemented' &&
    f.delta.status === 'completed' &&
    !!f.v2Runtime &&
    impact.v2Tests.every((t) => f.delta.testResults[t.id] === 'passed') &&
    impact.modified.every((a) => f.delta.artifactStatuses[a.id] === 'validated')
  );
}
export function selectDeltaAgents(state: DemoState) {
  const d = state.feedback.delta;
  return [
    'requirements',
    'architecture',
    'backend',
    'ui',
    'data',
    'test',
    'security',
    'deployment',
  ].map((id) => {
    const events = deltaMilestones.filter((e) => e.agent === id);
    const completed = d.elapsedMs >= 32000;
    const active = deltaMilestones
      .filter((e) => e.at <= d.elapsedMs)
      .at(-1)?.agent;
    const status =
      id === 'architecture' || id === 'data'
        ? 'reused'
        : d.status === 'idle'
          ? 'waiting'
          : completed
            ? 'validated'
            : active === id
              ? d.status === 'paused'
                ? 'paused'
                : 'running'
              : events.some((e) => e.at < d.elapsedMs)
                ? 'modified'
                : 'waiting';
    return { id, status };
  });
}
export function selectChangeTrace(state: DemoState) {
  const impact = selectChangeImpact(state);
  const ready = selectV2Ready(state);
  const links = [
    state.feedback.capture.elapsedMs >= 5000,
    state.feedback.capture.elapsedMs >= 8000,
    !!state.feedback.baseline &&
      requirementRevisions.every((r) =>
        state.feedback.baseline!.revisionIds.includes(r.id),
      ),
    !!state.feedback.baseline,
    impact.modified.length > 0 &&
      impact.modified.every(
        (a) => state.feedback.delta.artifactStatuses[a.id] === 'validated',
      ),
    impact.v2Tests.every(
      (t) => state.feedback.delta.testResults[t.id] === 'passed',
    ),
    ready,
  ];
  return {
    nodes: [
      'feedback-001',
      'CR-001',
      ...requirementRevisions.map((r) => r.id),
      'RB-002',
      ...impact.modified.map((a) => a.id),
      p2ApprovalTest.id,
      'POC v2',
    ],
    complete: links.every(Boolean),
    coverage: Math.round((100 * links.filter(Boolean).length) / links.length),
  };
}
