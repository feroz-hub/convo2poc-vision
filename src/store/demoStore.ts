import { create } from 'zustand';
import { agents, buildChecks } from '@/data/agents';
import type {
  Actor,
  TranscriptMessage,
  AgentStatus,
  BuildCheck,
  PocVersion,
} from '@/types/domain';
import type { DemoStage } from '@/simulation/stages';
import { advanceSession } from '@/simulation/demoEngine';
import { sessionEvents } from '@/simulation/sessionEvents';
export interface DemoState {
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
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  nextEvent: () => void;
  tick: (deltaMs: number) => void;
  reset: () => void;
  setDemoSpeed: (speed: number) => void;
}
export const useDemoStore = create<DemoState & DemoActions>()((set, get) => ({
  ...createInitialDemoState(),
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
