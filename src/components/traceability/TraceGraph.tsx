import { memo, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  Controls,
  type Node,
  type Edge,
  type NodeProps,
  type ReactFlowInstance,
} from '@xyflow/react';
import { Check, CircleDashed } from 'lucide-react';
import { traceIcons, linkedTraceIds } from './tracePresentation';
import {
  traceKindLabels,
  traceLaneLabels,
  type TraceRecord,
  type TraceChain,
} from '@/types/traceExplorer';
import '@xyflow/react/dist/style.css';
type EvidenceNode = Node<
  {
    record: TraceRecord;
    selected: boolean;
    dimmed: boolean;
    select: (id: string, featureId: string) => void;
  },
  'evidence'
>;
const EvidenceNodeView = memo(function EvidenceNodeView({
  data,
}: NodeProps<EvidenceNode>) {
  const n = data.record;
  const Icon = traceIcons[n.kind];
  const passed =
    [
      'passed',
      'validated',
      'Confirmed',
      'Captured',
      'Available in POC v1',
    ].includes(n.status) || n.status.includes('Locked');
  return (
    <div
      className={`tx-node tx-${n.kind} ${data.selected ? 'selected' : ''} ${data.dimmed ? 'dimmed' : ''}`}
    >
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <button
        className="nodrag"
        onClick={() => data.select(n.id, n.featureId)}
        aria-pressed={data.selected}
        aria-label={`Inspect ${traceKindLabels[n.kind]} ${n.canonicalId}`}
      >
        <span className="tx-node-type">
          <Icon size={13} aria-hidden="true" />
          {traceKindLabels[n.kind]}
        </span>
        <code>{n.canonicalId}</code>
        <strong>{n.label}</strong>
        <small>
          {passed ? (
            <Check size={11} aria-hidden="true" />
          ) : (
            <CircleDashed size={11} aria-hidden="true" />
          )}
          {n.status}
        </small>
      </button>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  );
});
const nodeTypes = { evidence: EvidenceNodeView };
export function TraceGraph({
  chains,
  overview,
  selectedId,
  onSelect,
}: {
  chains: TraceChain[];
  overview: boolean;
  selectedId: string | null;
  onSelect: (id: string, featureId: string) => void;
}) {
  const canvas = useRef<HTMLDivElement>(null);
  const [flow, setFlow] = useState<ReactFlowInstance<
    EvidenceNode,
    Edge
  > | null>(null);
  const layoutKey = `${overview}:${chains.map((c) => c.featureId).join(',')}`;
  useEffect(() => {
    if (!flow || !canvas.current || typeof ResizeObserver === 'undefined')
      return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        void flow.fitView({ padding: 0.06, duration: 0 });
      });
    });
    observer.observe(canvas.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [flow, layoutKey]);
  const nodes: EvidenceNode[] = [];
  const edges: Edge[] = [];
  for (const [row, chain] of chains.entries()) {
    const linked = linkedTraceIds(chain, selectedId);
    const records = overview
      ? [
          chain.nodes.find((n) => n.kind === 'conversation'),
          chain.nodes.find(
            (n) => n.kind === 'requirement' && n.canonicalId.startsWith('FR-'),
          ),
          chain.nodes.find((n) => n.kind === 'scope'),
          chain.nodes.find((n) => n.kind === 'feature'),
          chain.nodes.find((n) => n.kind === 'test'),
        ].filter((n): n is TraceRecord => !!n)
      : chain.nodes;
    const counts: Record<number, number> = {};
    for (const n of records) {
      const ordinal = counts[n.lane] ?? 0;
      counts[n.lane] = ordinal + 1;
      nodes.push({
        id: `${chain.featureId}/${n.id}`,
        type: 'evidence',
        position: { x: n.lane * 250, y: overview ? row * 166 : ordinal * 155 },
        data: {
          record: n,
          selected: n.id === selectedId,
          dimmed: !overview && !linked.has(n.id),
          select: onSelect,
        },
      });
    }
    const connections = overview
      ? records.slice(1).map((n, i) => ({
          id: `overview-${i}`,
          source: records[i]!.id,
          target: n.id,
          label:
            n.kind === 'feature'
              ? 'Via artifacts'
              : n.kind === 'test'
                ? `${chain.nodes.filter((node) => node.kind === 'test').length} mapped checks`
                : '',
        }))
      : chain.edges;
    for (const e of connections)
      edges.push({
        id: `${chain.featureId}/${e.id}`,
        source: `${chain.featureId}/${e.source}`,
        target: `${chain.featureId}/${e.target}`,
        type: 'smoothstep',
        animated: false,
        className:
          selectedId && linked.has(e.source) && linked.has(e.target)
            ? 'tx-edge selected'
            : 'tx-edge',
        label: overview ? e.label : undefined,
        style: {
          strokeWidth:
            selectedId && linked.has(e.source) && linked.has(e.target)
              ? 2
              : 1.3,
        },
      });
  }
  return (
    <>
      <div className="tx-lanes" aria-label="Traceability lanes">
        {traceLaneLabels.map((lane, i) => (
          <span key={lane}>
            <b>0{i + 1}</b>
            {lane}
          </span>
        ))}
      </div>
      <div
        ref={canvas}
        className={`tx-canvas ${overview ? 'overview' : ''}`}
        aria-label="Interactive traceability graph"
      >
        <ReactFlow
          key={overview ? 'overview' : chains[0]?.featureId}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onInit={setFlow}
          fitView
          fitViewOptions={{ padding: 0.06 }}
          minZoom={0.3}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          panOnScroll={false}
          zoomOnScroll={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <p className="tx-graph-note">
        {overview
          ? 'Three representative workflows. Select a node or workflow to reveal every evidence link.'
          : 'Select a node to highlight its upstream intent and downstream validation.'}{' '}
        Pan and zoom within the graph. No editable connections.
      </p>
      <details className="tx-accessible">
        <summary>Accessible evidence chain & node selection</summary>
        {chains.map((chain) => (
          <section key={chain.featureId}>
            <h3>{chain.label}</h3>
            <ol>
              {chain.nodes.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => onSelect(n.id, chain.featureId)}
                    aria-pressed={selectedId === n.id}
                  >
                    {traceKindLabels[n.kind]} · {n.canonicalId} · {n.label} ·{' '}
                    {n.status}
                  </button>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </details>
    </>
  );
}
