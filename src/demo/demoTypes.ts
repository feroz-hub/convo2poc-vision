export const demoChapters = [
  { id: 'understand', title: 'Understand', label: 'Client Conversation' },
  { id: 'clarify', title: 'Clarify', label: 'Resolve Ambiguity' },
  { id: 'structure', title: 'Structure', label: 'Requirement Intelligence' },
  { id: 'scope', title: 'Scope', label: 'Define POC Boundary' },
  { id: 'generate', title: 'Generate', label: 'AI Engineering' },
  { id: 'validate', title: 'Validate', label: 'Working POC' },
  { id: 'trace', title: 'Trace', label: 'Evidence & Lineage' },
  { id: 'evolve', title: 'Evolve', label: 'Client Feedback → v2' },
  { id: 'outcome', title: 'Outcome', label: 'Demo Completion' },
] as const;
export type DemoChapterId = (typeof demoChapters)[number]['id'];
export const demoTargets = {
  'value-time-to-poc': 'Time to validated prototype',
  'value-requirements': 'Structured client intent',
  'value-scope': 'Deliberate POC boundary',
  'value-traceability': 'Scoped workflow evidence',
  'value-reuse': 'Targeted artifact reuse',
  'value-version-evolution': 'Preserved versioned baselines',
  'value-pilot': 'Real engagement pilot recommendation',
  'value-summary': 'Executive demo outcome',
  'overview-concept': 'Conversation to working proof',
  'session-requirement-detection': 'Live requirement intelligence',
  'session-ambiguity': 'Ambiguity and client evidence',
  'clarification-oq001': 'Evidence-backed clarification',
  'requirement-fr007': 'Structured requirement relationships',
  'scope-funnel': 'Focused POC boundary',
  'scope-approval': 'Consultant scope review',
  'scope-success': 'POC success criteria',
  'generation-sandbox': 'Security and review sandbox',
  'preview-review': 'Consultant POC review',
  'generation-baseline': 'Approved implementation contract',
  'generation-parallel': 'Parallel engineering responsibilities',
  'generation-tests': 'Canonical validation evidence',
  'preview-p1-approval': 'Working approval workflow',
  'preview-feature-evidence': 'Why this feature exists',
  'trace-p1-path': 'Client intent to validated feature',
  'feedback-cr001': 'Governed client change',
  'feedback-impact': 'Changed and reusable assets',
  'feedback-rb002': 'Consultant change review',
  'feedback-delta': 'Targeted regeneration',
  'preview-v1-p2': 'Preserved P2 policy in v1',
  'preview-v2-p2': 'Revised P2 policy in v2',
} as const;
export type DemoTargetId = keyof typeof demoTargets;
export type DemoCondition =
  | 'ready'
  | 'requirements'
  | 'ambiguity'
  | 'answer'
  | 'session-complete'
  | 'oq001-confirmed'
  | 'clarifications-confirmed'
  | 'rb001'
  | 'parallel'
  | 'generation-complete'
  | 'p1-created'
  | 'p1-assigned'
  | 'p1-blocked'
  | 'p1-approved'
  | 'p1-progressed'
  | 'v1-approved'
  | 'trace-complete'
  | 'cr001'
  | 'feedback-analyzed'
  | 'rb002'
  | 'v2-ready'
  | 'v1-p2'
  | 'v2-p2';
export type DemoAction =
  | { type: 'clarification'; ids: readonly string[] }
  | { type: 'select-requirement'; id: string }
  | { type: 'approve-scope' }
  | {
      type:
        | 'p1-create'
        | 'p1-assign'
        | 'p1-blocked'
        | 'p1-approve'
        | 'p1-progress'
        | 'p1-history'
        | 'feature-evidence'
        | 'approve-v1'
        | 'trace-p1'
        | 'approve-change'
        | 'p2-v1'
        | 'p2-v2';
    };
export type DemoSimulation = { presentationMs: number } & (
  | {
      lane: 'session';
      until: 'requirements' | 'ambiguity' | 'answer' | 'complete';
    }
  | {
      lane: 'generation';
      until: 'architecture' | 'parallel' | 'tests' | 'complete';
    }
  | { lane: 'feedback'; until: 'cr001' | 'complete' }
  | { lane: 'delta'; until: 'complete' }
);
export interface DemoStep {
  id: string;
  chapterId: DemoChapterId;
  route: string;
  title: string;
  narration: string;
  durationMs: number;
  condition: DemoCondition;
  spotlight?: DemoTargetId;
  action?: DemoAction;
  simulation?: DemoSimulation;
  governance?: {
    type:
      | 'clarification-approval'
      | 'scope-approval'
      | 'poc-review'
      | 'change-approval';
    label: string;
  };
  completion?: boolean;
}
export interface DemoDirectorState {
  mode: 'manual' | 'autopilot';
  status: 'idle' | 'running' | 'paused' | 'completed';
  stepIndex: number;
  elapsedMs: number;
  stepElapsedMs: number;
  simulationStartMs: number;
  entered: boolean;
  actionDone: boolean;
  routeReady: boolean;
  routeBlocked: boolean;
  navigationRevision: number;
  speed: 0.75 | 1 | 1.5 | 2;
  presentationMode: boolean;
  prepared: boolean;
  error: string | null;
  requestIds: { p1: string | null; p2v1: string | null; p2v2: string | null };
}
export const createDirectorState = (): DemoDirectorState => ({
  mode: 'manual',
  status: 'idle',
  stepIndex: 0,
  elapsedMs: 0,
  stepElapsedMs: 0,
  simulationStartMs: 0,
  entered: false,
  actionDone: false,
  routeReady: false,
  routeBlocked: false,
  navigationRevision: 0,
  speed: 1,
  presentationMode: true,
  prepared: false,
  error: null,
  requestIds: { p1: null, p2v1: null, p2v2: null },
});
