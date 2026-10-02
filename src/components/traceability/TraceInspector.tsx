import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { selectPreviewReady } from '@/store/previewSelectors';
import {
  traceKindLabels,
  type TraceChain,
  type TraceRecord,
} from '@/types/traceExplorer';
import { traceIcons } from './tracePresentation';
export function TraceInspector({
  chain,
  record,
  onSelect,
}: {
  chain: TraceChain;
  record: TraceRecord | undefined;
  onSelect: (id: string, featureId: string) => void;
}) {
  const state = useDemoStore();
  const Icon = record ? traceIcons[record.kind] : Fingerprint;
  const neighbors = record
    ? chain.nodes.filter((n) =>
        chain.edges.some(
          (e) =>
            (e.source === record.id && e.target === n.id) ||
            (e.target === record.id && e.source === n.id),
        ),
      )
    : [];
  const url = !record
    ? null
    : record.kind === 'conversation'
      ? `/session?source=${record.canonicalId}`
      : record.kind === 'clarification'
        ? `/clarifications?selected=${record.canonicalId}`
        : record.kind === 'requirement' || record.kind === 'criterion'
          ? `/requirements?selected=${record.kind === 'criterion' ? chain.nodes.find((n) => n.kind === 'requirement' && n.canonicalId.startsWith('FR-'))?.canonicalId : record.canonicalId}`
          : record.kind === 'scope'
            ? `/scope?selected=${record.canonicalId}`
            : record.kind === 'feature'
              ? '/preview'
              : '/generation';
  const go = () => {
    if (!record) return;
    if (record.kind === 'artifact' || record.kind === 'test')
      state.selectGenerationArtifact(record.canonicalId);
    if (record.kind === 'feature')
      state.performPocAction({ type: 'feature', id: record.featureId });
  };
  return (
    <aside
      className="tx-panel tx-inspector"
      aria-label="Traceability node inspector"
      id="trace-inspector"
      tabIndex={-1}
    >
      <header>
        <span className="tx-kicker">
          <Fingerprint size={14} aria-hidden="true" /> EVIDENCE INSPECTOR
        </span>
        <h2>
          <Icon size={19} aria-hidden="true" />
          {record
            ? traceKindLabels[record.kind]
            : 'Select a point in the chain'}
        </h2>
      </header>
      {record ? (
        <>
          <div className="tx-inspector-content">
            <code className="tx-id">{record.canonicalId}</code>
            <h3>{record.label}</h3>
            <span className="tx-status">{record.status}</span>
            {record.kind === 'conversation' ? (
              <blockquote>{record.description}</blockquote>
            ) : (
              <p className={record.kind === 'artifact' ? 'tx-path' : ''}>
                {record.description}
              </p>
            )}
            {record.kind === 'conversation' && (
              <small>
                Exact canonical workshop record. Capture status reflects
                playback.
              </small>
            )}
            {record.kind === 'test' && (
              <small>
                Deterministic simulated validation · not production test
                certification.
              </small>
            )}
            {record.kind === 'requirement' && (
              <p>
                Canonical baseline input. This explorer does not edit
                requirements.
              </p>
            )}
            {url &&
              (record.kind !== 'feature' || selectPreviewReady(state)) && (
                <Link className="tx-source-link" to={url} onClick={go}>
                  {record.kind === 'conversation'
                    ? 'View conversation evidence'
                    : record.kind === 'clarification'
                      ? 'Review clarification'
                      : record.kind === 'scope'
                        ? 'View locked scope decision'
                        : record.kind === 'feature'
                          ? 'Open working POC evidence'
                          : record.kind === 'artifact' || record.kind === 'test'
                            ? 'Inspect generation evidence'
                            : 'Inspect requirement'}
                  <ArrowUpRight size={14} />
                </Link>
              )}
            {record.kind === 'feature' && !selectPreviewReady(state) && (
              <Link to="/generation">
                Complete generation before POC review ↗
              </Link>
            )}
            <h4>Connected evidence</h4>
            <ul className="tx-connections">
              {neighbors.map((n) => (
                <li key={n.id}>
                  <button onClick={() => onSelect(n.id, chain.featureId)}>
                    <small>{traceKindLabels[n.kind]}</small>
                    <strong>{n.canonicalId}</strong>
                    <span>{n.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="tx-inspector-content">
          <p>
            Follow a statement into a requirement, then inspect the scope,
            generated feature and test that preserve its intent.
          </p>
          <button
            className="tx-primary"
            onClick={() => onSelect('requirement:FR-007', 'approval')}
          >
            Explore P1 approval ↗
          </button>
        </div>
      )}
      <div className="tx-chain-health">
        <h3>
          {chain.complete ? (
            <CheckCircle2 size={15} />
          ) : (
            <AlertCircle size={15} />
          )}
          {chain.complete
            ? 'Complete evidence chain'
            : 'Evidence chain needs review'}
        </h3>
        <p>{chain.label}</p>
        {chain.issues.length > 0 ? (
          <ul>
            {chain.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        ) : (
          <p>
            Client evidence → approved scope → validated implementation →
            passing canonical tests.
          </p>
        )}
        <span>RB-001 references remain immutable.</span>
      </div>
    </aside>
  );
}
