import { useDemoTarget } from '@/components/demo/demoTargets';
import { memo } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  Controls,
  type Node,
  type NodeProps,
  type Edge,
} from '@xyflow/react';
import { useReducedMotion } from 'framer-motion';
import {
  Check,
  CircleDot,
  Clock3,
  Pause,
  ShieldAlert,
  LockKeyhole,
  Network,
  ArrowDown,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import type { AgentStatus } from '@/types/domain';
import '@xyflow/react/dist/style.css';
function focusInspector() {
  if (window.matchMedia('(max-width: 1200px)').matches)
    requestAnimationFrame(() => {
      const inspector = document.getElementById('generation-inspector-anchor');
      inspector?.focus({ preventScroll: true });
      inspector?.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
}
const agentStateLabels: Record<AgentStatus['status'], string> = {
  waiting: 'Waiting',
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  paused: 'Paused',
};
export function AgentStateBadge({ status }: { status: AgentStatus['status'] }) {
  const Icon =
    status === 'completed'
      ? Check
      : status === 'running'
        ? CircleDot
        : status === 'paused'
          ? Pause
          : status === 'failed'
            ? ShieldAlert
            : Clock3;
  return (
    <span className={`gen-status ${status}`}>
      <Icon size={13} aria-hidden="true" />
      {agentStateLabels[status]}
    </span>
  );
}
type AgentNode = Node<
  {
    agentId: string;
    label: string;
    status: AgentStatus['status'];
    progress: number;
    selected: boolean;
    special?: 'baseline' | 'review';
  },
  'engineering'
>;
const EngineeringNode = memo(function EngineeringNode({
  data,
}: NodeProps<AgentNode>) {
  const select = useDemoStore((s) => s.selectGenerationAgent);
  return (
    <div
      className={`gen-node ${data.status} ${data.selected ? 'selected' : ''}`}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} />
      {data.special ? (
        <div className="gen-node-content">
          <LockKeyhole size={16} />
          <strong>{data.label}</strong>
          <small>
            {data.special === 'baseline'
              ? 'Approved scope · LOCKED'
              : data.status === 'completed'
                ? 'Ready for human review'
                : 'Human review gate'}
          </small>
        </div>
      ) : (
        <button
          className="gen-node-content"
          onClick={() => {
            select(data.agentId);
            focusInspector();
          }}
          aria-pressed={data.selected}
          aria-label={`Inspect ${data.label}: ${agentStateLabels[data.status]}`}
        >
          <Network size={16} aria-hidden="true" />
          <strong>{data.label}</strong>
          <AgentStateBadge status={data.status} />
          <progress
            max={100}
            value={data.progress}
            aria-label={`${data.label} progress`}
          />
        </button>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
});
const nodeTypes = { engineering: EngineeringNode };
const positions: Record<string, { x: number; y: number }> = {
  baseline: { x: 235, y: 0 },
  requirements: { x: 235, y: 100 },
  architecture: { x: 235, y: 225 },
  ui: { x: 0, y: 365 },
  backend: { x: 235, y: 365 },
  data: { x: 470, y: 365 },
  test: { x: 235, y: 510 },
  security: { x: 235, y: 635 },
  deployment: { x: 235, y: 760 },
  review: { x: 235, y: 885 },
};
const connections = [
  ['baseline', 'requirements'],
  ['requirements', 'architecture'],
  ['architecture', 'ui'],
  ['architecture', 'backend'],
  ['architecture', 'data'],
  ['ui', 'test'],
  ['backend', 'test'],
  ['data', 'test'],
  ['test', 'security'],
  ['security', 'deployment'],
  ['deployment', 'review'],
];
export function AgentOrchestrationGraph() {
  const demoTarget = useDemoTarget('generation-parallel');
  const state = useDemoStore();
  const reduced = useReducedMotion();
  const nodes: AgentNode[] = [
    {
      id: 'baseline',
      type: 'engineering',
      position: positions.baseline!,
      data: {
        agentId: 'baseline',
        label: 'RB-001 · POC v1',
        status: 'completed',
        progress: 100,
        selected: false,
        special: 'baseline',
      },
    },
    ...state.agentStatuses.map((a) => ({
      id: a.id,
      type: 'engineering' as const,
      position: positions[a.id]!,
      data: {
        agentId: a.id,
        label: a.name,
        status: a.status,
        progress: a.progress,
        selected: state.generation.selectedAgentId === a.id,
      },
    })),
    {
      id: 'review',
      type: 'engineering',
      position: positions.review!,
      data: {
        agentId: 'review',
        label: 'POC Human Review',
        status:
          state.generation.status === 'completed' ? 'completed' : 'waiting',
        progress: 0,
        selected: false,
        special: 'review',
      },
    },
  ];
  const edges: Edge[] = connections.map(([source, target]) => {
    const running =
      state.generation.status === 'running' &&
      nodes.find((n) => n.id === target)?.data.status === 'running';
    return {
      id: `${source}-${target}`,
      source: source!,
      target: target!,
      type: 'smoothstep',
      animated: running && !reduced,
      className: running ? 'gen-edge-active' : 'gen-edge',
      style: { strokeWidth: running ? 2.5 : 1.5 },
    };
  });
  return (
    <section
      {...demoTarget}
      className="gen-panel gen-orchestration"
      aria-labelledby="orchestration-title"
    >
      <header>
        <div>
          <span className="gen-kicker">
            Approved baseline → engineering workflow
          </span>
          <h2 id="orchestration-title">Agent orchestration</h2>
        </div>
        <span className="gen-parallel-label">3 parallel branches</span>
      </header>
      <div className="gen-graph">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.45}
          maxZoom={1.4}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          onNodeClick={(_, node) => {
            if (state.agentStatuses.some((a) => a.id === node.id))
              state.selectGenerationAgent(node.id);
          }}
          panOnScroll={false}
          zoomOnScroll={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <div className="gen-mobile-pipeline">
        <p>
          <LockKeyhole size={15} /> RB-001 · approved baseline
        </p>
        {state.agentStatuses.map((a, i) => (
          <div key={a.id}>
            <span className="gen-pipeline-connector">
              {i >= 2 && i <= 4 ? (
                `Parallel engineering · branch ${i - 1} of 3`
              ) : i === 5 ? (
                'Branches converge at tests'
              ) : (
                <ArrowDown size={14} />
              )}
            </span>
            <button
              onClick={() => {
                state.selectGenerationAgent(a.id);
                focusInspector();
              }}
              aria-pressed={state.generation.selectedAgentId === a.id}
            >
              <strong>{a.name}</strong>
              <AgentStateBadge status={a.status} />
              <progress
                value={a.progress}
                max={100}
                aria-label={`${a.name} progress`}
              />
              <small>
                {a.progress}% · {a.description}
              </small>
            </button>
          </div>
        ))}
      </div>
      <details className="gen-graph-summary">
        <summary>Accessible pipeline summary & agent selection</summary>
        <p>
          Requirements → Architecture → UI, Backend and Data in parallel → Tests
          → Security → Sandbox → Human review.
        </p>
        <div>
          {state.agentStatuses.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                state.selectGenerationAgent(a.id);
                focusInspector();
              }}
              aria-pressed={state.generation.selectedAgentId === a.id}
            >
              {a.name} · {agentStateLabels[a.status]} · {a.progress}%
            </button>
          ))}
        </div>
      </details>
      <footer>
        Logical engineering responsibilities · simulation only · no separate
        models implied
      </footer>
    </section>
  );
}
