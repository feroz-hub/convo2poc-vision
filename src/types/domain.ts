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
export type IntelligenceStatus =
  | 'detected'
  | 'needs-clarification'
  | 'confirmed'
  | 'needs-review'
  | 'acknowledged';
export interface RequirementView {
  selectedId: string;
  type: RequirementType | 'all';
  status: IntelligenceStatus | 'all';
  actor: Actor | null;
  search: string;
}
export type ClarificationCategory =
  | 'ambiguity'
  | 'business-rule'
  | 'role'
  | 'scope'
  | 'integration'
  | 'assumption';
export type ClarificationStatus =
  'open' | 'evidence-captured' | 'needs-review' | 'resolved' | 'confirmed';
export type ClarificationFilter = 'all' | 'open' | 'needs-review' | 'resolved';
export interface ClarificationHistoryEntry {
  clarificationId: string;
  action:
    | 'suggestion-accepted'
    | 'question-edited'
    | 'evidence-reviewed'
    | 'confirmed'
    | 'rejected'
    | 'reopened';
  elapsedMs: number;
  sequence: number;
}
export interface Clarification {
  id: string;
  requirementId: string;
  affectedRequirementIds: string[];
  sourceMessageId: string;
  question: string;
  reason: string;
  options: string[];
  category: ClarificationCategory;
  impact: 'high' | 'medium';
  status: ClarificationStatus;
  resolution: string;
  resolutionMessageId: string;
}
export type ScopeDecision = 'included' | 'mocked' | 'excluded';
export type ScopeReviewKey =
  'requirements' | 'assumptions' | 'scope' | 'successCriteria';
export interface ScopeOverride {
  decision: ScopeDecision;
  reason: string;
}
export interface PocSuccessCriterion {
  id: string;
  requirementIds: string[];
  scopeItemIds: string[];
}
export interface PocBaseline {
  readonly id: 'RB-001';
  readonly version: 'v1';
  readonly requirementIds: readonly string[];
  readonly confirmedRequirementIds: readonly string[];
  readonly includedScopeItemIds: readonly string[];
  readonly mockedScopeItemIds: readonly string[];
  readonly excludedScopeItemIds: readonly string[];
  readonly successCriteriaIds: readonly string[];
  readonly resolvedClarificationIds: readonly string[];
  readonly acknowledgedAssumptionIds: readonly string[];
  readonly decisions: Readonly<Record<string, Readonly<ScopeOverride>>>;
  readonly approvedAt: string;
  readonly approvedBy: 'Consultant';
  readonly clarificationReviewSequence: number;
}
export interface ScopeItem {
  id: string;
  title: string;
  requirementIds: string[];
  decision: ScopeDecision;
  reason: string;
  complexity: 'low' | 'medium' | 'high';
  externalDependency: 'none' | 'low' | 'medium' | 'high';
  evidenceMessageIds: string[];
  clarificationIds: string[];
  relevance: 'core' | 'supporting' | 'future';
}
export interface AgentStatus {
  id: string;
  name: string;
  description: string;
  status: 'waiting' | 'queued' | 'running' | 'completed' | 'failed' | 'paused';
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

export interface EngineeringAgent extends AgentStatus {
  inputArtifactIds: string[];
  outputArtifactIds: string[];
  requirementIds: string[];
}
export interface EngineeringArtifact extends Artifact {
  path: string;
  generatedBy: string;
  successCriterionIds: string[];
}
export interface EngineeringTest {
  id: string;
  label: string;
  requirementIds: string[];
  successCriterionId?: string;
  artifactIds?: string[];
  category: 'API' | 'Workflow' | 'UI';
}
export interface GenerationRuntime {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  elapsedMs: number;
  eventCursor: number;
  baselineId: string | null;
  visibleEventIds: string[];
  artifactStatuses: Record<string, 'generated' | 'validated'>;
  testResults: Record<string, 'generated' | 'passed' | 'failed'>;
  sandbox: 'waiting' | 'preparing' | 'ready' | 'failed';
  selectedAgentId: string;
  selectedArtifactId: string | null;
}
