import { create } from 'zustand';
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
  performPocAction: (action) => {
    const state = get();
    if (!selectPreviewReady(state) || !state.pocBaseline) return;
    if (
      action.type === 'approve-review' &&
      selectPreviewScopeGaps(state).length
    )
      return;
    set({
      pocRuntime: applyPocAction(state.pocRuntime, action, state.pocBaseline),
    });
  },
  resetPocData: () => set({ pocRuntime: createPocRuntime() }),
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
