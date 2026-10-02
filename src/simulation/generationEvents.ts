import type { AgentStatus, BuildCheck } from '@/types/domain';
interface EventBase {
  id: string;
  at: number;
  message: string;
}
export type GenerationEvent = EventBase &
  (
    | {
        type:
          | 'BASELINE_LOADED'
          | 'GENERATION_COMPLETE'
          | 'SANDBOX_STARTED'
          | 'SANDBOX_READY';
      }
    | {
        type: 'AGENT_UPDATED';
        agentId: string;
        status: AgentStatus['status'];
        progress: number;
      }
    | { type: 'ARTIFACT_GENERATED'; agentId: string }
    | {
        type: 'BUILD_CHECK_UPDATED';
        checkId: string;
        status: BuildCheck['status'];
      }
    | { type: 'TEST_GENERATED' | 'TEST_PASSED' }
  );
let sequence = 0;
const event = <T extends Omit<GenerationEvent, 'id'>>(
  value: T,
): GenerationEvent =>
  ({ ...value, id: `gen-${++sequence}` }) as GenerationEvent;
const agent = (
  at: number,
  agentId: string,
  status: AgentStatus['status'],
  progress: number,
  message: string,
) => event({ at, agentId, status, progress, message, type: 'AGENT_UPDATED' });
const outputs = (at: number, agentId: string, message: string) =>
  event({ at, agentId, message, type: 'ARTIFACT_GENERATED' });
const check = (
  at: number,
  checkId: string,
  status: BuildCheck['status'],
  message: string,
) => event({ at, checkId, status, message, type: 'BUILD_CHECK_UPDATED' });
// Stable 80-second engineering schedule. Equal-time events are applied together, including parallel activation.
export const generationEvents: GenerationEvent[] = [
  event({
    at: 0,
    type: 'BASELINE_LOADED',
    message: 'RB-001 accepted · locked scope and success criteria loaded',
  }),
  agent(1000, 'requirements', 'queued', 0, 'Requirement Agent queued'),
  agent(
    4000,
    'requirements',
    'running',
    15,
    'Mapping the approved baseline into an implementation contract',
  ),
  agent(
    7000,
    'requirements',
    'running',
    65,
    'Requirements linked to the proof contract',
  ),
  outputs(
    10000,
    'requirements',
    'Implementation plan and requirement map prepared',
  ),
  agent(
    10000,
    'requirements',
    'completed',
    100,
    'Requirement contract complete',
  ),
  agent(10000, 'architecture', 'queued', 0, 'Architecture Agent queued'),
  agent(12000, 'architecture', 'running', 10, 'Defining application structure'),
  agent(
    16000,
    'architecture',
    'running',
    60,
    'API contract and data model planned',
  ),
  outputs(
    20000,
    'architecture',
    'Architecture, API contract and data model prepared',
  ),
  agent(
    20000,
    'architecture',
    'completed',
    100,
    'Architecture contract complete',
  ),
  ...['ui', 'backend', 'data'].map((id) =>
    agent(
      20000,
      id,
      'queued',
      0,
      `${id === 'ui' ? 'Frontend' : id === 'backend' ? 'Backend' : 'Data'} branch queued`,
    ),
  ),
  ...['ui', 'backend', 'data'].map((id) =>
    agent(
      22000,
      id,
      'running',
      10,
      `${id === 'ui' ? 'Frontend screens' : id === 'backend' ? 'API behavior' : 'Schema and synthetic data'} started in parallel`,
    ),
  ),
  agent(
    29000,
    'ui',
    'running',
    42,
    'Preparing request intake and assignment screens',
  ),
  agent(
    31000,
    'backend',
    'running',
    48,
    'Mapping request, assignment and approval endpoints',
  ),
  agent(
    33000,
    'data',
    'running',
    70,
    'Preparing data entities and synthetic actors',
  ),
  agent(
    37000,
    'ui',
    'running',
    78,
    'Connecting dashboard, history and approval flows',
  ),
  outputs(
    38000,
    'data',
    'Schema, synthetic data and approved dependency plans prepared',
  ),
  agent(38000, 'data', 'completed', 100, 'Data branch complete'),
  agent(
    39000,
    'backend',
    'running',
    82,
    'Applying administrator assignment and P1 approval rules',
  ),
  outputs(42000, 'ui', 'Approved frontend screens prepared'),
  agent(42000, 'ui', 'completed', 100, 'Frontend branch complete'),
  outputs(45000, 'backend', 'Approved request API behavior prepared'),
  agent(
    45000,
    'backend',
    'completed',
    100,
    'Backend branch complete · branches converge',
  ),
  ...['frontend', 'backend', 'schema'].map((id) =>
    check(45000, id, 'running', `${id} validation started`),
  ),
  ...['frontend', 'backend', 'schema'].map((id) =>
    check(46000, id, 'passed', `${id} validation passed`),
  ),
  agent(
    46000,
    'test',
    'queued',
    0,
    'Test Agent queued after branch validation',
  ),
  agent(
    47000,
    'test',
    'running',
    10,
    'Deriving checks from approved success criteria',
  ),
  event({
    at: 50000,
    type: 'TEST_GENERATED',
    message: 'Success criteria mapped to simulated test cases',
  }),
  ...['api', 'ui', 'workflow'].map((id) =>
    check(52000, id, 'running', `${id} checks running`),
  ),
  agent(
    55000,
    'test',
    'running',
    64,
    'Executing requirement-derived POC checks',
  ),
  event({
    at: 60000,
    type: 'TEST_PASSED',
    message: 'All approved success-criterion checks passed',
  }),
  ...['api', 'ui', 'workflow'].map((id) =>
    check(60000, id, 'passed', `${id} checks passed`),
  ),
  agent(60000, 'test', 'completed', 100, 'Test validation complete'),
  agent(60000, 'security', 'queued', 0, 'Security Validation queued'),
  agent(
    62000,
    'security',
    'running',
    10,
    'Checking secrets, dependencies and unsafe configuration',
  ),
  check(
    62000,
    'security',
    'running',
    'Simulated POC security baseline started',
  ),
  agent(
    66000,
    'security',
    'running',
    65,
    'Checking the restricted sandbox network policy',
  ),
  outputs(70000, 'security', 'Simulated security baseline report prepared'),
  check(70000, 'security', 'passed', 'Simulated POC security baseline passed'),
  agent(70000, 'security', 'completed', 100, 'Security validation complete'),
  agent(70000, 'deployment', 'queued', 0, 'Sandbox Preparation queued'),
  event({
    at: 72000,
    type: 'SANDBOX_STARTED',
    message: 'Preparing an isolated synthetic review environment',
  }),
  agent(
    72000,
    'deployment',
    'running',
    15,
    'Packaging the approved POC for human review',
  ),
  check(72000, 'sandbox', 'running', 'Sandbox health check started'),
  agent(
    76000,
    'deployment',
    'running',
    70,
    'Runtime manifest and restricted sandbox configuration prepared',
  ),
  outputs(
    79000,
    'deployment',
    'Sandbox metadata prepared · production integrations disabled',
  ),
  event({
    at: 80000,
    type: 'SANDBOX_READY',
    message: 'C2P-POC-001 simulated sandbox ready',
  }),
  check(80000, 'sandbox', 'passed', 'Sandbox health check passed'),
  agent(80000, 'deployment', 'completed', 100, 'Sandbox preparation complete'),
  event({
    at: 80000,
    type: 'GENERATION_COMPLETE',
    message: 'POC ready for human review · client delivery remains gated',
  }),
];
export const generationDurationMs = 80000;
