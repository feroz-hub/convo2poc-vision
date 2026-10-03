import { useDemoTarget } from '@/components/demo/demoTargets';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GitBranch,
  ShieldCheck,
  Search,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import {
  selectTraceabilityModel,
  selectTraceChain,
} from '@/store/traceabilitySelectors';
import { TraceGraph } from '@/components/traceability/TraceGraph';
import { TraceInspector } from '@/components/traceability/TraceInspector';
import { scopeItems } from '@/data/scope';
import { selectScopeDecision } from '@/store/scopeSelectors';
import '@/styles/traceability.css';
export function TraceabilityPage() {
  const traceTarget = useDemoTarget('trace-p1-path');
  const state = useDemoStore();
  const view = state.traceView;
  const setTraceView = state.setTraceView;
  const [params, setParams] = useSearchParams();
  const requestedFeature = params.get('feature');
  const requestedId = params.get('selected');
  useEffect(() => {
    if (requestedFeature)
      setTraceView({
        workflow: requestedFeature,
        selectedId: requestedId,
      });
  }, [requestedFeature, requestedId, setTraceView]);
  const model = selectTraceabilityModel(state);
  const filtered = model.chains.filter(
    (c) =>
      (view.filter === 'all' ||
        (view.filter === 'complete' ? c.complete : !c.complete)) &&
      `${c.label} ${c.nodes.map((n) => `${n.canonicalId} ${n.label} ${n.description}`).join(' ')}`
        .toLowerCase()
        .includes(view.search.toLowerCase().trim()),
  );
  const overview = view.workflow === 'overview';
  const selectedChain = selectTraceChain(
    state,
    overview ? 'assignment' : view.workflow,
  );
  const displayed = overview
    ? filtered.filter((c) =>
        ['create', 'assignment', 'approval'].includes(c.featureId),
      )
    : filtered.filter((c) => c.featureId === view.workflow);
  const graphChains =
    overview && displayed.length === 0 ? filtered.slice(0, 3) : displayed;
  const selectedRecord = selectedChain.nodes.find(
    (n) => n.id === view.selectedId,
  );
  const select = (id: string, featureId: string) => {
    setTraceView({ workflow: featureId, selectedId: id });
    setParams({ feature: featureId, selected: id }, { replace: true });
    if (window.matchMedia('(max-width: 1200px)').matches)
      requestAnimationFrame(() => {
        const inspector = document.getElementById('trace-inspector');
        inspector?.focus({ preventScroll: true });
        inspector?.scrollIntoView({ block: 'start', behavior: 'auto' });
      });
  };
  const h = model.health;
  return (
    <div className="trace-page page-content">
      <header className="tx-header">
        <div>
          <span className="tx-kicker">
            <GitBranch size={15} />
            END-TO-END EVIDENCE
          </span>
          <h1>Traceability Explorer</h1>
          <p>
            Trace client intent from conversation to implementation and
            validation.
          </p>
        </div>
        <span className="tx-baseline">
          <ShieldCheck size={16} />
          {state.pocBaseline
            ? `${state.pocBaseline.id} · ${state.pocBaseline.version} · Locked`
            : 'Canonical map · baseline pending'}
        </span>
      </header>
      <dl className="tx-summary" aria-label="Derived traceability health">
        {[
          ['Requirements Traced', `${h.requirements}/${h.requirementsTotal}`],
          ['Features Traced', `${h.features}/${h.featuresTotal}`],
          ['Tests Mapped', `${h.tests}/${h.testsTotal}`],
          ['Source Evidence', `${h.sources}/${h.featuresTotal}`],
          ['Unmapped Items', h.unmapped],
          ['Overall Traceability', `${h.coverage}%`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="tx-health-note">
        Core-workflow evidence · {h.testsPassed}/{h.testsTotal} canonical checks
        passed. Complete chains require captured sources, consultant review, a
        locked baseline, validated artifacts and a ready working POC. Mapping is
        separate from execution.
      </p>
      <section
        className="tx-story"
        aria-label="Client intent to validated feature"
      >
        <span>Client intent</span>
        <ArrowRight />
        <span>Governed baseline</span>
        <ArrowRight />
        <span>Working feature</span>
        <ArrowRight />
        <span>Evidence-backed validation</span>
      </section>
      <div className="tx-workspace">
        <section
          {...traceTarget}
          className="tx-panel tx-explorer"
          aria-labelledby="evidence-map-title"
        >
          <header className="tx-map-header">
            <div>
              <span className="tx-kicker">WHY THIS FEATURE EXISTS</span>
              <h2 id="evidence-map-title">
                {overview
                  ? 'Connected intent. Visible proof.'
                  : selectedChain.label}
              </h2>
            </div>
            <button
              className="tx-quiet"
              onClick={() => {
                setTraceView({
                  workflow: 'overview',
                  selectedId: null,
                  search: '',
                  filter: 'all',
                });
                setParams({}, { replace: true });
              }}
            >
              <RotateCcw size={14} />
              Reset view
            </button>
          </header>
          <div className="tx-toolbar">
            <label>
              Workflow
              <select
                value={view.workflow}
                onChange={(e) => {
                  setTraceView({
                    workflow: e.target.value,
                    selectedId: null,
                  });
                  setParams(
                    e.target.value === 'overview'
                      ? {}
                      : { feature: e.target.value },
                    { replace: true },
                  );
                }}
              >
                <option value="overview">
                  Overview · representative chains
                </option>
                {model.chains.map((c) => (
                  <option value={c.featureId} key={c.featureId}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="tx-search">
              <Search size={14} />
              <input
                aria-label="Search evidence"
                placeholder="Search ID, statement or feature…"
                value={view.search}
                onChange={(e) => setTraceView({ search: e.target.value })}
              />
            </label>
            <label>
              Health
              <select
                value={view.filter}
                onChange={(e) =>
                  setTraceView({
                    filter: e.target.value as typeof view.filter,
                  })
                }
              >
                <option value="all">All chains</option>
                <option value="complete">Complete</option>
                <option value="gaps">Needs review</option>
              </select>
            </label>
          </div>
          {graphChains.length ? (
            <TraceGraph
              chains={graphChains}
              overview={overview}
              selectedId={view.selectedId}
              onSelect={select}
            />
          ) : (
            <div className="tx-empty">
              <Search size={24} />
              <h3>No matching evidence chains</h3>
              <p>Change the workflow, search or health filter.</p>
            </div>
          )}
          <div
            className="tx-workflow-strip"
            aria-label="Explore core workflows"
          >
            {filtered.map((c) => (
              <button
                key={c.featureId}
                aria-pressed={view.workflow === c.featureId}
                onClick={() => {
                  setTraceView({
                    workflow: c.featureId,
                    selectedId: null,
                  });
                  setParams({ feature: c.featureId }, { replace: true });
                }}
              >
                <code>
                  {
                    c.nodes.find(
                      (n) =>
                        n.kind === 'requirement' &&
                        n.canonicalId.startsWith('FR-'),
                    )?.canonicalId
                  }
                </code>
                <strong>{c.label}</strong>
                <small>
                  {c.complete ? '✓ Complete chain' : '○ Review pending'}
                </small>
              </button>
            ))}
          </div>
        </section>
        <TraceInspector
          chain={selectedChain}
          record={selectedRecord}
          onSelect={select}
        />
      </div>
      <section className="tx-panel tx-boundary">
        <header>
          <h2>Traceability has a deliberate boundary</h2>
          <p>
            Health covers the scoped core workflows. Simulated dependencies and
            deferred capabilities retain their scope decisions.
          </p>
        </header>
        <div>
          {scopeItems
            .filter((s) => s.relevance !== 'core')
            .map((s) => (
              <Link key={s.id} to={`/scope?selected=${s.id}`}>
                <span>{s.title}</span>
                <small>{selectScopeDecision(state, s)} ↗</small>
              </Link>
            ))}
        </div>
        <p>
          No generated repository, live integrations or production validation
          are implied. <Link to="/preview">Return to POC review ↗</Link>
        </p>
      </section>
    </div>
  );
}
