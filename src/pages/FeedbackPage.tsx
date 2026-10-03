import { useDemoTarget } from '@/components/demo/demoTargets';
import { Link } from 'react-router-dom';
import {
  GitCompareArrows,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  LockKeyhole,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { selectPreviewReady } from '@/store/previewSelectors';
import { selectFeedbackReviewComplete } from '@/store/feedbackSelectors';
import {
  feedbackMessages,
  feedbackReviews,
  feedbackMilestones,
  changeClassification,
} from '@/data/feedbackEvolution';
import { changeRequests } from '@/data/feedback';
import { PolicyComparison } from '@/components/feedback/PolicyComparison';
import { ChangeImpact } from '@/components/feedback/ChangeImpact';
import { DeltaGeneration } from '@/components/feedback/DeltaGeneration';
import '@/styles/feedback.css';
export function FeedbackPage() {
  const controlled = useDemoStore((s) => s.director.mode === 'autopilot');
  const changeTarget = useDemoTarget('feedback-cr001');
  const baselineTarget = useDemoTarget('feedback-rb002');
  const s = useDemoStore(),
    f = s.feedback,
    cr = changeRequests[0]!;
  const available = selectPreviewReady(s) && !!s.pocRuntime.approval;
  const detected = f.capture.elapsedMs >= 8000,
    analyzed = f.capture.elapsedMs >= 20000;
  return (
    <div className="feedback-page page-content">
      <header className="fb-header">
        <div>
          <span className="fb-kicker">
            <GitCompareArrows size={16} /> GOVERNED POC EVOLUTION
          </span>
          <h1>Client Feedback & Change Impact</h1>
          <p>Turn client feedback into controlled, traceable POC evolution.</p>
        </div>
        <button
          disabled={controlled}
          title={controlled ? 'Controlled by Guided Demo' : undefined}
          onClick={s.restartFeedback}
        >
          Restart Feedback Demo
        </button>
      </header>
      <dl className="fb-summary">
        {[
          ['Current POC', f.status === 'implemented' ? 'v2' : 'v1'],
          [
            'Current Baseline',
            f.baseline?.id ?? s.pocBaseline?.id ?? 'Not approved',
          ],
          ['Feedback', detected ? 'Detected' : 'Awaiting review'],
          ['Change Request', detected ? cr.id : 'Not detected'],
          ['Impact Status', f.status],
          ['Target Version', 'POC v2'],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="fb-story">
        <b>POC v1</b>
        <ArrowRight />
        <b>Client review</b>
        <ArrowRight />
        <b>Impact & approval</b>
        <ArrowRight />
        <b>Targeted POC v2</b>
      </div>
      {!available && (
        <section className="fb-access">
          <LockKeyhole size={24} />
          <div>
            <h2>Review POC v1 before capturing client feedback</h2>
            <p>
              The original baseline, generation validation and consultant
              demonstration approval are required.
            </p>
            <Link
              to="/preview?version=v1"
              onClick={() => s.selectPocVersion('v1')}
            >
              Review & approve POC v1 ↗
            </Link>
          </div>
        </section>
      )}
      <section className="fb-capture-grid">
        <div className="fb-panel">
          <header>
            <span className="fb-kicker">
              <MessageSquare size={15} /> CLIENT POC REVIEW SESSION
            </span>
            <h2>A small change in client intent</h2>
            <p>Separate from the original discovery workshop.</p>
          </header>
          <div className="fb-conversation">
            {feedbackMessages
              .filter(
                (_, i) =>
                  f.capture.status !== 'idle' &&
                  (i === 0 || f.capture.elapsedMs >= 5000),
              )
              .map((m) => (
                <article key={m.id}>
                  <span className="fb-avatar">
                    {m.speaker
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                  <div>
                    <b>{m.speaker}</b>
                    <small>
                      {m.role} · {m.timestamp} · {m.id}
                    </small>
                    <blockquote>“{m.text}”</blockquote>
                  </div>
                </article>
              ))}
            {f.capture.status === 'idle' && (
              <div className="fb-capture-empty">
                <MessageSquare size={25} />
                <p>
                  Client review will reveal feedback and stop at the human
                  approval gate.
                </p>
              </div>
            )}
          </div>
          <div className="fb-controls">
            {f.capture.status === 'idle' ? (
              <button
                className="fb-primary"
                disabled={controlled || !available}
                onClick={s.startFeedback}
              >
                Run Feedback Demo
              </button>
            ) : (
              <>
                <button
                  disabled={controlled || f.capture.status === 'completed'}
                  onClick={() =>
                    s.feedbackPlayback(
                      f.capture.status === 'running' ? 'pause' : 'resume',
                    )
                  }
                >
                  {f.capture.status === 'running'
                    ? 'Pause Feedback'
                    : 'Resume Feedback'}
                </button>
                <button
                  disabled={controlled || f.capture.status === 'completed'}
                  onClick={() => s.feedbackPlayback('next')}
                >
                  Next Feedback Event
                </button>
              </>
            )}
            <span>
              {Math.round(f.capture.elapsedMs / 1000)} / 20 sec · simulation
            </span>
          </div>
        </div>
        <section
          {...changeTarget}
          className="fb-panel fb-detection"
          aria-label="Change request detection"
        >
          <span className="fb-kicker">
            {detected ? 'CHANGE REQUEST DETECTED' : 'INTELLIGENCE READY'}
          </span>
          <h2>
            {detected
              ? 'Approval threshold expanded'
              : 'Feedback becomes a governed delta'}
          </h2>
          <div className="fb-detection-id">
            <GitCompareArrows size={35} />
            <b>{detected ? 'CR-001' : 'v1 → v2'}</b>
          </div>
          {detected ? (
            <>
              <p>{cr.previousValue}</p>
              <ArrowRight />
              <p>{cr.newValue}</p>
              <span className="fb-status">
                Business Rule Change · {changeClassification.confidence}%
                illustrative confidence
              </span>
            </>
          ) : (
            <p>
              Capture evidence → classify the change → inspect impact →
              consultant approval.
            </p>
          )}
          {f.capture.elapsedMs >= 12000 && (
            <dl className="fb-classification">
              {Object.entries(changeClassification)
                .filter(([key]) => key !== 'confidence')
                .map(([key, value]) => (
                  <div key={key}>
                    <dt>{key.replace(/([A-Z])/g, ' $1')}</dt>
                    <dd>
                      {typeof value === 'boolean'
                        ? value
                          ? 'Yes'
                          : 'No'
                        : value}
                    </dd>
                  </div>
                ))}
            </dl>
          )}
        </section>
      </section>
      {f.capture.elapsedMs >= 16000 && (
        <PolicyComparison proposed={!f.baseline} />
      )}
      {analyzed && (
        <>
          <ChangeImpact />
          <section
            {...baselineTarget}
            className="fb-panel fb-approval"
            aria-labelledby="change-review-title"
          >
            <header>
              <div>
                <span className="fb-kicker">
                  <ShieldCheck size={16} /> CHANGE IMPACT REVIEW
                </span>
                <h2 id="change-review-title">
                  {f.baseline
                    ? 'RB-002 approved & locked'
                    : 'Review the delta before versioning'}
                </h2>
                <p>
                  RB-001 remains immutable. Scope categories stay unchanged.
                </p>
              </div>
              <span className="fb-status">
                {f.baseline ? '✓ Approved' : 'Human approval required'}
              </span>
            </header>
            {!f.baseline ? (
              <>
                <fieldset disabled={controlled || f.status !== 'analyzed'}>
                  <legend className="sr-only">
                    Change impact review checklist
                  </legend>
                  {feedbackReviews.map((r) => (
                    <label key={r.key}>
                      <input
                        type="checkbox"
                        checked={f.reviews[r.key]}
                        onChange={(e) =>
                          s.reviewChange(r.key, e.target.checked)
                        }
                      />
                      {r.label}
                    </label>
                  ))}
                </fieldset>
                <div className="fb-controls">
                  <button
                    className="fb-primary"
                    disabled={
                      controlled ||
                      !selectFeedbackReviewComplete(s) ||
                      !available ||
                      s.pocBaseline?.decisions['scope-FR-007']?.decision !==
                        'included'
                    }
                    onClick={() => s.decideChange('approve')}
                  >
                    Approve CR-001 & Create RB-002
                  </button>
                  <button
                    disabled={controlled || f.status !== 'analyzed'}
                    onClick={() => s.decideChange('reject')}
                  >
                    Reject Change
                  </button>
                  <button
                    disabled={controlled || f.status !== 'analyzed'}
                    onClick={() => s.decideChange('clarify')}
                  >
                    Request Clarification
                  </button>
                </div>
                {['rejected', 'needs-clarification'].includes(f.status) && (
                  <p role="status">
                    {f.status === 'rejected'
                      ? 'Change rejected'
                      : 'Clarification requested'}{' '}
                    · RB-001 remains current. Restart Feedback Demo to begin
                    another deterministic review.
                  </p>
                )}
              </>
            ) : (
              <div className="fb-baseline-result" role="status">
                <ShieldCheck size={29} />
                <div>
                  <h3>RB-001 → CR-001 → RB-002</h3>
                  <p>Approved by Consultant · {f.baseline.approvedAt}</p>
                  <p>
                    {f.baseline.revisionIds.length} requirement revisions ·{' '}
                    {f.baseline.criterionRevisionId} · scope retained
                  </p>
                  <b>APPROVED FOR TARGETED REGENERATION</b>
                </div>
                <Link to="/scope">Inspect historical RB-001 ↗</Link>
              </div>
            )}
          </section>
        </>
      )}
      {f.baseline && <DeltaGeneration />}
      <section className="fb-panel fb-timeline" aria-label="Version timeline">
        <span className="fb-kicker">PRESERVED VERSION HISTORY</span>
        <ol>
          {[
            {
              label: 'Discovery',
              time: 'Workshop 04:35',
              done: s.sessionComplete,
            },
            {
              label: 'RB-001',
              time: s.pocBaseline?.approvedAt ?? 'Awaiting approval',
              done: !!s.pocBaseline,
            },
            {
              label: 'POC v1',
              time: 'Generation 01:20',
              done: selectPreviewReady(s),
            },
            {
              label: 'Client review',
              time: 'Review 00:05',
              done: f.capture.elapsedMs >= 5000,
            },
            { label: 'CR-001', time: 'Review 00:08', done: detected },
            {
              label: 'RB-002',
              time: f.baseline?.approvedAt ?? 'Human approval required',
              done: !!f.baseline,
            },
            {
              label: 'POC v2',
              time: 'Delta 00:32',
              done: f.status === 'implemented',
            },
          ].map((item) => (
            <li key={item.label}>
              <span>{item.done ? '✓' : '○'}</span>
              <b>{item.label}</b>
              <small>{item.time}</small>
            </li>
          ))}
        </ol>
      </section>
      <details className="fb-audit">
        <summary>Client review event history</summary>
        <ol>
          {feedbackMilestones
            .filter(
              (e) => f.capture.status !== 'idle' && e.at <= f.capture.elapsedMs,
            )
            .map((e) => (
              <li key={e.at}>
                00:{String(e.at / 1000).padStart(2, '0')} · {e.label}
              </li>
            ))}
        </ol>
      </details>
      <p className="fb-note">
        Deterministic frontend simulation · no generated repository or
        production deployment.{' '}
        <Link to="/generation">View preserved v1 generation ↗</Link>
      </p>
      <button
        disabled={controlled}
        className="fb-text-button"
        onClick={s.reset}
      >
        Full Scenario Reset
      </button>
    </div>
  );
}
