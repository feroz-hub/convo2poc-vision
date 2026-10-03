import { GuidedControls } from '@/components/demo/GuidedControls';
import { useDemoTarget } from '@/components/demo/demoTargets';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import {
  selectChangeImpact,
  selectChangeTrace,
  selectDeltaAgents,
  selectV2Ready,
} from '@/store/feedbackSelectors';
import { deltaMilestones } from '@/data/feedbackEvolution';
import { agents } from '@/data/agents';
export function DeltaGeneration() {
  const demoTarget = useDemoTarget('feedback-delta');
  const s = useDemoStore(),
    f = s.feedback,
    d = f.delta,
    impact = selectChangeImpact(s),
    ready = selectV2Ready(s),
    trace = selectChangeTrace(s);
  return (
    <GuidedControls>
      <section
        className="fb-panel fb-delta"
        {...demoTarget}
        aria-label="Targeted regeneration"
      >
        <header>
          <div>
            <span className="fb-kicker">APPROVED DELTA · RB-002</span>
            <h2>
              {ready
                ? 'POC v2 ready for human review'
                : 'Regenerate the changed policy path'}
            </h2>
            <p>
              Architecture & data reused. Only affected responsibilities run.
            </p>
          </div>
          <span className="fb-status">
            {d.status === 'completed' ? '✓ Validated' : d.status}
          </span>
        </header>
        <div
          className="fb-reuse-bar"
          aria-label={`${impact.reused.length} artifacts reused, ${impact.modified.length} affected`}
        >
          <span style={{ flex: impact.reused.length }}>
            Reused · {impact.reused.length}
          </span>
          <span style={{ flex: impact.modified.length }}>
            Affected · {impact.modified.length}
          </span>
        </div>
        <div className="fb-controls">
          <progress
            aria-label="Targeted regeneration progress"
            value={d.elapsedMs}
            max={32000}
          />
          <b>{Math.round(d.elapsedMs / 320)}%</b>
          {d.status === 'idle' ? (
            <button className="fb-primary" onClick={s.startDelta}>
              Start Targeted Regeneration
            </button>
          ) : (
            <>
              <button
                disabled={d.status === 'completed'}
                onClick={() =>
                  s.deltaPlayback(d.status === 'running' ? 'pause' : 'resume')
                }
              >
                {d.status === 'running' ? 'Pause' : 'Resume'}
              </button>
              <button
                disabled={d.status === 'completed'}
                onClick={() => s.deltaPlayback('next')}
              >
                Next Delta Event
              </button>
              <button onClick={() => s.deltaPlayback('restart')}>
                Restart Delta Generation
              </button>
            </>
          )}
        </div>
        <div className="fb-agents">
          {selectDeltaAgents(s).map((a) => (
            <div key={a.id} className={a.status === 'running' ? 'active' : ''}>
              <span>
                {a.status === 'reused' ? <LayersReuse /> : <Check size={16} />}
              </span>
              <b>{agents.find((agent) => agent.id === a.id)?.name}</b>
              <small>{a.status}</small>
            </div>
          ))}
        </div>
        <ol className="fb-delta-history" aria-label="Delta generation history">
          {deltaMilestones
            .filter((e) => e.at <= d.elapsedMs && d.status !== 'idle')
            .map((e) => (
              <li key={e.at}>
                <code>00:{String(e.at / 1000).padStart(2, '0')}</code>
                {e.label}
              </li>
            ))}
        </ol>
        <details className="fb-test-history" open>
          <summary>
            Versioned test evidence · original expectations preserved
          </summary>
          <div className="fb-test-grid">
            <div>
              <h3>RB-001 · POC v1</h3>
              {impact.v1Tests.map((t) => (
                <p key={t.id}>
                  <code>{t.id}</code>
                  <span>{t.label}</span>
                  <b>
                    {s.generation.testResults[t.id] === 'passed'
                      ? '✓ PASS'
                      : 'Pending'}
                  </b>
                  {t.id === 'TC-023' && (
                    <small>
                      Historical PASS preserved · superseded only in RB-002
                    </small>
                  )}
                </p>
              ))}
            </div>
            <div>
              <h3>RB-002 · POC v2</h3>
              {impact.v2Tests.map((t) => (
                <p key={t.id}>
                  <code>{t.id}</code>
                  <span>{t.label}</span>
                  <b>
                    {d.testResults[t.id] === 'passed' ? '✓ PASS' : 'Planned'}
                  </b>
                  {t.supersedesTestId && (
                    <small>
                      Supersedes {t.supersedesTestId} for v2 · CR-001
                    </small>
                  )}
                </p>
              ))}
            </div>
          </div>
        </details>
        <div className="fb-change-lineage" aria-label="Change traceability">
          {[
            'Client feedback',
            'CR-001',
            'Requirement revisions',
            'RB-002',
            'Affected artifacts',
            'Versioned tests',
            'POC v2',
          ].map((label, i) => (
            <span key={label}>
              {i > 0 && <ArrowRight size={14} />}
              <b>{label}</b>
            </span>
          ))}
        </div>
        <p className="fb-note">
          Changed-workflow traceability: {trace.coverage}% ·{' '}
          {trace.complete
            ? 'Evidence chain validated'
            : 'Awaiting delta validation'}
          . V1 evidence remains available in the{' '}
          <Link to="/traceability?feature=approval">
            Traceability Explorer ↗
          </Link>
          .
        </p>
        {ready && (
          <div className="fb-v2-ready" role="status">
            <ShieldCheck size={27} />
            <div>
              <h3>RB-002 · CR-001 · POC v2</h3>
              <p>
                Tests{' '}
                {
                  Object.values(d.testResults).filter((r) => r === 'passed')
                    .length
                }
                /{impact.v2Tests.length} PASS · Build & security passed ·
                Sandbox updated
              </p>
              <p>Human review required. No client deployment.</p>
              <Link
                className="fb-primary"
                to="/preview?version=v2"
                onClick={() => s.selectPocVersion('v2')}
              >
                Open POC v2 ↗
              </Link>
              <Link
                to="/preview?version=v1"
                onClick={() => s.selectPocVersion('v1')}
              >
                Compare preserved POC v1 ↗
              </Link>
            </div>
          </div>
        )}
      </section>
    </GuidedControls>
  );
}
function LayersReuse() {
  return <ArrowRight size={16} aria-hidden="true" />;
}
