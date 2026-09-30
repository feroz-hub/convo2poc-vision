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
    name: 'Scope / Architecture Agent',
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
    name: 'Security Check',
    description: 'Reviews the sandbox baseline.',
    status: 'waiting',
    progress: 0,
  },
  {
    id: 'deployment',
    name: 'Deployment Agent',
    description: 'Simulates sandbox availability.',
    status: 'waiting',
    progress: 0,
  },
];
export const buildChecks: BuildCheck[] = [
  {
    id: 'build',
    label: 'Production build',
    status: 'waiting',
  },
  {
    id: 'ui',
    label: 'UI validation',
    status: 'waiting',
  },
  {
    id: 'api',
    label: 'API contract validation',
    status: 'waiting',
  },
  {
    id: 'tests',
    label: 'Requirement tests',
    status: 'waiting',
  },
  {
    id: 'security',
    label: 'Security baseline',
    status: 'waiting',
  },
];
