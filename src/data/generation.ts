import { artifacts } from './traceability';
import { scopeItems, successCriteria } from './scope';
import { requirements } from './requirements';
import type {
  EngineeringArtifact,
  EngineeringTest,
  PocBaseline,
} from '@/types/domain';
// Reuse current-v1 canonical tests. TC-016 belongs to the future P2 change and is deliberately deferred.
export const engineeringTests: EngineeringTest[] = [
  ...artifacts
    .filter((a) => a.kind === 'test' && a.id !== 'TC-016')
    .map((a) => ({
      id: a.id,
      label: a.label,
      requirementIds: a.requirementIds,
      successCriterionId: a.requirementIds.includes('FR-003')
        ? 'SC-002'
        : 'SC-004',
      category: 'Workflow' as const,
    })),
  {
    id: 'TC-001',
    label: 'Create a valid service request',
    requirementIds: ['FR-001'],
    successCriterionId: 'SC-001',
    category: 'API',
  },
  {
    id: 'TC-018',
    label: 'Engineer progresses request status',
    requirementIds: ['FR-004'],
    successCriterionId: 'SC-003',
    category: 'API',
  },
  {
    id: 'TC-019',
    label: 'Dashboard reflects request status',
    requirementIds: ['FR-006'],
    successCriterionId: 'SC-005',
    category: 'UI',
  },
  {
    id: 'TC-020',
    label: 'Closed requests remain searchable',
    requirementIds: ['FR-008'],
    successCriterionId: 'SC-006',
    category: 'UI',
  },
  {
    id: 'TC-021',
    label: 'Employee can view their submitted requests',
    requirementIds: ['FR-002'],
    artifactIds: ['list-screen', 'list-api'],
    category: 'UI',
  },
  {
    id: 'TC-022',
    label: 'Request details show chronological request history',
    requirementIds: ['FR-005'],
    artifactIds: ['detail-screen', 'detail-api'],
    category: 'UI',
  },
];
const allCore = requirements
  .filter(
    (r) =>
      r.type === 'functional' ||
      r.type === 'business-rule' ||
      r.type === 'non-functional',
  )
  .map((r) => r.id);
const make = (
  id: string,
  label: string,
  path: string,
  kind: EngineeringArtifact['kind'],
  generatedBy: string,
  requirementIds: string[],
): EngineeringArtifact => ({
  id,
  label,
  path,
  kind,
  generatedBy,
  requirementIds,
  successCriterionIds: [],
});
export const engineeringArtifacts: EngineeringArtifact[] = [
  make(
    'implementation-plan',
    'Implementation contract',
    'poc/implementation-plan.md',
    'document',
    'requirements',
    allCore,
  ),
  make(
    'mapped-requirements',
    'Mapped requirements',
    'poc/mapped-requirements.json',
    'document',
    'requirements',
    allCore,
  ),
  make(
    'architecture',
    'Application architecture',
    'poc/architecture.md',
    'document',
    'architecture',
    allCore,
  ),
  make(
    'api-contract',
    'API contract',
    'poc/api-contract.json',
    'document',
    'architecture',
    allCore,
  ),
  make(
    'data-model',
    'Data model',
    'poc/data-model.json',
    'document',
    'architecture',
    allCore,
  ),
  ...[
    ['create-screen', 'Create Request', 'FR-001'],
    ['list-screen', 'Request List', 'FR-002'],
    ['detail-screen', 'Request Detail & History', 'FR-005'],
    ['dashboard-screen', 'Dashboard', 'FR-006'],
    ['status-screen', 'Engineer Status', 'FR-004'],
    ['search-screen', 'Closed Request Search', 'FR-008'],
  ].map(([id, label, req]) =>
    make(
      id!,
      label!,
      `poc/frontend/${label!.replaceAll(' ', '')}.tsx`,
      'screen',
      'ui',
      [req!],
    ),
  ),
  ...artifacts
    .filter((a) => ['assignment-screen', 'approval-screen'].includes(a.id))
    .map((a) => ({
      ...a,
      path: `poc/frontend/${a.id}.tsx`,
      generatedBy: 'ui',
      successCriterionIds: [],
    })),
  ...[
    ['create-api', 'POST /requests', 'FR-001'],
    ['list-api', 'GET /requests', 'FR-002'],
    ['detail-api', 'GET /requests/{id}', 'FR-005'],
    ['status-api', 'PUT /requests/{id}/status', 'FR-004'],
    ['dashboard-api', 'GET /requests/summary', 'FR-006'],
    ['search-api', 'GET /requests?status=closed', 'FR-008'],
  ].map(([id, label, req]) =>
    make(id!, label!, `poc/backend/${id!}`, 'api', 'backend', [req!]),
  ),
  ...artifacts
    .filter((a) => ['assignment-api', 'approval-api'].includes(a.id))
    .map((a) => ({
      ...a,
      path: `poc/backend/${a.id}`,
      generatedBy: 'backend',
      successCriterionIds: [],
    })),
  make(
    'schema',
    'User · ServiceRequest · RequestHistory · Approval',
    'poc/data/schema.sql',
    'document',
    'data',
    allCore,
  ),
  make(
    'seed-data',
    'Synthetic POC data',
    'poc/data/seed-data.json',
    'document',
    'data',
    ['ASM-003'],
  ),
  ...engineeringTests.map((t) => ({
    ...make(
      t.id,
      t.label,
      `poc/tests/${t.category.toLowerCase()}/${t.id}.spec`,
      'test',
      'test',
      t.requirementIds,
    ),
    successCriterionIds: t.successCriterionId ? [t.successCriterionId] : [],
  })),
  make(
    'security-report',
    'Simulated security baseline',
    'poc/security/baseline.json',
    'document',
    'security',
    ['NFR-002', 'ASM-001', 'ASM-003'],
  ),
  make(
    'runtime-manifest',
    'Isolated review manifest',
    'poc/sandbox/runtime-manifest.json',
    'document',
    'deployment',
    ['NFR-001', 'ASM-003'],
  ),
  make(
    'sandbox-config',
    'Restricted sandbox configuration',
    'poc/sandbox/config.json',
    'document',
    'deployment',
    ['ASM-001', 'ASM-003'],
  ),
];
// Scope overrides are honored by the metadata plan; no real integrations are ever provisioned.
export function getBaselineArtifacts(
  baseline: PocBaseline,
): EngineeringArtifact[] {
  const activeScope = scopeItems.filter(
    (s) => baseline.decisions[s.id]?.decision !== 'excluded',
  );
  const activeIds = new Set(activeScope.flatMap((s) => s.requirementIds));
  const ruleIds = requirements
    .filter((r) => r.type === 'business-rule')
    .map((r) => r.id);
  const planned = engineeringArtifacts.filter(
    (a) =>
      (a.kind !== 'screen' && a.kind !== 'api') ||
      a.requirementIds.some((id) => activeIds.has(id) && id.startsWith('FR-')),
  );
  const extras = activeScope
    .filter((s) => s.relevance !== 'core')
    .map((s) =>
      make(
        `dependency-${s.id}`,
        s.title,
        `poc/dependencies/${s.id}.json`,
        'document',
        'data',
        s.requirementIds.length ? s.requirementIds : ['ASM-003'],
      ),
    );
  return [...planned, ...extras].map((a) => ({
    ...a,
    requirementIds: a.requirementIds.filter(
      (id) =>
        baseline.requirementIds.includes(id) &&
        (activeIds.has(id) ||
          ruleIds.includes(id) ||
          id.startsWith('NFR-') ||
          id === 'ASM-003'),
    ),
  }));
}
export function getBaselineTests(baseline: PocBaseline) {
  return engineeringTests.filter((t) =>
    t.successCriterionId
      ? baseline.successCriteriaIds.includes(t.successCriterionId) &&
        successCriteria.some((c) => c.id === t.successCriterionId)
      : t.requirementIds.every(
          (id) =>
            baseline.requirementIds.includes(id) &&
            scopeItems.some(
              (item) =>
                item.requirementIds.includes(id) &&
                baseline.decisions[item.id]?.decision !== 'excluded',
            ),
        ),
  );
}
export const sandboxPlan = {
  id: 'C2P-POC-001',
  cpu: '2 vCPU',
  memory: '4 GB',
  network: 'Restricted',
  data: 'Synthetic',
  ttl: '24 hours',
  integrations: 'Disabled',
  reviewUrl: 'Reserved for human review · no live environment',
} as const;
export const securityChecks = [
  'Secrets',
  'Dependency baseline',
  'Unsafe configuration',
  'Sandbox network policy',
] as const;
