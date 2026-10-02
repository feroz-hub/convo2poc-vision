import { Link } from 'react-router-dom';
import {
  Check,
  Clock3,
  CircleDot,
  TriangleAlert,
  ShieldCheck,
  Server,
  FileBox,
  ArrowDown,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { selectGenerationSummary } from '@/store/generationSelectors';
import {
  getBaselineArtifacts,
  getBaselineTests,
  securityChecks,
  sandboxPlan,
} from '@/data/generation';
import { successCriteria } from '@/data/scope';
import { requirements } from '@/data/requirements';
import { generationEvents } from '@/simulation/generationEvents';
import { formatGenerationTime } from '@/simulation/generationEngine';
import { artifacts } from '@/data/traceability';
import { RequirementLinks } from './AgentInspector';
export function GenerationActivityFeed() {
  const state = useDemoStore();
  const events = generationEvents.filter((e) =>
    state.generation.visibleEventIds.includes(e.id),
  );
  return (
    <section className="gen-panel" aria-labelledby="generation-activity">
      <header>
        <div>
          <span className="gen-kicker">
            Deterministic engineering milestones
          </span>
          <h2 id="generation-activity">Live activity</h2>
        </div>
        <span>{events.length} events</span>
      </header>
      <ol className="gen-activity">
        {events.length ? (
          [...events].reverse().map((e) => (
            <li key={e.id}>
              <time>{formatGenerationTime(e.at)}</time>
              <span>
                {e.message}
                {e.type === 'TEST_GENERATED' && state.pocBaseline
                  ? ` · ${getBaselineTests(state.pocBaseline).length} checks / ${state.pocBaseline.successCriteriaIds.length} criteria`
                  : ''}
              </span>
            </li>
          ))
        ) : (
          <li>
            <time>00:00</time>
            <span>
              Approved baseline ready. Start generation to begin the engineering
              workflow.
            </span>
          </li>
        )}
      </ol>
      <footer>
        Elapsed simulation timestamps · no terminal output or real execution
      </footer>
    </section>
  );
}
export function ValidationPipeline() {
  const state = useDemoStore();
  const summary = selectGenerationSummary(state);
  return (
    <section className="gen-panel" aria-labelledby="validation-pipeline">
      <header>
        <div>
          <span className="gen-kicker">Build → test → validate</span>
          <h2 id="validation-pipeline">Validation pipeline</h2>
        </div>
        <ShieldCheck size={21} />
      </header>
      <ul className="gen-validation">
        {state.buildChecks.map((c) => {
          const Icon =
            c.status === 'passed'
              ? Check
              : c.status === 'running'
                ? CircleDot
                : c.status === 'failed'
                  ? TriangleAlert
                  : Clock3;
          return (
            <li key={c.id}>
              <span>{c.label}</span>
              <strong className={`gen-check ${c.status}`}>
                <Icon size={14} aria-hidden="true" />
                {c.status === 'passed' ? 'PASS' : c.status.toUpperCase()}
              </strong>
            </li>
          );
        })}
      </ul>
      <footer>
        {summary.testsPassed}/{summary.testsTotal} simulated checks passed ·
        validation precedes sandbox review
      </footer>
    </section>
  );
}
export function ArtifactExplorer() {
  const state = useDemoStore();
  const artifacts = state.pocBaseline
    ? getBaselineArtifacts(state.pocBaseline)
    : [];
  const visible = artifacts.filter(
    (a) => state.generation.artifactStatuses[a.id],
  );
  const folders = [
    ...new Set(visible.map((a) => a.path.split('/').slice(0, -1).join('/'))),
  ];
  return (
    <section className="gen-panel" aria-labelledby="artifact-explorer">
      <header>
        <div>
          <span className="gen-kicker">Traceable simulated outputs</span>
          <h2 id="artifact-explorer">Artifact explorer</h2>
        </div>
        <span>
          {visible.length}/{artifacts.length} prepared
        </span>
      </header>
      {visible.length ? (
        <div className="gen-artifact-tree">
          {folders.map((folder) => (
            <div key={folder}>
              <h3>
                <FileBox size={15} />
                {folder}/
              </h3>
              <ul>
                {visible
                  .filter(
                    (a) =>
                      a.path.startsWith(`${folder}/`) &&
                      a.path.split('/').slice(0, -1).join('/') === folder,
                  )
                  .map((a) => (
                    <li key={a.id}>
                      <button
                        onClick={() => {
                          state.selectGenerationArtifact(a.id);
                          document
                            .getElementById('generation-inspector-anchor')
                            ?.focus({ preventScroll: true });
                          document
                            .getElementById('generation-inspector-anchor')
                            ?.scrollIntoView({
                              block: 'nearest',
                              behavior: 'auto',
                            });
                        }}
                        aria-label={`Inspect ${a.path.split('/').at(-1)}: ${state.generation.artifactStatuses[a.id]}`}
                        aria-pressed={
                          state.generation.selectedArtifactId === a.id
                        }
                      >
                        <code>{a.path.split('/').at(-1)}</code>
                        <span>{state.generation.artifactStatuses[a.id]}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="gen-empty">
          Artifacts appear after their producing stage runs. The approved
          contract is visible in the agent inspector.
        </p>
      )}
    </section>
  );
}
export function ApplicationPlan() {
  const state = useDemoStore();
  const plan = state.pocBaseline ? getBaselineArtifacts(state.pocBaseline) : [];
  return (
    <section className="gen-panel" aria-labelledby="application-plan">
      <header>
        <div>
          <span className="gen-kicker">Approved implementation contract</span>
          <h2 id="application-plan">Application plan</h2>
        </div>
      </header>
      <div className="gen-application-plan">
        {(['screen', 'api', 'data'] as const).map((kind) => (
          <div key={kind}>
            <h3>
              {kind === 'screen'
                ? 'Frontend'
                : kind === 'api'
                  ? 'Backend'
                  : 'Data & simulated dependencies'}
            </h3>
            <ul>
              {plan
                .filter((a) =>
                  kind === 'data' ? a.generatedBy === 'data' : a.kind === kind,
                )
                .map((a) => (
                  <li key={a.id}>
                    <span>{a.label}</span>
                    <small>
                      {state.generation.artifactStatuses[a.id]
                        ? 'Prepared'
                        : 'Planned'}
                    </small>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <footer>
        Scope decisions determine this plan · implementation behavior is
        simulated
      </footer>
    </section>
  );
}
export function TestSummary() {
  const state = useDemoStore();
  const tests = state.pocBaseline ? getBaselineTests(state.pocBaseline) : [];
  const summary = selectGenerationSummary(state);
  return (
    <section className="gen-panel" aria-labelledby="test-summary">
      <header>
        <div>
          <span className="gen-kicker">
            Requirement → Success criterion → Test
          </span>
          <h2 id="test-summary">Success-criterion validation</h2>
        </div>
        <strong>
          {summary.testsPassed}/{tests.length} PASS
        </strong>
      </header>
      <p className="gen-test-breakdown">
        {(['API', 'UI', 'Workflow'] as const).map((category) => {
          const group = tests.filter((t) => t.category === category);
          return (
            <span key={category}>
              {category}{' '}
              {
                group.filter(
                  (t) => state.generation.testResults[t.id] === 'passed',
                ).length
              }
              /{group.length}
            </span>
          );
        })}
      </p>
      <div className="gen-test-contract">
        {[
          ...successCriteria
            .filter((c) => state.pocBaseline?.successCriteriaIds.includes(c.id))
            .map((c) => ({
              ...c,
              tests: tests.filter((t) => t.successCriterionId === c.id),
            })),
          ...tests
            .filter((t) => !t.successCriterionId)
            .map((t) => ({
              id: t.requirementIds[0]!,
              requirementIds: t.requirementIds,
              tests: [t],
            })),
        ].map((c) => (
          <article key={c.id}>
            <div>
              <code>{c.id}</code>
              <p>
                {
                  requirements.find((r) => r.id === c.requirementIds[0])
                    ?.description
                }
              </p>
              <RequirementLinks ids={c.requirementIds} />
            </div>
            <ArrowDown size={17} aria-hidden="true" />
            <ul>
              {c.tests.map((t) => (
                <li key={t.id}>
                  <code>{t.id}</code>
                  <span>{t.label}</span>
                  <strong>
                    {state.generation.testResults[t.id] === 'passed'
                      ? '✓ PASS'
                      : state.generation.testResults[t.id] === 'failed'
                        ? '✕ FAIL'
                        : state.generation.testResults[t.id] === 'generated'
                          ? '○ Generated'
                          : '○ Planned'}
                  </strong>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <footer>
        Current-v1 checks derived from{' '}
        {state.pocBaseline?.successCriteriaIds.length} approved criteria
        {tests.some((t) => !t.successCriterionId) &&
          ` and ${tests.filter((t) => !t.successCriterionId).length} requirement checks`}
        . Future P2 change test TC-016 remains deferred.
      </footer>
    </section>
  );
}
export function SecurityAndSandbox() {
  const state = useDemoStore();
  const status = state.buildChecks.find((c) => c.id === 'security')!.status;
  return (
    <div className="gen-lower-grid">
      <section className="gen-panel">
        <header>
          <div>
            <span className="gen-kicker">Simulated POC security baseline</span>
            <h2>Security validation</h2>
          </div>
          <ShieldCheck size={21} />
        </header>
        <ul className="gen-validation">
          {securityChecks.map((c) => (
            <li key={c}>
              <span>{c}</span>
              <strong>
                {status === 'passed'
                  ? '✓ PASS'
                  : status === 'running'
                    ? '● Running'
                    : status === 'failed'
                      ? '✕ Failed'
                      : '○ Waiting'}
              </strong>
            </li>
          ))}
        </ul>
        <footer>
          Illustrative checks · not production security certification
        </footer>
      </section>
      <section className="gen-panel">
        <header>
          <div>
            <span className="gen-kicker">
              Isolated review environment · simulation
            </span>
            <h2>Sandbox preparation</h2>
          </div>
          <Server size={21} />
        </header>
        <dl className="gen-sandbox">
          {[
            ['Environment', sandboxPlan.id],
            ['Status', state.generation.sandbox],
            ['CPU', sandboxPlan.cpu],
            ['Memory', sandboxPlan.memory],
            ['Network', sandboxPlan.network],
            ['Data', sandboxPlan.data],
            ['TTL', sandboxPlan.ttl],
            ['Production integrations', sandboxPlan.integrations],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <footer>{sandboxPlan.reviewUrl}</footer>
      </section>
    </div>
  );
}
export function HumanReviewGate() {
  const state = useDemoStore();
  const summary = selectGenerationSummary(state);
  const ready = summary.humanReviewReady;
  return (
    <section
      className={`gen-review-gate ${ready ? 'ready' : ''}`}
      aria-labelledby="human-review-title"
    >
      <ShieldCheck size={30} />
      <div>
        <span className="gen-kicker">Human control remains the final gate</span>
        <h2 id="human-review-title">
          {ready
            ? 'POC Ready for Human Review'
            : 'Validation required before human review'}
        </h2>
        <p>
          Build, tests, security and sandbox checks must pass against RB-001.
        </p>
        <div className="gen-gate-checks">
          {[
            'Build passed',
            'Tests passed',
            'Security baseline passed',
            'Sandbox ready',
            'Traceability maintained',
          ].map((label) => (
            <span key={label}>
              {ready ? '✓' : '○'} {label}
            </span>
          ))}
        </div>
      </div>
      {ready ? (
        <Link className="gen-primary-link" to="/preview">
          Open POC Review ↗
        </Link>
      ) : (
        <span className="gen-note">Review unavailable</span>
      )}
      <p className="sr-only" role="status" aria-live="polite">
        {ready
          ? 'Simulated POC ready for human review. Open POC Review for internal consultant approval.'
          : 'Engineering validation pending.'}
      </p>
    </section>
  );
}

export function GenerationRequirementTrace() {
  const state = useDemoStore();
  const selected = requirements.find((r) => r.id === 'FR-003')!;
  const nodes = [
    { id: selected.id, label: selected.title, status: 'Approved baseline' },
    ...artifacts
      .filter((a) => ['assignment-screen', 'assignment-api'].includes(a.id))
      .map((a) => ({
        id: a.id,
        label: a.label,
        status: state.generation.artifactStatuses[a.id] ?? 'Planned',
      })),
    {
      id: 'TC-012 / TC-013 / TC-014',
      label: 'Assignment succeeds · unauthorized roles denied',
      status: ['TC-012', 'TC-013', 'TC-014'].every(
        (id) => state.generation.testResults[id] === 'passed',
      )
        ? 'PASS'
        : 'Planned checks',
    },
  ];
  return (
    <section
      className="gen-trace"
      aria-label="Live requirement to generation trace"
    >
      <span className="gen-kicker">Live implementation trace</span>
      <div>
        {nodes.map((n, i) => (
          <div key={n.id}>
            {i > 0 && <span aria-hidden="true">→</span>}
            <article>
              <code>{n.id}</code>
              <strong>{n.label}</strong>
              <small>{n.status}</small>
            </article>
          </div>
        ))}
      </div>
      <Link to="/requirements?selected=FR-003">
        Inspect requirement evidence ↗
      </Link>
    </section>
  );
}
