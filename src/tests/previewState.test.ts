import { beforeEach, describe, expect, it } from 'vitest';
import { useDemoStore } from '@/store/demoStore';
import { preparePreview } from './previewFixtures';
import {
  selectFeatureEvidence,
  selectPocRequests,
  selectPreviewReady,
  selectPreviewTraceability,
} from '@/store/previewSelectors';
import { featureEvidence, pocReviewItems, pocUsers } from '@/data/pocRuntime';
import { requirements, clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { scopeItems } from '@/data/scope';
import { engineeringTests, getBaselineArtifacts } from '@/data/generation';
import { createPocRuntime } from '@/simulation/pocRuntime';
import type { PocAction, PocRole } from '@/types/pocRuntime';
const act = (action: PocAction) =>
  useDemoStore.getState().performPocAction(action);
const runtime = () => useDemoStore.getState().pocRuntime;
const selected = () =>
  runtime().requests.find((r) => r.id === runtime().selectedRequestId)!;
const role = (role: PocRole) => act({ type: 'role', role });
const select = (id = 'SR-1043') => act({ type: 'select-request', id });
describe('generated POC runtime and review governance', () => {
  beforeEach(() => useDemoStore.getState().reset());
  it('blocks runtime and approval before validated generation, including later review drift', () => {
    const initial = runtime();
    act({
      type: 'create',
      title: 'Blocked',
      description: 'x',
      category: 'IT Support',
      priority: 'P3',
    });
    expect(runtime()).toBe(initial);
    preparePreview();
    expect(selectPreviewReady(useDemoStore.getState())).toBe(true);
    useDemoStore.getState().reopenClarification('OQ-001');
    const before = runtime();
    act({ type: 'role', role: 'administrator' });
    expect(runtime()).toBe(before);
    expect(selectPreviewReady(useDemoStore.getState())).toBe(false);
  });
  it('uses isolated deterministic fictional fixtures with valid priority, users and history', () => {
    const first = createPocRuntime();
    expect(first).toEqual(createPocRuntime());
    expect(first.requests).toHaveLength(12);
    expect(
      first.requests.some(
        (r) => r.priority === 'P1' && r.status === 'awaiting-approval',
      ),
    ).toBe(true);
    expect(first.requests.some((r) => r.status === 'closed')).toBe(true);
    for (const r of first.requests) {
      expect(pocUsers.some((u) => u.id === r.requesterId)).toBe(true);
      if (r.assignedEngineerId)
        expect(pocUsers.find((u) => u.id === r.assignedEngineerId)?.role).toBe(
          'support-engineer',
        );
      expect(r.history.length).toBeGreaterThan(0);
      if (r.priority === 'P1' && r.status === 'in-progress')
        expect(r.approvalStatus).toBe('approved');
    }
    first.requests[0]!.title = 'Changed';
    expect(createPocRuntime().requests[0]!.title).not.toBe('Changed');
  });
  it('creates requests deterministically and applies P1-only manager approval', () => {
    preparePreview();
    for (const priority of ['P1', 'P2', 'P3', 'P4'] as const) {
      act({
        type: 'create',
        title: `Request ${priority}`,
        description: 'Synthetic',
        category: 'IT Support',
        priority,
      });
      expect(selected().approvalStatus).toBe(
        priority === 'P1' ? 'pending' : 'not-required',
      );
      expect(selected().status).toBe(
        priority === 'P1' ? 'awaiting-approval' : 'open',
      );
    }
    expect(runtime().sequence).toBe(4);
    expect(selected().id).toBe('SR-1056');
    expect(selected().history[0]?.timestamp).toBe('10:04');
    const count = runtime().requests.length;
    act({
      type: 'create',
      title: '  ',
      description: 'x',
      category: 'IT Support',
      priority: 'P3',
    });
    expect(runtime().requests).toHaveLength(count);
    role('manager');
    act({
      type: 'create',
      title: 'Disallowed',
      description: 'x',
      category: 'IT Support',
      priority: 'P3',
    });
    expect(runtime().requests).toHaveLength(count);
  });
  it.each(['employee', 'manager', 'support-engineer'] as const)(
    'rejects non-admin assignment directly as %s',
    (r) => {
      preparePreview();
      role(r);
      select();
      const before = selected();
      act({ type: 'assign', engineerId: 'user-engineer' });
      expect(selected()).toBe(before);
      expect(runtime().notice).toMatch(/Only administrators/);
    },
  );
  it('allows administrator assignment and reassignment with history but forbids closed editing', () => {
    preparePreview();
    role('administrator');
    select();
    act({ type: 'assign', engineerId: 'user-engineer' });
    expect(selected().assignedEngineerId).toBe('user-engineer');
    act({ type: 'assign', engineerId: 'user-engineer-2' });
    expect(selected().history.at(-1)?.text).toBe('Reassigned to Leena Das');
    act({ type: 'assign', engineerId: 'user-manager' });
    expect(selected().assignedEngineerId).toBe('user-engineer-2');
    select('SR-1044');
    const before = selected();
    act({ type: 'assign', engineerId: 'user-engineer' });
    expect(selected()).toBe(before);
    act({ type: 'note', text: 'Administrative follow-up' });
    expect(selected().history.at(-1)?.text).toBe(
      'Administrator note: Administrative follow-up',
    );
    expect(selected().status).toBe('closed');
  });
  it('allows only assigned engineers to follow Open → In Progress → Resolved → Closed', () => {
    preparePreview();
    role('administrator');
    select();
    act({ type: 'assign', engineerId: 'user-engineer' });
    role('support-engineer');
    select();
    for (const status of ['in-progress', 'resolved', 'closed']) {
      act({ type: 'progress' });
      expect(selected().status).toBe(status);
    }
    const closed = selected();
    act({ type: 'progress' });
    expect(selected()).toBe(closed);
    select('SR-1049');
    const unowned = selected();
    act({ type: 'progress' });
    expect(selected()).toBe(unowned);
    role('employee');
    select('SR-1044');
    const before = selected();
    act({ type: 'note', text: 'Not admin' });
    expect(selected()).toBe(before);
  });
  it('requires manager approval before P1 work and records approval or rejection', () => {
    preparePreview();
    role('administrator');
    select('SR-1041');
    act({ type: 'assign', engineerId: 'user-engineer' });
    role('support-engineer');
    select('SR-1041');
    act({ type: 'progress' });
    expect(selected().status).toBe('awaiting-approval');
    act({ type: 'approval', decision: 'approved' });
    expect(selected().approvalStatus).toBe('pending');
    role('manager');
    select('SR-1041');
    act({ type: 'approval', decision: 'approved' });
    expect(selected().status).toBe('open');
    role('support-engineer');
    select('SR-1041');
    act({ type: 'progress' });
    expect(selected().status).toBe('in-progress');
    role('manager');
    select('SR-1045');
    act({ type: 'approval', decision: 'rejected' });
    expect(selected().approvalStatus).toBe('rejected');
    expect(selected().history.at(-1)?.text).toBe('Manager rejected P1 request');
    select('SR-1042');
    const p2 = selected();
    act({ type: 'approval', decision: 'approved' });
    expect(selected()).toBe(p2);
  });
  it('keeps closed records searchable and employees limited to submitted requests', () => {
    preparePreview();
    act({ type: 'navigate', route: 'requests' });
    act({ type: 'filters', status: 'closed', search: 'Printer' });
    expect(selectPocRequests(useDemoStore.getState()).map((r) => r.id)).toEqual(
      ['SR-1044'],
    );
    act({ type: 'select-request', id: 'SR-1048' });
    expect(runtime().selectedRequestId).toBeNull();
    role('administrator');
    act({ type: 'filters', status: 'closed', priority: 'P4' });
    expect(selectPocRequests(useDemoStore.getState()).map((r) => r.id)).toEqual(
      ['SR-1044', 'SR-1048'],
    );
  });
  it('does not mutate canonical requirements, baseline, generation or engagement on runtime interaction/reset', () => {
    preparePreview();
    const state = useDemoStore.getState();
    const snapshot = JSON.stringify({
      requirements,
      clarifications,
      scopeItems,
    });
    act({
      type: 'create',
      title: 'Runtime only',
      description: 'x',
      category: 'Equipment',
      priority: 'P1',
    });
    role('administrator');
    act({ type: 'presentation', enabled: true });
    state.resetPocData();
    const now = useDemoStore.getState();
    expect(now.pocRuntime).toEqual(createPocRuntime());
    for (const key of [
      'pocBaseline',
      'generation',
      'visibleTranscriptMessageIds',
      'clarificationHistory',
      'scopeOverrides',
    ] as const)
      expect(now[key]).toBe(state[key]);
    expect(JSON.stringify({ requirements, clarifications, scopeItems })).toBe(
      snapshot,
    );
  });
  it('maps feature evidence to canonical requirements, transcript, scope, artifacts and Phase 6 tests', () => {
    preparePreview();
    const state = useDemoStore.getState();
    const artifacts = getBaselineArtifacts(state.pocBaseline!);
    for (const f of featureEvidence) {
      expect(
        f.requirementIds.every((id) => requirements.some((r) => r.id === id)),
      ).toBe(true);
      expect(
        f.scopeItemIds.every((id) => scopeItems.some((s) => s.id === id)),
      ).toBe(true);
      expect(
        f.artifactIds.every((id) => artifacts.some((a) => a.id === id)),
      ).toBe(true);
      expect(
        f.clarificationIds.every((id) =>
          clarifications.some((q) => q.id === id),
        ),
      ).toBe(true);
      const e = selectFeatureEvidence(state, f.id);
      expect(e.tests.every((t) => engineeringTests.some((c) => c === t))).toBe(
        true,
      );
      expect(
        e.sources.every((m) => transcript.some((source) => source === m)),
      ).toBe(true);
    }
    const p1 = selectFeatureEvidence(state, 'approval');
    expect(p1.records.map((r) => r.id)).toEqual(['FR-007', 'BR-001', 'BR-003']);
    expect(p1.questions[0]?.id).toBe('OQ-001');
    expect(p1.sources.map((m) => m.id)).toEqual(['msg-006', 'msg-008']);
    expect(p1.tests.map((t) => t.id)).toEqual(
      expect.arrayContaining(['TC-015', 'TC-017', 'TC-023']),
    );
  });
  it.each([
    ['requests', 'FR-002', 'TC-021', ['list-screen', 'list-api']],
    ['history', 'FR-005', 'TC-022', ['detail-screen', 'detail-api']],
  ] as const)(
    'provides dedicated canonical test evidence for %s',
    (feature, requirementId, testId, artifactIds) => {
      preparePreview();
      const state = useDemoStore.getState();
      const evidence = selectFeatureEvidence(state, feature);
      const test = evidence.tests.find((t) => t.id === testId)!;
      expect(test).toBe(engineeringTests.find((t) => t.id === testId));
      expect(test.requirementIds).toEqual([requirementId]);
      expect(test.artifactIds).toEqual(artifactIds);
      expect(test.successCriterionId).toBeUndefined();
      expect(state.generation.testResults[testId]).toBe('passed');
      expect(state.generation.artifactStatuses[testId]).toBe('validated');
      for (const id of artifactIds)
        expect(evidence.artifacts.some((a) => a.id === id)).toBe(true);
    },
  );
  it('derives complete core-feature chains and reduces coverage when validation fails', () => {
    preparePreview();
    const state = useDemoStore.getState();
    for (const feature of featureEvidence.filter((f) => f.id !== 'identity')) {
      const evidence = selectFeatureEvidence(state, feature.id);
      expect(evidence.records.length).toBeGreaterThan(0);
      expect(evidence.sources.length).toBeGreaterThan(0);
      expect(evidence.artifacts.length).toBeGreaterThan(0);
      expect(evidence.tests.length).toBeGreaterThan(0);
      expect(
        evidence.artifacts.every(
          (a) => state.generation.artifactStatuses[a.id] === 'validated',
        ),
      ).toBe(true);
      expect(
        evidence.tests.every(
          (t) => state.generation.testResults[t.id] === 'passed',
        ),
      ).toBe(true);
    }
    expect(selectPreviewTraceability(useDemoStore.getState())).toEqual({
      total: 8,
      requirementsMapped: 8,
      sourcesMapped: 8,
      artifactsMapped: 8,
      testsMapped: 8,
      complete: 8,
      coverage: 100,
    });
    useDemoStore.setState((s) => ({
      generation: {
        ...s.generation,
        testResults: { ...s.generation.testResults, 'TC-001': 'failed' },
      },
    }));
    expect(selectPreviewTraceability(useDemoStore.getState()).coverage).toBe(
      88,
    );
    expect(selectPreviewReady(useDemoStore.getState())).toBe(false);
  });
  it.each(['TC-021', 'TC-022'])(
    'reduces calculated coverage when %s evidence is missing',
    (id) => {
      preparePreview();
      const state = useDemoStore.getState();
      const testResults = { ...state.generation.testResults };
      delete testResults[id];
      useDemoStore.setState({
        generation: { ...state.generation, testResults },
      });
      expect(selectPreviewTraceability(useDemoStore.getState()).coverage).toBe(
        88,
      );
      expect(selectPreviewReady(useDemoStore.getState())).toBe(false);
    },
  );
  it('requires all five explicit checks before internal consultant approval and resets on generation restart', () => {
    preparePreview();
    act({ type: 'approve-review' });
    expect(runtime().approval).toBeNull();
    for (const i of pocReviewItems.slice(0, -1))
      act({ type: 'review', key: i.key, checked: true });
    act({ type: 'approve-review' });
    expect(runtime().approval).toBeNull();
    act({ type: 'review', key: 'content', checked: true });
    act({ type: 'approve-review' });
    expect(runtime().approval).toEqual({
      baselineId: 'RB-001',
      approvedBy: 'Consultant',
      approvedAt: '10:01',
    });
    act({ type: 'review', key: 'content', checked: false });
    expect(runtime().reviews.content).toBe(true);
    useDemoStore.getState().restartGeneration();
    expect(runtime()).toEqual(createPocRuntime());
    expect(selectPreviewReady(useDemoStore.getState())).toBe(false);
  });
  it('respects approved exclusions and blocks demo approval for additional metadata-only scope', () => {
    preparePreview();
    const state = useDemoStore.getState();
    useDemoStore.setState({
      pocBaseline: {
        ...state.pocBaseline!,
        decisions: {
          ...state.pocBaseline!.decisions,
          'scope-FR-002': { decision: 'excluded', reason: 'Deferred' },
          'scope-email': { decision: 'mocked', reason: 'Override' },
        },
      },
    });
    const scoped = useDemoStore.getState();
    useDemoStore.setState({
      generation: {
        ...scoped.generation,
        artifactStatuses: Object.fromEntries(
          getBaselineArtifacts(scoped.pocBaseline!).map((a) => [
            a.id,
            'validated' as const,
          ]),
        ),
      },
    });
    expect(selectPreviewReady(useDemoStore.getState())).toBe(true);
    act({ type: 'navigate', route: 'requests' });
    expect(runtime().route).toBe('dashboard');
    for (const item of pocReviewItems)
      act({ type: 'review', key: item.key, checked: true });
    act({ type: 'approve-review' });
    expect(runtime().approval).toBeNull();
  });
});
