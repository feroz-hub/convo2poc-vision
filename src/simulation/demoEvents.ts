import type { DemoStage } from './stages';
import type { AgentStatus, BuildCheck } from '@/types/domain';
type EventPayloads = {
  TRANSCRIPT_MESSAGE: { messageId: string };
  REQUIREMENT_DETECTED: { requirementId: string };
  AMBIGUITY_DETECTED: { clarificationId: string };
  CLARIFICATION_RESOLVED: { clarificationId: string };
  STAGE_CHANGED: { stage: DemoStage };
  SCOPE_APPROVED: { baselineVersion: 'RB-001' };
  AGENT_UPDATED: {
    agentId: string;
    status: AgentStatus['status'];
    progress: number;
  };
  BUILD_CHECK_UPDATED: { checkId: string; status: BuildCheck['status'] };
  PREVIEW_READY: { version: 'v1' | 'v2' };
  CHANGE_DETECTED: { changeRequestId: string };
  CHANGE_APPROVED: { changeRequestId: string; baselineVersion: 'RB-002' };
  DEMO_COMPLETED: Record<string, never>;
};
export type DemoEvent = {
  [K in keyof EventPayloads]: {
    id: string;
    at: number;
    stage: DemoStage;
    type: K;
    payload: EventPayloads[K];
  };
}[keyof EventPayloads];
// Event scheduling and reduction are deferred to playback phases.
