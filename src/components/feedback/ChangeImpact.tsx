import { Link } from 'react-router-dom';
import { ArrowDown, FileCheck, Layers, ShieldCheck } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { selectChangeImpact } from '@/store/feedbackSelectors';
import { requirements } from '@/data/requirements';
import {
  changeClassification,
  criterionRevision,
  requirementRevisions,
} from '@/data/feedbackEvolution';
export function ChangeImpact() {
  const s = useDemoStore(),
    impact = selectChangeImpact(s);
  const selected = impact.allArtifacts.find(
    (a) => a.id === s.feedback.selectedArtifactId,
  );
  return (
    <>
      <section className="fb-impact-summary" aria-label="Derived change impact">
        <dl>
          {[
            ['Requirement revisions', requirementRevisions.length],
            ['Business rule revisions', impact.businessRules.length],
            ['Scope items affected', impact.scopeItemIds.length],
            ['Scope categories changed', impact.scopeCategoryChanges],
            ['Architecture changes', impact.architectureChanges.length],
            ['Artifacts affected', impact.modified.length],
            ['Artifacts reused', impact.reused.length],
            ['Existing checks affected', impact.changedTestIds.size],
            ['New test expectations', impact.newTests.length],
            ['Unchanged capabilities', impact.unchangedFeatures.length],
            ['Tests reused', impact.reusedTests.length],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="fb-impact-grid">
        <section className="fb-panel">
          <header>
            <span className="fb-kicker">ILLUSTRATIVE IMPACT ASSESSMENT</span>
            <h2>One rule. A controlled change.</h2>
          </header>
          <div className="fb-impact-map" aria-label="Change impact map">
            <div className="fb-impact-root">
              <Layers size={21} />
              <b>CR-001</b>
              <span>Approval threshold expanded</span>
            </div>
            <ArrowDown />
            <div className="fb-impact-branches">
              {requirementRevisions.map((r) => (
                <div key={r.id}>
                  <b>{r.requirementId} v2</b>
                  <span>{r.revisedText}</span>
                </div>
              ))}
              <div>
                <b>{criterionRevision.criterionId} v2</b>
                <span>{criterionRevision.revisedText}</span>
              </div>
            </div>
            <ArrowDown />
            <div className="fb-impact-root">
              <ShieldCheck size={20} />
              <b>Approval workflow</b>
              <span>Remains Included · RB-001 → RB-002</span>
            </div>
            <ArrowDown />
            <div className="fb-impact-branches">
              <div>
                <b>{impact.consumers.length} policy consumers</b>
                <span>{impact.consumers.map((f) => f.label).join(' · ')}</span>
              </div>
              <div>
                <b>{impact.modified.length} affected artifacts</b>
                <span>Targeted modification</span>
              </div>
              <div>
                <b>{impact.newTests.length} new expectation</b>
                <span>TC-023 v1 → TC-016 v2</span>
              </div>
            </div>
          </div>
          <p className="fb-note">
            {changeClassification.architecture}. Identity, directory and schema
            are reused. No new capability or external integration.
          </p>
        </section>
        <section className="fb-panel fb-impact-inspector">
          <header>
            <span className="fb-kicker">INSPECT THE BOUNDARY</span>
            <h2>Affected & reused artifacts</h2>
          </header>
          <p className="fb-note">
            Policy consumers determine the delta. Architecture documents retain
            the same structure.
          </p>
          <div className="fb-artifact-list">
            {impact.allArtifacts.map((a) => (
              <button
                key={a.id}
                aria-pressed={selected?.id === a.id}
                onClick={() => s.selectImpact(a.id)}
              >
                <FileCheck size={15} />
                <span>
                  {a.label}
                  <code>{a.id}</code>
                </span>
                <small>
                  {a.id === 'TC-023'
                    ? 'Superseded in v2'
                    : impact.modified.some((m) => m.id === a.id)
                      ? 'Modified'
                      : 'Reused'}
                </small>
              </button>
            ))}
          </div>
          {selected && (
            <div className="fb-artifact-detail">
              <b>{selected.label}</b>
              <code>{selected.path}</code>
              <span>
                {selected.id === 'TC-023'
                  ? 'Historical v1 policy check retained. TC-016 supersedes it in v2.'
                  : impact.modified.some((a) => a.id === selected.id)
                    ? 'Consumes the revised approval policy or validates the delta.'
                    : 'Outside the changed policy path. Original artifact reused.'}
              </span>
              <Link
                to="/generation"
                onClick={() => s.selectGenerationArtifact(selected.id)}
              >
                Inspect v1 artifact evidence ↗
              </Link>
            </div>
          )}
        </section>
      </div>
      <details className="fb-panel fb-diff" open>
        <summary>Version diff · RB-001 → RB-002</summary>
        <div className="fb-diff-grid">
          {requirementRevisions.map((r) => (
            <article key={r.id}>
              <Link to={`/requirements?selected=${r.requirementId}`}>
                {r.requirementId} ↗
              </Link>
              <small>v1 · preserved</small>
              <p>
                {
                  requirements.find((req) => req.id === r.requirementId)!
                    .description
                }
              </p>
              <small>
                v2 ·{' '}
                {s.feedback.baseline
                  ? 'Approved revision'
                  : 'Proposed revision'}
              </small>
              <p>{r.revisedText}</p>
              <code>{r.id}</code>
            </article>
          ))}
          <article>
            <b>BR-001 · Unchanged</b>
            <p>{requirements.find((r) => r.id === 'BR-001')!.description}</p>
            <b>Success criterion · {criterionRevision.criterionId}</b>
            <small>v1 · preserved</small>
            <p>{requirements.find((r) => r.id === 'FR-007')!.description}</p>
            <small>v2 · revised</small>
            <p>{criterionRevision.revisedText}</p>
            <Link to="/clarifications?selected=OQ-001">
              View original clarification ↗
            </Link>
          </article>
        </div>
      </details>
    </>
  );
}
