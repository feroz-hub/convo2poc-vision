import { getEvidenceCaptureReadiness } from '@/simulation/clarificationReadiness';
import { beforeEach, describe, expect, it } from 'vitest';
import { useDemoStore } from '@/store/demoStore';
import { clarifications, requirements } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { calculateLiveReadiness } from '@/simulation/readiness';
import {
  selectClarificationQueue,
  selectClarificationStatus,
  selectClarificationSummary,
  selectGovernedRequirementIds,
  selectResolutionReadiness,
} from '@/store/clarificationSelectors';
const priority = clarifications[0]!;
beforeEach(() => useDemoStore.getState().reset());
describe('clarification governance state', () => {
  it('derives the canonical priority capture uplift without mutating playback', () => {
    expect(getEvidenceCaptureReadiness(priority)).toEqual({
      before: 56,
      after: 71,
      delta: 15,
    });
    expect(useDemoStore.getState().elapsedMs).toBe(0);
    expect(useDemoStore.getState().visibleTranscriptMessageIds).toEqual([]);
  });
  it('starts with canonical open questions and no consultant approvals', () => {
    const state = useDemoStore.getState();
    expect(selectClarificationSummary(state)).toEqual({
      open: 3,
      resolved: 0,
      needsReview: 0,
      affected: 5,
      readiness: 0,
    });
    expect(state.selectedClarificationId).toBe('OQ-001');
    expect(state.reviewedEvidenceIds).toEqual([]);
    expect(state.clarificationHistory).toEqual([]);
  });
  it('captures live answers without silently approving consultant review', () => {
    const store = useDemoStore.getState();
    store.start();
    store.tick(80000);
    expect(selectClarificationSummary(useDemoStore.getState())).toEqual({
      open: 0,
      resolved: 0,
      needsReview: 3,
      affected: 5,
      readiness: 90,
    });
    expect(selectClarificationStatus(useDemoStore.getState(), priority)).toBe(
      'evidence-captured',
    );
    expect(useDemoStore.getState().resolvedClarificationIds).toEqual([]);
  });
  it('gates approval on evidence review and derives outputs and readiness from shared state', () => {
    const actions = useDemoStore.getState();
    actions.start();
    actions.tick(80000);
    actions.acceptClarificationResolution(priority.id);
    expect(useDemoStore.getState().resolvedClarificationIds).toEqual([]);
    actions.reviewClarificationEvidence(priority.id);
    expect(selectClarificationStatus(useDemoStore.getState(), priority)).toBe(
      'needs-review',
    );
    expect(
      selectResolutionReadiness(useDemoStore.getState(), priority.id),
    ).toEqual({ before: 90, after: 93, delta: 3 });
    actions.acceptClarificationResolution(priority.id);
    expect(selectClarificationStatus(useDemoStore.getState(), priority)).toBe(
      'confirmed',
    );
    expect(selectGovernedRequirementIds(useDemoStore.getState())).toEqual(
      expect.arrayContaining(['FR-007', 'BR-001', 'BR-003']),
    );
    expect(useDemoStore.getState().liveReadiness).toBe(
      calculateLiveReadiness(useDemoStore.getState()),
    );
    expect(useDemoStore.getState().liveReadiness).toBe(93);
    expect(useDemoStore.getState().scopeApproved).toBe(false);
    expect(useDemoStore.getState().baselineVersion).toBeNull();
    actions.acceptClarificationResolution(priority.id);
    expect(
      useDemoStore.getState().clarificationHistory.map((h) => h.action),
    ).toEqual(['evidence-reviewed', 'confirmed']);
  });
  it('rejects and reopens deterministically while retaining transcript confirmations and history', () => {
    const actions = useDemoStore.getState();
    actions.start();
    actions.tick(80000);
    actions.reviewClarificationEvidence(priority.id);
    actions.rejectClarificationResolution(priority.id);
    expect(selectClarificationStatus(useDemoStore.getState(), priority)).toBe(
      'open',
    );
    actions.acceptClarificationResolution(priority.id);
    expect(useDemoStore.getState().resolvedClarificationIds).toEqual([]);
    actions.reviewClarificationEvidence(priority.id);
    actions.acceptClarificationResolution(priority.id);
    actions.reopenClarification(priority.id);
    const state = useDemoStore.getState();
    expect(state.liveReadiness).toBe(90);
    expect(state.confirmedRequirementIds).toEqual(
      expect.arrayContaining(['FR-007', 'BR-001']),
    );
    expect(selectGovernedRequirementIds(state)).not.toContain('BR-003');
    expect(selectClarificationStatus(state, priority)).toBe('open');
    expect(state.clarificationHistory.map((h) => h.sequence)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(state.clarificationHistory.every((h) => h.elapsedMs === 80000)).toBe(
      true,
    );
  });
  it('filters mutually exclusive queue states and reaches 100 only after all reviews', () => {
    const actions = useDemoStore.getState();
    actions.start();
    actions.tick(80000);
    actions.setClarificationFilter('open');
    expect(selectClarificationQueue(useDemoStore.getState())).toHaveLength(0);
    actions.setClarificationFilter('needs-review');
    expect(selectClarificationQueue(useDemoStore.getState())).toHaveLength(3);
    for (const q of clarifications) {
      actions.reviewClarificationEvidence(q.id);
      actions.acceptClarificationResolution(q.id);
    }
    actions.setClarificationFilter('resolved');
    expect(selectClarificationQueue(useDemoStore.getState())).toHaveLength(3);
    expect(useDemoStore.getState().liveReadiness).toBe(100);
  });
  it('keeps approved questions closed when subsequently encountered in live playback', () => {
    const actions = useDemoStore.getState();
    actions.reviewClarificationEvidence(priority.id);
    actions.acceptClarificationResolution(priority.id);
    actions.start();
    actions.tick(80000);
    expect(useDemoStore.getState().openClarificationIds).not.toContain(
      priority.id,
    );
    expect(useDemoStore.getState().detectedRequirementIds).not.toContain(
      priority.id,
    );
    expect(useDemoStore.getState().liveReadiness).toBe(93);
  });
  it('keeps question edits local, ignores invalid IDs, and resets the complete review state', () => {
    const before = JSON.stringify(clarifications);
    const actions = useDemoStore.getState();
    actions.editClarificationQuestion(
      priority.id,
      'Which priority needs approval?',
    );
    actions.acceptClarificationSuggestion(priority.id);
    actions.selectClarification('OQ-002');
    actions.setClarificationFilter('needs-review');
    actions.reviewClarificationEvidence('invalid');
    actions.selectClarification('invalid');
    expect(useDemoStore.getState().selectedClarificationId).toBe('OQ-002');
    expect(useDemoStore.getState().reviewedEvidenceIds).toEqual([]);
    expect(JSON.stringify(clarifications)).toBe(before);
    actions.reset();
    expect(useDemoStore.getState().editedClarificationQuestions).toEqual({});
    expect(useDemoStore.getState().acceptedSuggestionIds).toEqual([]);
    expect(useDemoStore.getState().clarificationHistory).toEqual([]);
    expect(useDemoStore.getState().clarificationFilter).toBe('all');
    expect(useDemoStore.getState().selectedClarificationId).toBe(priority.id);
  });
  it('links every canonical source, answer and proposed update without copying transcript content', () => {
    for (const q of clarifications) {
      expect(transcript.some((m) => m.id === q.sourceMessageId)).toBe(true);
      expect(transcript.find((m) => m.id === q.resolutionMessageId)?.role).toBe(
        'client',
      );
      for (const id of q.affectedRequirementIds)
        expect(requirements.some((r) => r.id === id)).toBe(true);
    }
  });
});
