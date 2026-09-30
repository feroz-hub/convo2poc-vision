export type RequirementType =
  | 'functional'
  | 'non-functional'
  | 'business-rule'
  | 'assumption'
  | 'open-question';
export type RequirementStatus =
  'detected' | 'needs-clarification' | 'confirmed' | 'excluded' | 'implemented';
export type Actor =
  'Employee' | 'Support Engineer' | 'Administrator' | 'Manager';
export interface Scenario {
  id: string;
  name: string;
  client: string;
  engagement: string;
  businessProblem: string;
  objective: string;
  actors: Actor[];
}
export interface TranscriptMessage {
  id: string;
  speaker: string;
  role: 'client' | 'consultant' | 'system';
  timestamp: string;
  text: string;
}
export interface Requirement {
  id: string;
  type: RequirementType;
  title: string;
  description: string;
  status: RequirementStatus;
  confidence: number;
  sourceMessageId?: string;
  sourceTimestamp?: string;
  speaker?: string;
  actors: Actor[];
  tags: string[];
}
export interface Clarification {
  id: string;
  requirementId: string;
  affectedRequirementIds: string[];
  sourceMessageId: string;
  question: string;
  reason: string;
  options: string[];
  status: 'open' | 'resolved';
  resolution: string;
  resolutionMessageId: string;
}
export interface ScopeItem {
  id: string;
  title: string;
  requirementIds: string[];
  decision: 'included' | 'mocked' | 'excluded';
  reason: string;
  complexity: 'low' | 'medium';
  relevance: 'core' | 'supporting' | 'future';
}
export interface AgentStatus {
  id: string;
  name: string;
  description: string;
  status: 'waiting' | 'running' | 'complete' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
}
export interface BuildCheck {
  id: string;
  label: string;
  status: 'waiting' | 'running' | 'passed' | 'failed';
  duration?: string;
}
export interface Artifact {
  id: string;
  label: string;
  kind: 'document' | 'screen' | 'api' | 'test' | 'rule';
  requirementIds: string[];
}
export interface TraceNode {
  id: string;
  type:
    'conversation' | 'requirement' | 'user-story' | 'screen' | 'api' | 'test';
  label: string;
  metadata?: Record<string, string>;
}
export interface TraceEdge {
  id: string;
  source: string;
  target: string;
}
export interface ChangeRequest {
  id: string;
  sourceMessageId: string;
  previousValue: string;
  newValue: string;
  impactedArtifacts: string[];
  requirementIds: string[];
  status: 'detected' | 'approved' | 'applied';
}
export interface ReadinessDimension {
  id: string;
  label: string;
  score: number;
  weight: number;
}
export type PocVersion = 'v1' | 'v2';
