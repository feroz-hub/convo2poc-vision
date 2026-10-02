import { create } from 'zustand';
import { clarifications } from '@/data/requirements';
import { calculateLiveReadiness } from '@/simulation/readiness';
import { agents, buildChecks } from '@/data/agents';
import type {
  Actor,
  TranscriptMessage,
  AgentStatus,
  BuildCheck,
  PocVersion,
  ClarificationFilter,
  ClarificationHistoryEntry,
} from '@/types/domain';
import type { DemoStage } from '@/simulation/stages';
import { advanceSession } from '@/simulation/demoEngine';
import { sessionEvents } from '@/simulation/sessionEvents';
export interface DemoState {
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
  agentStatuses: agents.map((agent) => ({ ...agent })),
  buildChecks: buildChecks.map((check) => ({ ...check })),
  currentPocVersion: 'v1',
  approvedChangeIds: [],
  demoSpeed: 1,
});
interface DemoActions {
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
    if (state.isRunning && Number.isFinite(deltaMs) && deltaMs > 0)
      set(advanceSession(state, state.elapsedMs + deltaMs * state.demoSpeed));
  },
  reset: () => set(createInitialDemoState()),
  setDemoSpeed: (speed) => {
    if (Number.isFinite(speed) && speed >= 0.25 && speed <= 4)
      set({ demoSpeed: speed });
  },
}));
