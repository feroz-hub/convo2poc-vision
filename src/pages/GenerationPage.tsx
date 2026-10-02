import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LockKeyhole,
  Check,
  TriangleAlert,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Network,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import {
  selectGenerationReadiness,
  selectScopePrerequisites,
  selectScopeSummary,
} from '@/store/scopeSelectors';
import { selectGenerationSummary } from '@/store/generationSelectors';
import { formatGenerationTime } from '@/simulation/generationEngine';
import { generationDurationMs } from '@/simulation/generationEvents';
import { Button } from '@/components/ui/button';
import { AgentOrchestrationGraph } from '@/components/generation/AgentOrchestrationGraph';
import { AgentInspector } from '@/components/generation/AgentInspector';
import {
  GenerationRequirementTrace,
  GenerationActivityFeed,
  ValidationPipeline,
  ArtifactExplorer,
  ApplicationPlan,
  TestSummary,
  SecurityAndSandbox,
  HumanReviewGate,
} from '@/components/generation/GenerationOutputs';
import '@/styles/generation.css';
export function GenerationPage() {
  const page = useRef<HTMLDivElement>(null);
  useEffect(() => {
    page.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
  }, []);
  const state = useDemoStore();
  const readiness = selectGenerationReadiness(state);
  const ready = readiness === 'Ready';
  const baseline = state.pocBaseline;
  const summary = selectGenerationSummary(state);
  const scope = selectScopeSummary(state);
  const gates = selectScopePrerequisites(state);
  const g = state.generation;
  return (
    <div ref={page} className="page-content generation-page">
      <header className="generation-heading">
        <div>
          <span className="gen-kicker">
            <Network size={14} /> Governed AI engineering
          </span>
          <h1>AI Generation Command Center</h1>
          <p>Transform the approved POC baseline into a validated prototype.</p>
        </div>
        <span className="gen-simulation-badge">
          Simulated generation workflow
        </span>
      </header>
      <dl className="gen-top-summary">
        {[
          ['Baseline', baseline?.id ?? 'Not approved'],
          ['POC', baseline?.version ?? 'v1'],
          ['Scope', state.scopeApproved ? 'Approved' : 'Review required'],
          [
            'Generation',
            ready
              ? g.status === 'idle'
                ? 'Ready'
                : g.status === 'completed'
                  ? 'Complete'
                  : g.status.charAt(0).toUpperCase() + g.status.slice(1)
              : 'Locked',
          ],
          ['Requirement Readiness', `${state.liveReadiness}%`],
          ['Human Overrides', scope.overrides],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {!ready ? (
        <section className="gen-locked" aria-labelledby="generation-locked">
          <LockKeyhole size={38} />
          <span className="gen-kicker">Human approval required</span>
          <h2 id="generation-locked">Generation not ready</h2>
          <p>
            {baseline
              ? 'Review changed after approval. RB-001 is preserved; generation requires a new reviewed baseline.'
              : 'Capture, clarify and approve the POC boundary before engineering begins.'}
          </p>
          <ul>
            {[
              ['Requirements captured', gates.requirementsCaptured],
              ['Clarifications reviewed', gates.clarificationsResolved],
              ['POC scope approved', state.scopeApproved],
              ['RB-001 locked baseline', !!baseline],
              ['Generation readiness current', ready],
            ].map(([label, valid]) => (
              <li key={String(label)}>
                {valid ? <Check size={17} /> : <TriangleAlert size={17} />}
                <span>{label}</span>
                <strong>{valid ? 'Complete' : 'Required'}</strong>
              </li>
            ))}
          </ul>
          <div>
            <Link className="gen-primary-link" to="/scope">
              Review POC Scope ↗
            </Link>
            <Link to="/clarifications">Review Clarifications ↗</Link>
          </div>
          <Button variant="outline" onClick={state.reset}>
            Reset Scenario
          </Button>
        </section>
      ) : (
        <>
          <section
            className="gen-baseline-input"
            aria-label="Approved baseline input"
          >
            <Link to="/scope" className="gen-baseline-id">
              <LockKeyhole size={22} />
              <span>
                <strong>{baseline!.id}</strong>
                <small>LOCKED · View baseline ↗</small>
              </span>
            </Link>
            <dl>
              {[
                [
                  'Included capabilities',
                  baseline!.includedScopeItemIds.length,
                ],
                ['Mocked dependencies', baseline!.mockedScopeItemIds.length],
                [
                  'Deferred capabilities',
                  baseline!.excludedScopeItemIds.length,
                ],
                ['Success criteria', baseline!.successCriteriaIds.length],
                ['Requirement records', baseline!.requirementIds.length],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p>
              Generation consumes approved scope and success criteria, with
              recorded requirements as evidence.
            </p>
          </section>
          <section
            className="gen-control-deck"
            aria-label="Generation controls"
          >
            <div className="gen-overall-progress">
              <span>
                Generation Progress <strong>{summary.progress}%</strong>
              </span>
              <progress
                aria-label="Overall generation progress"
                value={summary.progress}
                max={100}
              />
              <small>
                {summary.complete}/{state.agentStatuses.length} stages complete
                · {summary.active} active · {formatGenerationTime(g.elapsedMs)}{' '}
                / {formatGenerationTime(generationDurationMs)}
              </small>
            </div>
            <div className="gen-controls">
              {g.status === 'idle' && (
                <Button onClick={state.startGeneration}>
                  <Play size={15} />
                  Start Generation
                </Button>
              )}
              {g.status === 'running' && (
                <Button variant="outline" onClick={state.pauseGeneration}>
                  <Pause size={15} />
                  Pause Generation
                </Button>
              )}
              {g.status === 'paused' && (
                <Button onClick={state.resumeGeneration}>
                  <Play size={15} />
                  Resume Generation
                </Button>
              )}
              {g.status !== 'completed' && g.status !== 'failed' && (
                <Button variant="outline" onClick={state.nextGenerationEvent}>
                  <SkipForward size={15} />
                  Next Event
                </Button>
              )}
              {g.status !== 'idle' && (
                <Button variant="outline" onClick={state.restartGeneration}>
                  <RotateCcw size={15} />
                  Restart Generation
                </Button>
              )}
              <Button variant="ghost" onClick={state.reset}>
                Reset Scenario
              </Button>
              <label>
                Demo speed
                <select
                  aria-label="Generation demo speed"
                  value={state.demoSpeed}
                  onChange={(e) => state.setDemoSpeed(Number(e.target.value))}
                >
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                  <option value={4}>4×</option>
                </select>
              </label>
            </div>
          </section>
          <div className="gen-workspace">
            <AgentOrchestrationGraph />
            <div id="generation-inspector-anchor" tabIndex={-1}>
              <AgentInspector />
            </div>
          </div>
          <GenerationRequirementTrace />
          <div className="gen-lower-grid">
            <GenerationActivityFeed />
            <ValidationPipeline />
          </div>
          <div className="gen-outputs-grid">
            <ArtifactExplorer />
            <ApplicationPlan />
          </div>
          <TestSummary />
          <SecurityAndSandbox />
          <HumanReviewGate />
        </>
      )}
    </div>
  );
}
