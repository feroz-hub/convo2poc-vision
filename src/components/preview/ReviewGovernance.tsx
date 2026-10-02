import { Link } from 'react-router-dom';
import { Check, PackageCheck, ShieldCheck } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { selectGenerationSummary } from '@/store/generationSelectors';
import {
  selectPreviewScopeGaps,
  selectPreviewTraceability,
} from '@/store/previewSelectors';
import { sandboxPlan } from '@/data/generation';
import { pocReviewItems } from '@/data/pocRuntime';
import { scopeItems, scopeDecisionLabels } from '@/data/scope';
export function ValidationEvidenceStrip() {
  const state = useDemoStore();
  const gen = selectGenerationSummary(state);
  const trace = selectPreviewTraceability(state);
  return (
    <section
      className="preview-validation"
      aria-label="Review validation evidence"
    >
      <dl>
        {[
          [
            'Build',
            state.buildChecks
              .filter((c) => ['frontend', 'backend', 'schema'].includes(c.id))
              .every((c) => c.status === 'passed')
              ? '✓ PASS'
              : 'Pending',
          ],
          ['Tests', `${gen.testsPassed}/${gen.testsTotal} PASS`],
          [
            'Security Baseline',
            state.buildChecks.find((c) => c.id === 'security')?.status ===
            'passed'
              ? '✓ PASS'
              : 'Pending',
          ],
          ['Sandbox', state.generation.sandbox.toUpperCase()],
          ['Feature traceability', `${trace.coverage}%`],
          ['Synthetic Data', sandboxPlan.data],
          ['Production Integrations', sandboxPlan.integrations],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p>
        Traceability counts features with requirement, source, validated
        artifact and mapped test evidence: {trace.complete}/{trace.total}.
        Requirements {trace.requirementsMapped}/{trace.total} · Sources{' '}
        {trace.sourcesMapped}/{trace.total} · Artifacts {trace.artifactsMapped}/
        {trace.total} · Tests {trace.testsMapped}/{trace.total}.
      </p>
    </section>
  );
}
export function ReviewGovernance() {
  const state = useDemoStore();
  const runtime = state.pocRuntime;
  const gaps = selectPreviewScopeGaps(state);
  const complete = pocReviewItems.every((i) => runtime.reviews[i.key]);
  const baseline = state.pocBaseline!;
  const boundary = scopeItems.filter(
    (item) => baseline.decisions[item.id]?.decision !== 'included',
  );
  return (
    <>
      <div className="preview-review-grid">
        <section className="preview-panel preview-limitations">
          <span className="preview-kicker">TRANSPARENT POC BOUNDARY</span>
          <h2>Known limitations</h2>
          <ul>
            {boundary.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span>
                  {scopeDecisionLabels[baseline.decisions[item.id]!.decision]}
                </span>
                <p>{baseline.decisions[item.id]!.reason}</p>
              </li>
            ))}
          </ul>
          <p>
            Identity, records and integrations remain simulated. This browser
            session is not a production environment.
          </p>
          {gaps.length > 0 && (
            <div className="preview-scope-gap" role="alert">
              <strong>Additional scope has metadata only</strong>
              <p>
                {gaps.map((s) => s.title).join(', ')}: no interactive workflow
                is implemented in this preview. Client-demo approval is blocked
                while these gaps remain.
              </p>
            </div>
          )}
        </section>
        <section
          className="preview-panel preview-human-review"
          aria-labelledby="poc-review-heading"
        >
          <span className="preview-kicker">
            <ShieldCheck size={15} />
            CONSULTANT APPROVAL GATE
          </span>
          <h2 id="poc-review-heading">
            {runtime.approval
              ? 'Approved for client demonstration'
              : 'Review before client demonstration'}
          </h2>
          <p>
            {runtime.approval
              ? 'POC v1 · RB-001 · Internal Sandbox'
              : 'Validation is complete. A consultant reviews the prototype before a controlled demonstration.'}
          </p>
          <fieldset disabled={!!runtime.approval}>
            <legend className="sr-only">POC human review checklist</legend>
            {pocReviewItems.map((i) => (
              <label key={i.key}>
                <input
                  type="checkbox"
                  checked={runtime.reviews[i.key]}
                  disabled={i.key === 'scope' && gaps.length > 0}
                  onChange={(e) =>
                    state.performPocAction({
                      type: 'review',
                      key: i.key,
                      checked: e.target.checked,
                    })
                  }
                />
                <span>{i.label}</span>
              </label>
            ))}
          </fieldset>
          {runtime.approval ? (
            <div className="preview-approval-result" role="status">
              <Check size={23} />
              <div>
                <strong>APPROVED FOR CLIENT DEMONSTRATION</strong>
                <p>
                  Approved by {runtime.approval.approvedBy} ·{' '}
                  {runtime.approval.approvedAt} · deterministic demo time
                </p>
                <p>
                  Baseline {runtime.approval.baselineId} · Internal approval
                  recorded.
                </p>
                <Link to="/traceability">Review Traceability ↗</Link>
              </div>
            </div>
          ) : (
            <button
              className="preview-primary"
              disabled={!complete || gaps.length > 0}
              onClick={() => state.performPocAction({ type: 'approve-review' })}
            >
              Approve POC for Client Demonstration
            </button>
          )}
          <small>
            Human approval stays internal. No client messages or production
            actions.
          </small>
        </section>
      </div>
      <section className="preview-panel preview-package">
        <div>
          <span className="preview-kicker">
            <PackageCheck size={16} />
            INTERNAL DEMO PACKAGE
          </span>
          <h2>From approved baseline to reviewable experience</h2>
          <p>Conceptual package · no downloads or generated repository</p>
        </div>
        <ul>
          {[
            'Working POC',
            'Requirement Summary',
            'Approved Scope',
            'Architecture Metadata',
            'Simulated Test Report',
            'Feature Evidence',
            'Known Limitations',
            'Demo Script Outline',
          ].map((label) => (
            <li key={label}>
              <Check size={14} />
              {label}
            </li>
          ))}
        </ul>
        <details>
          <summary>Demo script outline</summary>
          <p>
            Create a request → assign an engineer → approve P1 as manager →
            progress status → inspect dashboard → search closed requests →
            review feature evidence.
          </p>
        </details>
      </section>
    </>
  );
}
