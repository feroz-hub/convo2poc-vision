import { featureEvidence, pocUsers } from '@/data/pocRuntime';
import { getBaselineArtifacts, getBaselineTests } from '@/data/generation';
import { requirements, clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { scopeItems } from '@/data/scope';
import { requirementRevisions } from '@/data/feedbackEvolution';
import { featureAvailable } from '@/simulation/pocRuntime';
import { selectGenerationSummary } from './generationSelectors';
import type { DemoState } from './demoStore';
export function selectFeatureEvidence(state: DemoState, id: string) {
  const feature =
    featureEvidence.find((f) => f.id === id) ?? featureEvidence[5]!;
  const baseline = state.pocBaseline;
  const records = requirements
    .filter((r) => feature.requirementIds.includes(r.id))
    .map((r) =>
      baseline?.version === 'v2'
        ? {
            ...r,
            description:
              requirementRevisions.find((rev) => rev.requirementId === r.id)
                ?.revisedText ?? r.description,
          }
        : r,
    );
  const questions = clarifications.filter((q) =>
    feature.clarificationIds.includes(q.id),
  );
  const messageIds = new Set([
    ...records.flatMap((r) => (r.sourceMessageId ? [r.sourceMessageId] : [])),
    ...questions.flatMap((q) => [
      q.sourceMessageId,
      ...(q.resolutionMessageId ? [q.resolutionMessageId] : []),
    ]),
  ]);
  const artifacts = baseline
    ? getBaselineArtifacts(baseline).filter((a) =>
        feature.artifactIds.includes(a.id),
      )
    : [];
  const tests = baseline
    ? getBaselineTests(baseline).filter((t) =>
        t.requirementIds.some((r) => feature.requirementIds.includes(r)),
      )
    : [];
  return {
    feature,
    records,
    questions,
    sources: transcript.filter((m) => messageIds.has(m.id)),
    artifacts,
    tests,
    scopes: scopeItems.filter((s) => feature.scopeItemIds.includes(s.id)),
  };
}
export function selectPreviewTraceability(state: DemoState) {
  const features = featureEvidence.filter(
    (f) => f.id !== 'identity' && featureAvailable(state.pocBaseline, f.id),
  );
  const evidence = features.map((f) => selectFeatureEvidence(state, f.id));
  const requirementsMapped = evidence.filter((e) =>
    e.records.some((r) => r.type === 'functional'),
  ).length;
  const sourcesMapped = evidence.filter((e) => e.sources.length > 0).length;
  const artifactsMapped = evidence.filter(
    (e) =>
      e.artifacts.length > 0 &&
      e.artifacts.every(
        (a) => state.generation.artifactStatuses[a.id] === 'validated',
      ),
  ).length;
  const testsMapped = evidence.filter(
    (e) =>
      e.tests.length > 0 &&
      e.tests.every((t) => state.generation.testResults[t.id] === 'passed'),
  ).length;
  const complete = evidence.filter(
    (e) =>
      e.records.length > 0 &&
      e.sources.length > 0 &&
      e.artifacts.length > 0 &&
      e.artifacts.every(
        (a) => state.generation.artifactStatuses[a.id] === 'validated',
      ) &&
      e.tests.length > 0 &&
      e.tests.every((t) => state.generation.testResults[t.id] === 'passed'),
  ).length;
  return {
    total: features.length,
    requirementsMapped,
    sourcesMapped,
    artifactsMapped,
    testsMapped,
    complete,
    coverage: features.length
      ? Math.round((complete / features.length) * 100)
      : 0,
  };
}
export function selectPocRequests(state: DemoState) {
  const runtime = state.pocRuntime;
  const user = pocUsers.find((u) => u.id === runtime.userId)!;
  return runtime.requests.filter(
    (r) =>
      (user.role !== 'employee' || r.requesterId === user.id) &&
      (runtime.statusFilter === 'all' || r.status === runtime.statusFilter) &&
      (runtime.priorityFilter === 'all' ||
        r.priority === runtime.priorityFilter) &&
      `${r.id} ${r.title} ${r.description}`
        .toLowerCase()
        .includes(runtime.search.trim().toLowerCase()),
  );
}
export const selectPreviewReady = (state: DemoState) =>
  selectGenerationSummary(state).humanReviewReady;
// Phase 7 implements the core workflow and two demo dependencies. Extra override plans remain metadata only.
export function selectPreviewScopeGaps(state: DemoState) {
  return state.pocBaseline
    ? scopeItems.filter(
        (s) =>
          s.relevance === 'future' &&
          state.pocBaseline!.decisions[s.id]?.decision !== 'excluded',
      )
    : [];
}
