import type { PocBaseline, EngineeringTest } from './domain';
import type { PocRuntime } from './pocRuntime';
export type ReviewKey =
  'evidence' | 'requirements' | 'scope' | 'artifacts' | 'tests';
export type Playback = 'idle' | 'running' | 'paused' | 'completed';
export interface RequirementRevision {
  id: string;
  requirementId: string;
  changeRequestId: 'CR-001';
  baselineFrom: 'RB-001';
  baselineTo: 'RB-002';
  revisedText: string;
}
export interface RevisedBaseline extends PocBaseline {
  readonly id: 'RB-002';
  readonly version: 'v2';
  readonly parentBaselineId: 'RB-001';
  readonly changeRequestId: 'CR-001';
  readonly revisionIds: readonly string[];
  readonly criterionRevisionId: string;
}
export interface VersionedTest extends EngineeringTest {
  baselineId: 'RB-001' | 'RB-002';
  changeRequestId?: 'CR-001';
  supersedesTestId?: string;
}
export interface FeedbackRuntime {
  capture: { status: Playback; elapsedMs: number };
  status:
    | 'waiting'
    | 'detected'
    | 'analyzed'
    | 'needs-clarification'
    | 'rejected'
    | 'approved'
    | 'implemented';
  reviews: Record<ReviewKey, boolean>;
  selectedArtifactId: string | null;
  baseline: RevisedBaseline | null;
  delta: {
    status: Playback;
    elapsedMs: number;
    artifactStatuses: Record<string, 'modified' | 'reused' | 'validated'>;
    testResults: Record<string, 'passed' | 'failed'>;
  };
  v2Runtime: PocRuntime | null;
}
