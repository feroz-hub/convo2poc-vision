import { requirements, clarifications } from './requirements';
import { scopeItems } from './scope';
import { traceNodes, traceEdges } from './traceability';
import { scenarioTestCases, demoEstimate } from './validation';
import type {
  Requirement,
  Clarification,
  ScopeItem,
  TraceNode,
  TraceEdge,
} from '@/types/domain';
import type { ScenarioTestCase } from './validation';
export interface MetricCatalog {
  requirements: Requirement[];
  clarifications: Clarification[];
  scopeItems: ScopeItem[];
  traceNodes: TraceNode[];
  traceEdges: TraceEdge[];
  testCases: ScenarioTestCase[];
}
// Seed coverage requires the complete conversation → requirement → story → screen/API → test path.
// At least one UI screen and API path must each reach a test. Never infer full coverage from node presence.
export function deriveCatalogMetrics(catalog: MetricCatalog) {
  const {
    requirements,
    clarifications,
    scopeItems,
    traceNodes,
    traceEdges,
    testCases,
  } = catalog;
  const nodes = new Map(traceNodes.map((node) => [node.id, node]));
  const successors = (id: string, type: TraceNode['type']) =>
    traceEdges
      .filter(
        (edge) => edge.source === id && nodes.get(edge.target)?.type === type,
      )
      .map((edge) => edge.target);
  const functional = requirements.filter(
    (requirement) => requirement.type === 'functional',
  );
  const mapped = functional.filter((requirement) => {
    const source = requirement.sourceMessageId;
    if (
      !source ||
      nodes.get(source)?.type !== 'conversation' ||
      !successors(source, 'requirement').includes(requirement.id)
    )
      return false;
    return successors(requirement.id, 'user-story').some((story) =>
      (['screen', 'api'] as const).every((type) =>
        successors(story, type).some(
          (artifact) => successors(artifact, 'test').length > 0,
        ),
      ),
    );
  }).length;
  return {
    requirements: requirements.length,
    clarifications: clarifications.length,
    resolvedClarifications: clarifications.filter(
      (item) => item.status === 'resolved',
    ).length,
    includedRequirements: new Set(
      scopeItems
        .filter((item) => item.decision === 'included')
        .flatMap((item) => item.requirementIds),
    ).size,
    mockedDependencies: scopeItems.filter((item) => item.decision === 'mocked')
      .length,
    excludedCapabilities: scopeItems.filter(
      (item) => item.decision === 'excluded',
    ).length,
    mappedRequirements: mapped,
    traceableRequirements: functional.length,
    traceabilityCoverage: functional.length
      ? Math.round((mapped / functional.length) * 100)
      : 0,
    testsPassed: testCases.filter((test) => test.status === 'passed').length,
    testsTotal: testCases.length,
  };
}
export const catalogMetrics = deriveCatalogMetrics({
  requirements,
  clarifications,
  scopeItems,
  traceNodes,
  traceEdges,
  testCases: scenarioTestCases,
});
export const overviewMetrics = [
  {
    id: 'time',
    label: 'Time-to-POC',
    value: `${demoEstimate.timeToPocMinutes} min`,
    detail: 'Illustrative scenario estimate',
    icon: 'time',
    progress: 0,
  },
  {
    id: 'requirements',
    label: 'Requirements Captured',
    value: String(catalogMetrics.requirements),
    detail: 'Records in the canonical scenario',
    icon: 'requirements',
    progress: 100,
  },
  {
    id: 'clarifications',
    label: 'Clarifications Resolved',
    value: `${catalogMetrics.resolvedClarifications} / ${catalogMetrics.clarifications}`,
    detail: 'Questions awaiting demo resolution',
    icon: 'clarifications',
    progress: catalogMetrics.clarifications
      ? (catalogMetrics.resolvedClarifications /
          catalogMetrics.clarifications) *
        100
      : 0,
  },
  {
    id: 'traceability',
    label: 'Traceability Coverage',
    value: `${catalogMetrics.traceabilityCoverage}%`,
    detail: `${catalogMetrics.mappedRequirements} of ${catalogMetrics.traceableRequirements} functional requirements · seed graph`,
    icon: 'traceability',
    progress: catalogMetrics.traceabilityCoverage,
  },
  {
    id: 'tests',
    label: 'Tests Passed',
    value: `${catalogMetrics.testsPassed} / ${catalogMetrics.testsTotal}`,
    detail: 'Planned POC checks · not yet run',
    icon: 'tests',
    progress: catalogMetrics.testsTotal
      ? (catalogMetrics.testsPassed / catalogMetrics.testsTotal) * 100
      : 0,
  },
] as const;
