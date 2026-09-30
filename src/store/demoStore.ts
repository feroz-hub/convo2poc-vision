import { create } from 'zustand';
import { agents, buildChecks } from '@/data/agents';
import type { AgentStatus, BuildCheck, PocVersion } from '@/types/domain';
import type { DemoStage } from '@/simulation/stages';
export interface DemoState {
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
  reset: () => void;
  setDemoSpeed: (speed: number) => void;
}
export const useDemoStore = create<DemoState & DemoActions>()((set) => ({
  ...createInitialDemoState(),
  reset: () => set(createInitialDemoState()),
  setDemoSpeed: (speed) => {
    if (Number.isFinite(speed) && speed >= 0.25 && speed <= 4)
      set({ demoSpeed: speed });
  },
}));
