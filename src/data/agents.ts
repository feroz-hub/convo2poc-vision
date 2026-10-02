import type { AgentStatus, BuildCheck } from '@/types/domain';
export const agents: AgentStatus[] = [
  {
    id: 'requirements',
    name: 'Requirement Agent',
    description: 'Loads the approved baseline.',
    status: 'waiting',
    progress: 0,
  },
  {
    id: 'architecture',
    name: 'Architecture Agent',
    description: 'Plans the POC architecture.',
    status: 'waiting',
    progress: 0,
  },
  {
    id: 'ui',
    name: 'UI Agent',
    description: 'Prepares the frontend artifacts.',
    status: 'waiting',
    progress: 0,
  },
  {
    id: 'backend',
    name: 'Backend Agent',
    description: 'Simulates API contract generation.',
    status: 'waiting',
    progress: 0,
  },
  {
    id: 'data',
    name: 'Data Agent',
    description: 'Prepares synthetic data.',
    status: 'waiting',
    progress: 0,
  },
  {
    id: 'test',
    name: 'Test Agent',
    description: 'Simulates requirement validation.',
    status: 'waiting',
    progress: 0,
  },
  {
    id: 'security',
    name: 'Security Validation',
    description: 'Reviews the sandbox baseline.',
    status: 'waiting',
    progress: 0,
  },
  {
    id: 'deployment',
    name: 'Sandbox Preparation',
    description: 'Packages the simulated POC for isolated human review.',
    status: 'waiting',
    progress: 0,
  },
];
export const buildChecks: BuildCheck[] = [
  ['frontend', 'Frontend Build'],
  ['backend', 'Backend Build'],
  ['schema', 'Schema Validation'],
  ['api', 'API Smoke Tests'],
  ['ui', 'UI Smoke Tests'],
  ['workflow', 'Workflow Tests'],
  ['security', 'Security Baseline'],
  ['sandbox', 'Sandbox Health'],
].map(([id, label]) => ({ id: id!, label: label!, status: 'waiting' }));
