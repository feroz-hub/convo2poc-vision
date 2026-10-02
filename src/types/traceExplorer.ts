export type TraceKind =
  | 'conversation'
  | 'clarification'
  | 'requirement'
  | 'scope'
  | 'criterion'
  | 'artifact'
  | 'feature'
  | 'test';
export interface TraceRecord {
  id: string;
  canonicalId: string;
  kind: TraceKind;
  label: string;
  description: string;
  status: string;
  lane: number;
  featureId: string;
}
export interface TraceConnection {
  id: string;
  source: string;
  target: string;
  label: string;
}
export interface TraceChain {
  featureId: string;
  label: string;
  nodes: TraceRecord[];
  edges: TraceConnection[];
  complete: boolean;
  sourceCaptured: boolean;
  issues: string[];
  mappingGaps: string[];
}
export const traceKindLabels: Record<TraceKind, string> = {
  conversation: 'Conversation',
  clarification: 'Clarification',
  requirement: 'Requirement',
  scope: 'Scope decision',
  criterion: 'Success criterion',
  artifact: 'Generated artifact',
  feature: 'Working POC feature',
  test: 'Test evidence',
};
export const traceLaneLabels = [
  'Conversation',
  'Requirements',
  'Scope',
  'Implementation',
  'Validation',
];

export interface TraceView {
  workflow: string;
  selectedId: string | null;
  search: string;
  filter: 'all' | 'complete' | 'gaps';
}
