import { create } from 'zustand';
import type { FeedbackRuntime, ReviewKey } from '@/types/feedback';
import {
  createFeedbackRuntime,
  createV2Runtime,
  advanceFeedback,
  advanceDelta,
} from '@/simulation/feedbackEngine';
import {
  selectFeedbackReviewComplete,
  selectV2Ready,
} from './feedbackSelectors';
import {
  requirementRevisions,
  criterionRevision,
  feedbackMilestones,
  deltaMilestones,
} from '@/data/feedbackEvolution';
import { featureEvidence } from '@/data/pocRuntime';
import type { TraceView } from '@/types/traceExplorer';
import { createPocRuntime, applyPocAction } from '@/simulation/pocRuntime';
import { selectPreviewReady, selectPreviewScopeGaps } from './previewSelectors';
import type { PocRuntime, PocAction } from '@/types/pocRuntime';
import { scopeItems, successCriteria } from '@/data/scope';
import { canApproveScope } from './scopeSelectors';
import { selectGovernedRequirementIds } from './clarificationSelectors';
import { requirements, clarifications } from '@/data/requirements';
import { calculateLiveReadiness } from '@/simulation/readiness';
import {
  advanceGeneration,
  createEngineeringState,
} from '@/simulation/generationEngine';
import { generationEvents } from '@/simulation/generationEvents';
import { selectGenerationReadiness } from './scopeSelectors';
import type {
  Actor,
  TranscriptMessage,
  AgentStatus,
  BuildCheck,
  PocVersion,
  ClarificationFilter,
  ClarificationHistoryEntry,
  ScopeDecision,
  ScopeOverride,
  ScopeReviewKey,
  PocBaseline,
  RequirementView,
  GenerationRuntime,
} from '@/types/domain';
import type { DemoStage } from '@/simulation/stages';
import { advanceSession } from '@/simulation/demoEngine';
import { sessionEvents } from '@/simulation/sessionEvents';
export interface DemoState {
  feedback: FeedbackRuntime;
  traceView: TraceView;
  pocRuntime: PocRuntime;
  generation: GenerationRuntime;
  requirementView: RequirementView;
  selectedScopeItemId: string;
  scopeOverrides: Record<string, ScopeOverride>;
  scopeReviews: Record<ScopeReviewKey, boolean>;
  pocBaseline: PocBaseline | null;
  selectedClarificationId: string;
  clarificationFilter: ClarificationFilter;
  editedClarificationQuestions: Record<string, string>;
  acceptedSuggestionIds: string[];
  reviewedEvidenceIds: string[];
  rejectedResolutionIds: string[];
  reopenedClarificationIds: string[];
  clarificationHistory: ClarificationHistoryEntry[];
  visibleInsightEventIds: string[];
  detectedActorIds: Actor[];
  detectedAssumptionIds: string[];
  confirmedRequirementIds: string[];
  activeSpeaker: TranscriptMessage['role'] | null;
  currentTranscriptPosition: number;
  speakerUntilMs: number;
  liveReadiness: number;
  eventCursor: number;
  sessionComplete: boolean;
  isRunning: boolean;
  isPaused: boolean;
  elapsedMs: number;
  currentStage: DemoStage;
  visibleTranscriptMessageIds: string[];
  detectedRequirementIds: string[];
  openClarificationIds: string[];
  resolvedClarificationIds: string[];
  scopeApproved: boolean;
  baselineVersion: 'RB-001' | 'RB-002' | null;
  agentStatuses: AgentStatus[];
  buildChecks: BuildCheck[];
  currentPocVersion: PocVersion;
  approvedChangeIds: string[];
  demoSpeed: number;
}
export const createInitialDemoState = (): DemoState => ({
  feedback: createFeedbackRuntime(),
  traceView: {
    workflow: 'overview',
    selectedId: null,
    search: '',
    filter: 'all',
  },
  pocRuntime: createPocRuntime(),
  requirementView: {
    selectedId: 'FR-007',
    type: 'all',
    status: 'all',
    actor: null,
    search: '',
  },
  selectedScopeItemId: 'scope-FR-007',
  scopeOverrides: {},
  scopeReviews: {
    requirements: false,
    assumptions: false,
    scope: false,
    successCriteria: false,
  },
  pocBaseline: null,
  selectedClarificationId: 'OQ-001',
  clarificationFilter: 'all',
  editedClarificationQuestions: {},
  acceptedSuggestionIds: [],
  reviewedEvidenceIds: [],
  rejectedResolutionIds: [],
  reopenedClarificationIds: [],
  clarificationHistory: [],
  visibleInsightEventIds: [],
  detectedActorIds: [],
  detectedAssumptionIds: [],
  confirmedRequirementIds: [],
  activeSpeaker: null,
  currentTranscriptPosition: -1,
  speakerUntilMs: 0,
  liveReadiness: 0,
  eventCursor: 0,
  sessionComplete: false,
  isRunning: false,
  isPaused: false,
  elapsedMs: 0,
  currentStage: 'conversation',
  visibleTranscriptMessageIds: [],
  detectedRequirementIds: [],
  openClarificationIds: [],
  resolvedClarificationIds: [],
  scopeApproved: false,
  baselineVersion: null,
  ...createEngineeringState(),
  currentPocVersion: 'v1',
  approvedChangeIds: [],
  demoSpeed: 1,
});
interface DemoActions {
  startFeedback: () => void;
  feedbackPlayback: (action: 'pause' | 'resume' | 'next') => void;
  reviewChange: (key: ReviewKey, checked: boolean) => void;
  decideChange: (decision: 'approve' | 'reject' | 'clarify') => void;
  selectImpact: (id: string) => void;
  restartFeedback: () => void;
  startDelta: () => void;
  deltaPlayback: (action: 'pause' | 'resume' | 'next' | 'restart') => void;
  selectPocVersion: (version: PocVersion) => void;
  setTraceView: (view: Partial<TraceView>) => void;
  performPocAction: (action: PocAction) => void;
  resetPocData: () => void;
  startGeneration: () => void;
  pauseGeneration: () => void;
  resumeGeneration: () => void;
  nextGenerationEvent: () => void;
  restartGeneration: () => void;
  selectGenerationAgent: (id: string) => void;
  selectGenerationArtifact: (id: string | null) => void;
  setRequirementView: (view: Partial<RequirementView>) => void;
  selectScopeItem: (id: string) => void;
  setScopeDecision: (
    id: string,
    decision: ScopeDecision,
    reason?: string,
  ) => void;
  resetScopeRecommendation: (id: string) => void;
  setScopeReview: (key: ScopeReviewKey, reviewed: boolean) => void;
  approveScope: () => void;
  selectClarification: (id: string) => void;
  setClarificationFilter: (filter: ClarificationFilter) => void;
  editClarificationQuestion: (id: string, question: string) => void;
  acceptClarificationSuggestion: (id: string) => void;
  reviewClarificationEvidence: (id: string) => void;
  acceptClarificationResolution: (id: string) => void;
  rejectClarificationResolution: (id: string) => void;
  reopenClarification: (id: string) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  nextEvent: () => void;
  tick: (deltaMs: number) => void;
  reset: () => void;
  setDemoSpeed: (speed: number) => void;
}
const validClarification = (id: string) =>
  clarifications.some((q) => q.id === id);
const addId = (ids: string[], id: string) =>
  ids.includes(id) ? ids : [...ids, id];
const without = (ids: string[], id: string) =>
  ids.filter((value) => value !== id);
const history = (
  state: DemoState,
  id: string,
  action: ClarificationHistoryEntry['action'],
) => [
  ...state.clarificationHistory,
  {
    clarificationId: id,
    action,
    elapsedMs: state.elapsedMs,
    sequence: state.clarificationHistory.length + 1,
  },
];
export const useDemoStore = create<DemoState & DemoActions>()((set, get) => ({
  ...createInitialDemoState(),
  startFeedback: () => {
    const s = get();
    if (
      !selectPreviewReady(s) ||
      !s.pocRuntime.approval ||
      s.feedback.status !== 'waiting' ||
      s.feedback.capture.status !== 'idle'
    )
      return;
    set({
      feedback: { ...s.feedback, capture: { status: 'running', elapsedMs: 0 } },
    });
  },
  feedbackPlayback: (action) => {
    const s = get(),
      f = s.feedback;
    if (
      !selectPreviewReady(s) ||
      !s.pocRuntime.approval ||
      f.capture.status === 'idle' ||
      f.capture.status === 'completed'
    )
      return;
    if (action === 'next') {
      const next = feedbackMilestones.find((e) => e.at > f.capture.elapsedMs);
      if (next) set({ feedback: advanceFeedback(s, next.at) });
    } else if (
      (action === 'pause' && f.capture.status === 'running') ||
      (action === 'resume' && f.capture.status === 'paused')
    )
      set({
        feedback: {
          ...f,
          capture: {
            ...f.capture,
            status: action === 'pause' ? 'paused' : 'running',
          },
        },
      });
  },
  reviewChange: (key, checked) => {
    const s = get();
    if (s.feedback.status === 'analyzed')
      set({
        feedback: {
          ...s.feedback,
          reviews: { ...s.feedback.reviews, [key]: checked },
        },
      });
  },
  decideChange: (decision) => {
    const s = get(),
      f = s.feedback;
    if (
      f.status !== 'analyzed' ||
      !s.pocBaseline ||
      !selectPreviewReady(s) ||
      !s.pocRuntime.approval
    )
      return;
    if (decision !== 'approve') {
      set({
        feedback: {
          ...f,
          status: decision === 'reject' ? 'rejected' : 'needs-clarification',
        },
      });
      return;
    }
    if (
      !selectFeedbackReviewComplete(s) ||
      s.pocBaseline.decisions['scope-FR-007']?.decision !== 'included'
    )
      return;
    const baseline = Object.freeze({
      ...s.pocBaseline,
      id: 'RB-002' as const,
      version: 'v2' as const,
      parentBaselineId: 'RB-001' as const,
      changeRequestId: 'CR-001' as const,
      revisionIds: Object.freeze(requirementRevisions.map((r) => r.id)),
      criterionRevisionId: criterionRevision.id,
      approvedAt: 'Client review 00:21',
    });
    set({
      feedback: { ...f, status: 'approved', baseline },
      approvedChangeIds: addId(s.approvedChangeIds, 'CR-001'),
    });
  },
  selectImpact: (id) =>
    set({ feedback: { ...get().feedback, selectedArtifactId: id } }),
  restartFeedback: () =>
    set({
      feedback: createFeedbackRuntime(),
      currentPocVersion: 'v1',
      approvedChangeIds: without(get().approvedChangeIds, 'CR-001'),
    }),
  startDelta: () => {
    const s = get();
    if (
      s.feedback.status === 'approved' &&
      s.feedback.baseline &&
      s.feedback.delta.status === 'idle' &&
      selectPreviewReady(s)
    )
      set({
        feedback: advanceDelta(
          {
            ...s,
            feedback: {
              ...s.feedback,
              delta: { ...s.feedback.delta, status: 'running' },
            },
          },
          0,
        ),
      });
  },
  deltaPlayback: (action) => {
    const s = get(),
      f = s.feedback;
    if (!f.baseline || !selectPreviewReady(s) || f.delta.status === 'idle')
      return;
    if (action === 'restart') {
      set({
        feedback: {
          ...f,
          status: 'approved',
          delta: {
            status: 'idle',
            elapsedMs: 0,
            artifactStatuses: {},
            testResults: {},
          },
          v2Runtime: null,
        },
        currentPocVersion: 'v1',
      });
      return;
    }
    if (f.delta.status === 'completed') return;
    if (action === 'next') {
      const next = deltaMilestones.find((e) => e.at > f.delta.elapsedMs);
      if (next) set({ feedback: advanceDelta(s, next.at) });
    } else if (
      (action === 'pause' && f.delta.status === 'running') ||
      (action === 'resume' && f.delta.status === 'paused')
    )
      set({
        feedback: {
          ...f,
          delta: {
            ...f.delta,
            status: action === 'pause' ? 'paused' : 'running',
          },
        },
      });
  },
  selectPocVersion: (version) => {
    if (version === 'v1' || selectV2Ready(get()))
      set({ currentPocVersion: version });
  },
  setTraceView: (view) => {
    if (
      view.workflow &&
      view.workflow !== 'overview' &&
      !featureEvidence.some(
        (f) => f.id === view.workflow && f.id !== 'identity',
      )
    )
      return;
    set({ traceView: { ...get().traceView, ...view } });
  },
  performPocAction: (action) => {
    const state = get();
    if (!selectPreviewReady(state) || !state.pocBaseline) return;
    if (state.currentPocVersion === 'v2') {
      if (
        !selectV2Ready(state) ||
        !state.feedback.v2Runtime ||
        !state.feedback.baseline
      )
        return;
      set({
        feedback: {
          ...state.feedback,
          v2Runtime: applyPocAction(
            state.feedback.v2Runtime,
            action,
            state.feedback.baseline,
          ),
        },
      });
      return;
    }
    if (
      action.type === 'approve-review' &&
      selectPreviewScopeGaps(state).length
    )
      return;
    set({
      pocRuntime: applyPocAction(state.pocRuntime, action, state.pocBaseline),
    });
  },
  resetPocData: () => {
    const s = get();
    if (s.currentPocVersion === 'v2') {
      set({ feedback: { ...s.feedback, v2Runtime: createV2Runtime() } });
      return;
    }
    set({ pocRuntime: createPocRuntime() });
  },
  startGeneration: () => {
    const state = get();
    if (
      selectGenerationReadiness(state) !== 'Ready' ||
      state.generation.status !== 'idle'
    )
      return;
    set(
      advanceGeneration(
        { ...state, generation: { ...state.generation, status: 'running' } },
        0,
      ),
    );
  },
  pauseGeneration: () => {
    const state = get();
    if (state.generation.status === 'running')
      set({
        generation: { ...state.generation, status: 'paused' },
        agentStatuses: state.agentStatuses.map((a) =>
          a.status === 'running' ? { ...a, status: 'paused' } : a,
        ),
      });
  },
  resumeGeneration: () => {
    const state = get();
    if (
      selectGenerationReadiness(state) === 'Ready' &&
      state.generation.status === 'paused'
    )
      set({
        generation: { ...state.generation, status: 'running' },
        agentStatuses: state.agentStatuses.map((a) =>
          a.status === 'paused' ? { ...a, status: 'running' } : a,
        ),
      });
  },
  nextGenerationEvent: () => {
    const state = get();
    const event = generationEvents[state.generation.eventCursor];
    if (
      selectGenerationReadiness(state) === 'Ready' &&
      event &&
      state.generation.status !== 'failed'
    )
      set(
        advanceGeneration(
          {
            ...state,
            generation: {
              ...state.generation,
              status:
                state.generation.status === 'running' ? 'running' : 'paused',
            },
            agentStatuses: state.agentStatuses.map((a) =>
              a.status === 'paused' ? { ...a, status: 'running' } : a,
            ),
          },
          event.at,
        ),
      );
  },
  restartGeneration: () => {
    const state = get();
    if (selectGenerationReadiness(state) === 'Ready')
      set(
        advanceGeneration(
          {
            ...state,
            ...createEngineeringState(),
            pocRuntime: createPocRuntime(),
            generation: {
              ...createEngineeringState().generation,
              status: 'running',
            },
          },
          0,
        ),
      );
  },
  selectGenerationAgent: (id) => {
    const state = get();
    if (state.agentStatuses.some((a) => a.id === id))
      set({
        generation: {
          ...state.generation,
          selectedAgentId: id,
          selectedArtifactId: null,
        },
      });
  },
  selectGenerationArtifact: (id) => {
    const state = get();
    if (id === null || state.generation.artifactStatuses[id])
      set({ generation: { ...state.generation, selectedArtifactId: id } });
  },
  setRequirementView: (view) => {
    if (view.selectedId && !requirements.some((r) => r.id === view.selectedId))
      return;
    set({ requirementView: { ...get().requirementView, ...view } });
  },
  selectScopeItem: (id) => {
    if (scopeItems.some((item) => item.id === id))
      set({ selectedScopeItemId: id });
  },
  setScopeDecision: (id, decision, reason = '') => {
    const state = get();
    const item = scopeItems.find((item) => item.id === id);
    if (
      !item ||
      state.scopeApproved ||
      !['included', 'mocked', 'excluded'].includes(decision)
    )
      return;
    const scopeOverrides = { ...state.scopeOverrides };
    if (decision === item.decision) delete scopeOverrides[id];
    else scopeOverrides[id] = { decision, reason: reason.trim() };
    set({
      scopeOverrides,
      scopeReviews: {
        ...state.scopeReviews,
        scope: false,
        successCriteria: false,
      },
    });
  },
  resetScopeRecommendation: (id) => {
    const item = scopeItems.find((item) => item.id === id);
    if (item && !get().scopeApproved) get().setScopeDecision(id, item.decision);
  },
  setScopeReview: (key, reviewed) => {
    if (!get().scopeApproved)
      set({ scopeReviews: { ...get().scopeReviews, [key]: reviewed } });
  },
  approveScope: () => {
    const state = get();
    if (!canApproveScope(state)) return;
    const ids = (decision: ScopeDecision) =>
      Object.freeze(
        scopeItems
          .filter(
            (item) =>
              (state.scopeOverrides[item.id]?.decision ?? item.decision) ===
              decision,
          )
          .map((item) => item.id),
      );
    const seconds = Math.floor(state.elapsedMs / 1000);
    const decisions = Object.fromEntries(
      scopeItems.map((item) => [
        item.id,
        Object.freeze({
          ...(state.scopeOverrides[item.id] ?? {
            decision: item.decision,
            reason: item.reason,
          }),
        }),
      ]),
    );
    const pocBaseline: PocBaseline = Object.freeze({
      id: 'RB-001',
      version: 'v1',
      requirementIds: Object.freeze(requirements.map((r) => r.id)),
      confirmedRequirementIds: Object.freeze(
        selectGovernedRequirementIds(state),
      ),
      includedScopeItemIds: ids('included'),
      mockedScopeItemIds: ids('mocked'),
      excludedScopeItemIds: ids('excluded'),
      successCriteriaIds: Object.freeze(successCriteria.map((c) => c.id)),
      resolvedClarificationIds: Object.freeze([
        ...state.resolvedClarificationIds,
      ]),
      acknowledgedAssumptionIds: Object.freeze(
        requirements.filter((r) => r.type === 'assumption').map((r) => r.id),
      ),
      decisions: Object.freeze(decisions),
      approvedAt: `Demo ${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`,
      approvedBy: 'Consultant',
      clarificationReviewSequence: state.clarificationHistory.length,
    });
    set({ scopeApproved: true, baselineVersion: 'RB-001', pocBaseline });
  },
  selectClarification: (id) => {
    if (validClarification(id)) set({ selectedClarificationId: id });
  },
  setClarificationFilter: (clarificationFilter) => set({ clarificationFilter }),
  editClarificationQuestion: (id, question) => {
    const state = get();
    if (
      !validClarification(id) ||
      state.resolvedClarificationIds.includes(id) ||
      !question.trim()
    )
      return;
    set({
      editedClarificationQuestions: {
        ...state.editedClarificationQuestions,
        [id]: question.trim(),
      },
      acceptedSuggestionIds: without(state.acceptedSuggestionIds, id),
      clarificationHistory: history(state, id, 'question-edited'),
    });
  },
  acceptClarificationSuggestion: (id) => {
    const state = get();
    if (
      !validClarification(id) ||
      state.acceptedSuggestionIds.includes(id) ||
      state.resolvedClarificationIds.includes(id)
    )
      return;
    set({
      acceptedSuggestionIds: addId(state.acceptedSuggestionIds, id),
      clarificationHistory: history(state, id, 'suggestion-accepted'),
    });
  },
  reviewClarificationEvidence: (id) => {
    const state = get();
    if (
      !validClarification(id) ||
      state.reviewedEvidenceIds.includes(id) ||
      state.resolvedClarificationIds.includes(id)
    )
      return;
    set({
      reviewedEvidenceIds: addId(state.reviewedEvidenceIds, id),
      rejectedResolutionIds: without(state.rejectedResolutionIds, id),
      clarificationHistory: history(state, id, 'evidence-reviewed'),
    });
  },
  acceptClarificationResolution: (id) => {
    const state = get();
    if (
      !validClarification(id) ||
      !state.reviewedEvidenceIds.includes(id) ||
      state.resolvedClarificationIds.includes(id)
    )
      return;
    const next = {
      ...state,
      resolvedClarificationIds: addId(state.resolvedClarificationIds, id),
      openClarificationIds: without(state.openClarificationIds, id),
      rejectedResolutionIds: without(state.rejectedResolutionIds, id),
      reopenedClarificationIds: without(state.reopenedClarificationIds, id),
      clarificationHistory: history(state, id, 'confirmed'),
    };
    set({ ...next, liveReadiness: calculateLiveReadiness(next) });
  },
  rejectClarificationResolution: (id) => {
    const state = get();
    if (
      !validClarification(id) ||
      !state.reviewedEvidenceIds.includes(id) ||
      state.resolvedClarificationIds.includes(id)
    )
      return;
    set({
      reviewedEvidenceIds: without(state.reviewedEvidenceIds, id),
      rejectedResolutionIds: addId(state.rejectedResolutionIds, id),
      clarificationHistory: history(state, id, 'rejected'),
    });
  },
  reopenClarification: (id) => {
    const state = get();
    if (!state.resolvedClarificationIds.includes(id)) return;
    const next = {
      ...state,
      resolvedClarificationIds: without(state.resolvedClarificationIds, id),
      openClarificationIds: addId(state.openClarificationIds, id),
      reviewedEvidenceIds: without(state.reviewedEvidenceIds, id),
      reopenedClarificationIds: addId(state.reopenedClarificationIds, id),
      clarificationHistory: history(state, id, 'reopened'),
    };
    set({ ...next, liveReadiness: calculateLiveReadiness(next) });
  },
  start: () =>
    set(
      get().sessionComplete
        ? { ...createInitialDemoState(), isRunning: true }
        : { isRunning: true, isPaused: false },
    ),
  pause: () => {
    if (get().isRunning) set({ isRunning: false, isPaused: true });
  },
  resume: () => {
    if (get().isPaused && !get().sessionComplete)
      set({ isRunning: true, isPaused: false });
  },
  restart: () => set({ ...createInitialDemoState(), isRunning: true }),
  nextEvent: () => {
    const state = get();
    const event = sessionEvents[state.eventCursor];
    if (event)
      set(advanceSession({ ...state, isPaused: !state.isRunning }, event.at));
  },
  tick: (deltaMs) => {
    const state = get();
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return;
    if (
      state.feedback.capture.status === 'running' &&
      selectPreviewReady(state)
    )
      set({
        feedback: advanceFeedback(
          state,
          state.feedback.capture.elapsedMs + deltaMs * state.demoSpeed,
        ),
      });
    if (state.feedback.delta.status === 'running' && selectPreviewReady(state))
      set({
        feedback: advanceDelta(
          state,
          state.feedback.delta.elapsedMs + deltaMs * state.demoSpeed,
        ),
      });
    if (state.generation.status === 'running')
      set(
        advanceGeneration(
          state,
          state.generation.elapsedMs + deltaMs * state.demoSpeed,
        ),
      );
    if (state.isRunning)
      set(advanceSession(state, state.elapsedMs + deltaMs * state.demoSpeed));
  },
  reset: () => set(createInitialDemoState()),
  setDemoSpeed: (speed) => {
    if (Number.isFinite(speed) && speed >= 0.25 && speed <= 4)
      set({ demoSpeed: speed });
  },
}));
