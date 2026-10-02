import { beforeEach, describe, expect, it } from 'vitest';
import { useDemoStore } from '@/store/demoStore';
import {
  prepareFeedback,
  analyzeFeedback,
  approveFeedback,
  prepareV2,
} from './feedbackFixtures';
import {
  selectChangeImpact,
  selectChangeTrace,
  selectDeltaAgents,
  selectV2Ready,
} from '@/store/feedbackSelectors';
import {
  feedbackMessages,
  feedbackReviews,
  requirementRevisions,
} from '@/data/feedbackEvolution';
import { transcript } from '@/data/transcript';
import { requirements } from '@/data/requirements';
import { changeRequests } from '@/data/feedback';
import { getBaselineArtifacts, getBaselineTests } from '@/data/generation';
import { pocUsers } from '@/data/pocRuntime';
describe('governed feedback and versioned evolution', () => {
  beforeEach(() => useDemoStore.getState().reset());
  it('keeps review feedback distinct from discovery and uses the canonical change', () => {
    expect(
      transcript.some((m) => feedbackMessages.some((f) => f.id === m.id)),
    ).toBe(false);
    expect(changeRequests[0]!.sourceMessageId).toBe(feedbackMessages[1].id);
    expect(feedbackMessages[1].text).toContain('P2 requests');
    expect(requirementRevisions.map((r) => r.requirementId)).toEqual([
      'FR-007',
      'BR-003',
    ]);
  });
  it('requires validated v1 and consultant demo approval before feedback starts', () => {
    useDemoStore.getState().startFeedback();
    expect(useDemoStore.getState().feedback.capture.status).toBe('idle');
  });
  it('reveals in order, pauses, resumes and stops for approval without creating RB-002', () => {
    prepareFeedback();
    const a = useDemoStore.getState();
    a.startFeedback();
    a.tick(5000);
    expect(useDemoStore.getState().feedback.status).toBe('waiting');
    a.feedbackPlayback('next');
    expect(useDemoStore.getState().feedback.status).toBe('detected');
    a.feedbackPlayback('pause');
    const at = useDemoStore.getState().feedback.capture.elapsedMs;
    a.tick(5000);
    expect(useDemoStore.getState().feedback.capture.elapsedMs).toBe(at);
    a.feedbackPlayback('resume');
    a.tick(20000);
    expect(useDemoStore.getState().feedback.status).toBe('analyzed');
    expect(useDemoStore.getState().feedback.baseline).toBeNull();
    expect(useDemoStore.getState().feedback.capture.status).toBe('completed');
  });
  it('derives affected artifacts from policy consumers and reuses architecture and data', () => {
    const s = analyzeFeedback(),
      i = selectChangeImpact(s);
    expect(i.modified.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        'approval-api',
        'approval-screen',
        'create-api',
        'status-api',
        'detail-screen',
      ]),
    );
    expect(i.reused.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        'architecture',
        'data-model',
        'schema',
        'list-api',
        'assignment-api',
        'dashboard-screen',
        'search-api',
      ]),
    );
    expect(i.modified.length + i.reused.length).toBe(i.allArtifacts.length);
    expect(i.businessRules).toHaveLength(1);
    expect(i.scopeItemIds).toEqual(['scope-FR-007']);
    expect(i.architectureChanges).toHaveLength(0);
    expect(i.unchangedFeatures.map((f) => f.id)).toContain('assignment');
  });
  it('cannot approve without every review; freezes RB-002 lineage and retains scope and originals', () => {
    const s = analyzeFeedback(),
      original = JSON.stringify(s.pocBaseline),
      catalog = JSON.stringify(requirements);
    s.decideChange('approve');
    expect(useDemoStore.getState().feedback.baseline).toBeNull();
    feedbackReviews.forEach((r) => s.reviewChange(r.key, true));
    s.decideChange('approve');
    const next = useDemoStore.getState();
    expect(next.feedback.baseline).toMatchObject({
      id: 'RB-002',
      version: 'v2',
      changeRequestId: 'CR-001',
      parentBaselineId: 'RB-001',
      criterionRevisionId: 'REV-SC-004-v2',
    });
    expect(next.feedback.baseline?.decisions).toEqual(s.pocBaseline?.decisions);
    expect(next.feedback.baseline?.decisions['scope-FR-007']?.decision).toBe(
      'included',
    );
    expect(JSON.stringify(next.pocBaseline)).toBe(original);
    expect(JSON.stringify(requirements)).toBe(catalog);
    expect(requirements.find((r) => r.id === 'BR-001')?.description).toBe(
      'Valid priorities are P1, P2, P3, and P4.',
    );
    expect(Object.isFrozen(next.feedback.baseline)).toBe(true);
    expect(next.feedback.delta.status).toBe('idle');
  });
  it.each(['reject', 'clarify'] as const)(
    '%s preserves RB-001 and blocks progression',
    (decision) => {
      const s = analyzeFeedback();
      s.decideChange(decision);
      s.startDelta();
      s.decideChange('approve');
      expect(useDemoStore.getState().feedback.baseline).toBeNull();
      expect(useDemoStore.getState().feedback.status).toBe(
        decision === 'reject' ? 'rejected' : 'needs-clarification',
      );
      expect(useDemoStore.getState().pocBaseline?.id).toBe('RB-001');
    },
  );
  it('does not auto-start regeneration and supports pause, resume, deterministic next and restart', () => {
    const a = approveFeedback();
    a.tick(90000);
    expect(useDemoStore.getState().feedback.delta.status).toBe('idle');
    a.startDelta();
    a.tick(8000);
    expect(
      selectDeltaAgents(useDemoStore.getState()).find((a) => a.id === 'backend')
        ?.status,
    ).toBe('running');
    a.deltaPlayback('pause');
    a.tick(10000);
    expect(useDemoStore.getState().feedback.delta.elapsedMs).toBe(8000);
    a.deltaPlayback('next');
    expect(useDemoStore.getState().feedback.delta.elapsedMs).toBe(14000);
    a.deltaPlayback('resume');
    a.tick(32000);
    expect(selectV2Ready(useDemoStore.getState())).toBe(true);
    a.deltaPlayback('restart');
    expect(useDemoStore.getState().feedback.delta.status).toBe('idle');
    expect(useDemoStore.getState().feedback.baseline?.id).toBe('RB-002');
    expect(useDemoStore.getState().feedback.v2Runtime).toBeNull();
  });
  it('preserves v1 test evidence and supersedes only the v2 expectation', () => {
    const s = prepareV2(),
      impact = selectChangeImpact(s);
    expect(s.generation.testResults['TC-023']).toBe('passed');
    expect(
      getBaselineTests(s.pocBaseline!).find((t) => t.id === 'TC-023')?.label,
    ).toContain('does not');
    expect(impact.v2Tests.find((t) => t.id === 'TC-016')).toMatchObject({
      baselineId: 'RB-002',
      supersedesTestId: 'TC-023',
      changeRequestId: 'CR-001',
    });
    expect(impact.v2Tests.some((t) => t.id === 'TC-023')).toBe(false);
    expect(s.feedback.delta.testResults['TC-016']).toBe('passed');
    expect(
      getBaselineArtifacts(s.feedback.baseline!).some((a) => a.id === 'TC-016'),
    ).toBe(true);
    expect(
      getBaselineArtifacts(s.feedback.baseline!).some((a) => a.id === 'TC-023'),
    ).toBe(false);
    expect(selectChangeTrace(s)).toMatchObject({
      complete: true,
      coverage: 100,
    });
    expect(
      selectDeltaAgents(s).find((a) => a.id === 'architecture')?.status,
    ).toBe('reused');
    expect(selectDeltaAgents(s).find((a) => a.id === 'data')?.status).toBe(
      'reused',
    );
  });
  it('keeps v1/v2 runtimes isolated and applies P2 approval plus engineer guards only in v2', () => {
    const s = prepareV2(),
      a = useDemoStore.getState(),
      v1 = JSON.stringify(s.pocRuntime);
    a.selectPocVersion('v2');
    a.performPocAction({
      type: 'create',
      title: 'P2 version test',
      description: 'Demo policy',
      category: 'IT Support',
      priority: 'P2',
    });
    let next = useDemoStore.getState();
    let r = next.feedback.v2Runtime!.requests[0]!;
    expect(r.approvalStatus).toBe('pending');
    expect(r.status).toBe('awaiting-approval');
    expect(JSON.stringify(next.pocRuntime)).toBe(v1);
    a.performPocAction({ type: 'role', role: 'administrator' });
    a.performPocAction({ type: 'select-request', id: r.id });
    a.performPocAction({
      type: 'assign',
      engineerId: pocUsers.find((u) => u.role === 'support-engineer')!.id,
    });
    a.performPocAction({ type: 'role', role: 'support-engineer' });
    a.performPocAction({ type: 'select-request', id: r.id });
    a.performPocAction({ type: 'progress' });
    expect(
      useDemoStore
        .getState()
        .feedback.v2Runtime!.requests.find((q) => q.id === r.id)?.status,
    ).toBe('awaiting-approval');
    a.performPocAction({ type: 'role', role: 'manager' });
    a.performPocAction({ type: 'select-request', id: r.id });
    a.performPocAction({ type: 'approval', decision: 'approved' });
    expect(
      useDemoStore
        .getState()
        .feedback.v2Runtime!.requests.find((q) => q.id === r.id)
        ?.approvalStatus,
    ).toBe('approved');
    a.selectPocVersion('v1');
    a.performPocAction({ type: 'role', role: 'employee' });
    a.performPocAction({
      type: 'create',
      title: 'P2 original',
      description: 'Original policy',
      category: 'IT Support',
      priority: 'P2',
    });
    next = useDemoStore.getState();
    r = next.pocRuntime.requests[0]!;
    expect(r.approvalStatus).toBe('not-required');
    expect(
      next.feedback.v2Runtime!.requests.find(
        (q) => q.title === 'P2 version test',
      )?.approvalStatus,
    ).toBe('approved');
  });
  it('withdraws v2 access and traceability when mapped validation is missing', () => {
    const s = prepareV2();
    const missing = {
      ...s,
      feedback: {
        ...s.feedback,
        delta: {
          ...s.feedback.delta,
          testResults: {
            ...s.feedback.delta.testResults,
            'TC-016': 'failed' as const,
          },
        },
      },
    };
    expect(selectV2Ready(missing)).toBe(false);
    expect(selectChangeTrace(missing).coverage).toBeLessThan(100);
  });
  it('withdraws v2 access on original clarification governance drift', () => {
    prepareV2();
    useDemoStore.getState().reopenClarification('OQ-001');
    expect(selectV2Ready(useDemoStore.getState())).toBe(false);
    expect(useDemoStore.getState().feedback.baseline?.id).toBe('RB-002');
  });
  it('preserves closed historical P2 records and appends v2 events chronologically', () => {
    const s = prepareV2();
    const closed = s.feedback.v2Runtime!.requests.filter(
      (r) => r.priority === 'P2' && r.status === 'closed',
    );
    expect(closed.length).toBeGreaterThan(0);
    expect(closed.every((r) => r.approvalStatus === 'not-required')).toBe(true);
    s.selectPocVersion('v2');
    s.performPocAction({ type: 'role', role: 'manager' });
    const request = s.feedback.v2Runtime!.requests.find(
      (r) => r.priority === 'P2' && r.approvalStatus === 'pending',
    )!;
    s.performPocAction({ type: 'select-request', id: request.id });
    s.performPocAction({ type: 'approval', decision: 'approved' });
    const times = useDemoStore
      .getState()
      .feedback.v2Runtime!.requests.find((r) => r.id === request.id)!
      .history.map((h) => h.timestamp);
    expect(times).toEqual([...times].sort());
    expect(times.at(-1)).toBe('11:33');
  });
  it('restarts feedback without changing earlier phases and full reset restores canonical state', () => {
    const s = prepareV2(),
      preserved = JSON.stringify({
        baseline: s.pocBaseline,
        generation: s.generation,
        runtime: s.pocRuntime,
        source: s.visibleTranscriptMessageIds,
      });
    s.restartFeedback();
    const next = useDemoStore.getState();
    expect(
      JSON.stringify({
        baseline: next.pocBaseline,
        generation: next.generation,
        runtime: next.pocRuntime,
        source: next.visibleTranscriptMessageIds,
      }),
    ).toBe(preserved);
    expect(next.feedback.baseline).toBeNull();
    expect(next.approvedChangeIds).toEqual([]);
    expect(next.currentPocVersion).toBe('v1');
    next.reset();
    expect(useDemoStore.getState().pocBaseline).toBeNull();
    expect(useDemoStore.getState().feedback.capture.status).toBe('idle');
  });
});
