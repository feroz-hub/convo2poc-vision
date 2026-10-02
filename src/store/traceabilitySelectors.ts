import { featureEvidence } from '@/data/pocRuntime';
import { requirements, clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { successCriteria, scopeItems } from '@/data/scope';
import {
  engineeringArtifacts,
  engineeringTests,
  getBaselineArtifacts,
  getBaselineTests,
} from '@/data/generation';
import { featureAvailable } from '@/simulation/pocRuntime';
import {
  selectClarificationStatus,
  clarificationStatusLabels,
} from './clarificationSelectors';
import {
  selectIntelligenceStatus,
  intelligenceStatusLabels,
} from './requirementSelectors';
import { selectScopeDecision } from './scopeSelectors';
import { selectPreviewReady } from './previewSelectors';
import type { DemoState } from './demoStore';
import type {
  TraceChain,
  TraceRecord,
  TraceConnection,
} from '@/types/traceExplorer';

// Read-only projections of the shared catalogs. No graph-specific scenario text or tests.
export function selectTraceChain(
  state: DemoState,
  featureId: string,
): TraceChain {
  const f =
    featureEvidence.find(
      (feature) => feature.id === featureId && feature.id !== 'identity',
    ) ?? featureEvidence[2]!;
  const records = requirements.filter((r) => f.requirementIds.includes(r.id));
  const questions = clarifications.filter((q) =>
    f.clarificationIds.includes(q.id),
  );
  const sources = transcript.filter(
    (m) =>
      records.some((r) => r.sourceMessageId === m.id) ||
      questions.some(
        (q) => q.sourceMessageId === m.id || q.resolutionMessageId === m.id,
      ),
  );
  const scopes = scopeItems.filter((s) => f.scopeItemIds.includes(s.id));
  const criteria = successCriteria.filter(
    (c) =>
      c.requirementIds.some((id) => f.requirementIds.includes(id)) &&
      (!state.pocBaseline ||
        state.pocBaseline.successCriteriaIds.includes(c.id)),
  );
  const plannedArtifacts = state.pocBaseline
    ? getBaselineArtifacts(state.pocBaseline)
    : engineeringArtifacts;
  const outputs = plannedArtifacts.filter((a) => f.artifactIds.includes(a.id));
  const plannedTests = state.pocBaseline
    ? getBaselineTests(state.pocBaseline)
    : engineeringTests;
  const tests = plannedTests.filter((t) =>
    t.requirementIds.some((id) => f.requirementIds.includes(id)),
  );
  const nodes: TraceRecord[] = [];
  const edges: TraceConnection[] = [];
  const add = (
    kind: TraceRecord['kind'],
    id: string,
    label: string,
    description: string,
    status: string,
    lane: number,
  ) => {
    nodes.push({
      id: `${kind}:${id}`,
      canonicalId: id,
      kind,
      label,
      description,
      status,
      lane,
      featureId: f.id,
    });
  };
  const connect = (from: string, to: string, label: string) => {
    if (nodes.some((n) => n.id === from) && nodes.some((n) => n.id === to))
      edges.push({ id: `${from}->${to}`, source: from, target: to, label });
  };
  for (const m of sources)
    add(
      'conversation',
      m.id,
      `${m.speaker} · ${m.timestamp}`,
      m.text,
      state.visibleTranscriptMessageIds.includes(m.id)
        ? 'Captured'
        : 'Workshop record · not yet captured',
      0,
    );
  for (const q of questions)
    add(
      'clarification',
      q.id,
      q.question,
      q.reason,
      clarificationStatusLabels[selectClarificationStatus(state, q)],
      0,
    );
  for (const r of records)
    add(
      'requirement',
      r.id,
      r.title,
      r.description,
      intelligenceStatusLabels[selectIntelligenceStatus(state, r)],
      1,
    );
  for (const s of scopes)
    add(
      'scope',
      s.id,
      s.title,
      state.pocBaseline?.decisions[s.id]?.reason ??
        state.scopeOverrides[s.id]?.reason ??
        s.reason,
      `${selectScopeDecision(state, s)} · ${state.pocBaseline ? 'Locked' : 'Recommended'}`,
      2,
    );
  for (const c of criteria)
    add(
      'criterion',
      c.id,
      requirements.find((r) => r.id === c.requirementIds[0])!.title,
      c.requirementIds
        .map((id) => requirements.find((r) => r.id === id)!.description)
        .join(' '),
      state.pocBaseline ? 'Approved proof contract' : 'Proposed proof contract',
      2,
    );
  for (const a of outputs)
    add(
      'artifact',
      a.id,
      a.label,
      a.path,
      state.generation.artifactStatuses[a.id] ?? 'Planned · not generated',
      3,
    );
  add(
    'feature',
    f.id,
    f.label,
    'Interactive frontend simulation produced from the approved scope.',
    selectPreviewReady(state) && featureAvailable(state.pocBaseline, f.id)
      ? 'Available in POC v1'
      : 'Preview not ready',
    3,
  );
  for (const t of tests)
    add(
      'test',
      t.id,
      t.label,
      t.successCriterionId
        ? `Validates ${t.requirementIds.join(' · ')} · ${t.successCriterionId}`
        : `Dedicated requirement check · ${t.requirementIds.join(' · ')}`,
      state.generation.testResults[t.id] ?? 'Planned · not executed',
      4,
    );
  for (const q of questions) {
    connect(
      `conversation:${q.sourceMessageId}`,
      `clarification:${q.id}`,
      'Flags uncertainty',
    );
    connect(
      `conversation:${q.resolutionMessageId}`,
      `clarification:${q.id}`,
      'Provides client answer',
    );
    for (const id of q.affectedRequirementIds)
      connect(
        `clarification:${q.id}`,
        `requirement:${id}`,
        'Proposes reviewed resolution',
      );
  }
  for (const r of records) {
    if (r.sourceMessageId)
      connect(
        `conversation:${r.sourceMessageId}`,
        `requirement:${r.id}`,
        'Source evidence',
      );
    for (const s of scopes)
      if (s.requirementIds.includes(r.id) || r.type === 'business-rule')
        connect(`requirement:${r.id}`, `scope:${s.id}`, 'Informs scope');
  }
  for (const s of scopes) {
    for (const c of criteria)
      if (c.scopeItemIds.includes(s.id))
        connect(`scope:${s.id}`, `criterion:${c.id}`, 'Defines proof');
    for (const a of outputs)
      if (a.requirementIds.some((id) => s.requirementIds.includes(id)))
        connect(`scope:${s.id}`, `artifact:${a.id}`, 'Scopes implementation');
  }
  for (const c of criteria)
    for (const a of outputs)
      if (a.requirementIds.some((id) => c.requirementIds.includes(id)))
        connect(`criterion:${c.id}`, `artifact:${a.id}`, 'Demonstrated by');
  for (const a of outputs)
    connect(`artifact:${a.id}`, `feature:${f.id}`, 'Implements feature');
  for (const t of tests) {
    connect(`feature:${f.id}`, `test:${t.id}`, 'Mapped validation');
    for (const a of outputs)
      if (
        t.artifactIds
          ? t.artifactIds.includes(a.id)
          : a.requirementIds.some((id) => t.requirementIds.includes(id))
      )
        connect(`artifact:${a.id}`, `test:${t.id}`, 'Validates artifact');
  }
  const mappingGaps = [
    ...f.requirementIds
      .filter((id) => !records.some((r) => r.id === id))
      .map((id) => `Missing requirement ${id}`),
    ...f.artifactIds
      .filter((id) => !outputs.some((a) => a.id === id))
      .map((id) => `Missing scoped artifact ${id}`),
    ...f.scopeItemIds
      .filter((id) => !scopes.some((s) => s.id === id))
      .map((id) => `Missing scope ${id}`),
    ...f.clarificationIds
      .filter((id) => !questions.some((q) => q.id === id))
      .map((id) => `Missing clarification ${id}`),
    ...(sources.length ? [] : ['Missing source evidence']),
    ...(tests.length ? [] : ['No canonical test mapping']),
    ...tests.flatMap((t) =>
      (t.artifactIds ?? [])
        .filter((id) => !plannedArtifacts.some((a) => a.id === id))
        .map((id) => `Missing test artifact ${id}`),
    ),
  ];
  const sourceCaptured =
    sources.length > 0 &&
    sources.every((m) => state.visibleTranscriptMessageIds.includes(m.id));
  const issues = [
    ...mappingGaps,
    ...(!sourceCaptured ? ['Conversation capture pending'] : []),
    ...(!state.pocBaseline ? ['Baseline approval pending'] : []),
    ...(questions.some(
      (q) => selectClarificationStatus(state, q) !== 'confirmed',
    )
      ? ['Consultant clarification review pending']
      : []),
    ...(outputs.some(
      (a) => state.generation.artifactStatuses[a.id] !== 'validated',
    )
      ? ['Artifact validation pending']
      : []),
    ...(tests.some((t) => state.generation.testResults[t.id] !== 'passed')
      ? ['Test validation pending or failed']
      : []),
    ...(!selectPreviewReady(state) ? ['Working POC review not ready'] : []),
  ];
  return {
    featureId: f.id,
    label: f.label,
    nodes,
    edges,
    complete: issues.length === 0,
    sourceCaptured,
    issues,
    mappingGaps,
  };
}
export function selectTraceabilityModel(state: DemoState) {
  const features = featureEvidence.filter(
    (f) =>
      f.id !== 'identity' &&
      (!state.pocBaseline || featureAvailable(state.pocBaseline, f.id)),
  );
  const chains = features.map((f) => selectTraceChain(state, f.id));
  const coreRequirementIds = new Set(
    chains.flatMap((c) =>
      c.nodes.filter((n) => n.kind === 'requirement').map((n) => n.canonicalId),
    ),
  );
  const completedRequirementIds = new Set(
    chains
      .filter((c) => c.complete)
      .flatMap((c) =>
        c.nodes
          .filter((n) => n.kind === 'requirement')
          .map((n) => n.canonicalId),
      ),
  );
  const tests = state.pocBaseline
    ? getBaselineTests(state.pocBaseline)
    : engineeringTests;
  const mappedTests = tests.filter(
    (t) =>
      t.requirementIds.length > 0 &&
      t.requirementIds.every((id) => requirements.some((r) => r.id === id)) &&
      chains.some((c) =>
        c.nodes.some((n) => n.kind === 'test' && n.canonicalId === t.id),
      ),
  );
  const complete = chains.filter((c) => c.complete).length;
  return {
    chains,
    health: {
      requirements: completedRequirementIds.size,
      requirementsTotal: coreRequirementIds.size,
      features: complete,
      featuresTotal: chains.length,
      tests: mappedTests.length,
      testsTotal: tests.length,
      testsPassed: tests.filter(
        (t) => state.generation.testResults[t.id] === 'passed',
      ).length,
      sources: chains.filter((c) => c.sourceCaptured).length,
      unmapped: chains.reduce((sum, c) => sum + c.mappingGaps.length, 0),
      coverage: chains.length
        ? Math.round((100 * complete) / chains.length)
        : 0,
    },
  };
}
