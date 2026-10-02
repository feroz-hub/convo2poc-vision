import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Eye,
  LockKeyhole,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { selectGenerationSummary } from '@/store/generationSelectors';
import {
  selectPreviewReady,
  selectPreviewTraceability,
} from '@/store/previewSelectors';
import { GeneratedPocApp } from '@/components/preview/GeneratedPocApp';
import { FeatureEvidencePanel } from '@/components/preview/FeatureEvidencePanel';
import {
  ReviewGovernance,
  ValidationEvidenceStrip,
} from '@/components/preview/ReviewGovernance';
import { sandboxPlan } from '@/data/generation';
import '@/styles/preview.css';
export function PreviewPage() {
  const state = useDemoStore();
  const ready = selectPreviewReady(state);
  const gen = selectGenerationSummary(state);
  const trace = selectPreviewTraceability(state);
  const runtime = state.pocRuntime;
  const present = ready && runtime.presentation;
  const page = useRef<HTMLDivElement>(null);
  useEffect(() => {
    page.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
  }, []);
  useEffect(() => {
    if (!present) return;
    const exit = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        useDemoStore
          .getState()
          .performPocAction({ type: 'presentation', enabled: false });
    };
    window.addEventListener('keydown', exit);
    return () => window.removeEventListener('keydown', exit);
  }, [present]);
  const checks = [
    ['RB-001 approved', !!state.pocBaseline && state.scopeApproved],
    [
      'Application generation complete',
      state.generation.status === 'completed',
    ],
    [
      'Build checks passed',
      state.buildChecks
        .filter((c) => ['frontend', 'backend', 'schema'].includes(c.id))
        .every((c) => c.status === 'passed'),
    ],
    ['Tests passed', gen.testsTotal > 0 && gen.testsPassed === gen.testsTotal],
    [
      'Security baseline passed',
      state.buildChecks.find((c) => c.id === 'security')?.status === 'passed',
    ],
    ['Sandbox ready', state.generation.sandbox === 'ready'],
    ['Current governance and trace metadata valid', ready],
  ] as const;
  return (
    <div
      ref={page}
      className={`page-content preview-page ${present ? 'preview-presenting' : ''}`}
    >
      {!present && (
        <header className="preview-header">
          <div>
            <span className="preview-kicker">
              <Eye size={15} />
              INTERNAL HUMAN REVIEW
            </span>
            <h1>Generated POC Review</h1>
            <p>
              Review the working prototype produced from approved baseline
              RB-001.
            </p>
          </div>
          <span className="preview-prototype-badge">
            Generated POC — Not Production Ready
          </span>
        </header>
      )}
      {!ready ? (
        <section
          className="preview-locked"
          aria-labelledby="preview-locked-title"
        >
          <LockKeyhole size={38} />
          <span className="preview-kicker">GOVERNED REVIEW ACCESS</span>
          <h2 id="preview-locked-title">POC Review Not Ready</h2>
          <p>
            Complete the approved generation workflow before reviewing the
            prototype.
          </p>
          <ul>
            {checks.map(([label, passed]) => (
              <li key={label}>
                <span>{passed ? '✓' : '○'}</span>
                {label}
                <strong>{passed ? 'Ready' : 'Required'}</strong>
              </li>
            ))}
          </ul>
          <Link className="preview-primary" to="/generation">
            View Generation Progress ↗
          </Link>
          <button className="preview-text-button" onClick={state.reset}>
            Reset Scenario
          </button>
        </section>
      ) : (
        <>
          {!present && (
            <dl className="preview-summary">
              {[
                ['POC', state.pocBaseline!.version],
                ['Baseline', state.pocBaseline!.id],
                ['Environment', 'Internal Sandbox'],
                ['Build', '✓ Passed'],
                ['Tests', `${gen.testsPassed}/${gen.testsTotal} PASS`],
                ['Traceability', `${trace.coverage}%`],
                [
                  'Review Status',
                  runtime.approval
                    ? 'Approved for demonstration'
                    : 'Pending Human Approval',
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="preview-workspace-toolbar">
            <div>
              <span className="preview-ready-label">
                <Check size={15} />
                POC Ready for Human Review
              </span>
              <span>RB-001 → validated artifacts → working workflow</span>
            </div>
            <div>
              <button
                onClick={() =>
                  state.performPocAction({
                    type: 'presentation',
                    enabled: !present,
                  })
                }
              >
                {present ? <Minimize2 size={15} /> : <Maximize2 size={15} />}{' '}
                {present ? 'Exit Presentation' : 'Present POC'}
              </button>
              {!present && (
                <>
                  <button
                    aria-expanded={runtime.evidenceOpen}
                    onClick={() =>
                      state.performPocAction({
                        type: 'evidence',
                        open: !runtime.evidenceOpen,
                      })
                    }
                  >
                    <Eye size={15} />
                    {runtime.evidenceOpen ? 'Hide Evidence' : 'Show Evidence'}
                  </button>
                  <button onClick={state.reset}>
                    <RotateCcw size={14} />
                    Reset Scenario
                  </button>
                </>
              )}
            </div>
          </div>
          <div
            className={`preview-workspace ${runtime.evidenceOpen && !present ? '' : 'preview-app-only'}`}
          >
            <GeneratedPocApp />
            {runtime.evidenceOpen && !present && <FeatureEvidencePanel />}
          </div>
          {!present && (
            <>
              <ValidationEvidenceStrip />
              <details className="preview-panel preview-sandbox-details">
                <summary>Simulated Sandbox · {sandboxPlan.id} · Ready</summary>
                <dl>
                  {Object.entries(sandboxPlan)
                    .filter(([key]) => key !== 'reviewUrl')
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
                <p>
                  No live environment exists. Runtime interactions are isolated
                  in this browser session.
                </p>
              </details>
              <ReviewGovernance />
            </>
          )}
        </>
      )}
    </div>
  );
}
