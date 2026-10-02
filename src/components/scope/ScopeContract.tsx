import { Check, TriangleAlert, ArrowRight, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  scopeItems,
  successCriteria,
  workflowDependencyIds,
} from '@/data/scope';
import { requirements } from '@/data/requirements';
import { useDemoStore } from '@/store/demoStore';
import {
  selectSuccessCoverage,
  selectScopeDecision,
} from '@/store/scopeSelectors';
export function ScopeContract() {
  const state = useDemoStore();
  const covered = selectSuccessCoverage(state);
  const included = scopeItems.filter(
    (item) => selectScopeDecision(state, item) === 'included',
  );
  const excluded = scopeItems.filter(
    (item) => selectScopeDecision(state, item) === 'excluded',
  );
  return (
    <div className="scope-contract">
      <section className="scope-success" aria-labelledby="scope-success-title">
        <header>
          <h2 id="scope-success-title">POC success criteria</h2>
          <span>
            {covered.length} / {successCriteria.length} covered
          </span>
        </header>
        <p>
          The minimum demonstration contract for future generation and testing.
        </p>
        <ul>
          {successCriteria.map((criterion) => {
            const available = covered.some((c) => c.id === criterion.id);
            return (
              <li
                key={criterion.id}
                className={available ? 'covered' : 'uncovered'}
              >
                {available ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <TriangleAlert size={16} aria-hidden="true" />
                )}
                <div>
                  <span>
                    {available
                      ? 'Must demonstrate'
                      : 'Scope gap · must demonstrate'}{' '}
                    <code>{criterion.id}</code>
                  </span>
                  <p>
                    {
                      requirements.find(
                        (r) => r.id === criterion.requirementIds[0],
                      )!.description
                    }
                  </p>
                  <small>{criterion.requirementIds.join(' · ')}</small>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="scope-dependencies">
          <FlaskConical size={16} aria-hidden="true" />
          <strong>Workflow dependencies</strong>
          {workflowDependencyIds.map((id) => {
            const item = scopeItems.find((item) => item.id === id)!;
            return (
              <span key={id}>
                {item.title} ·{' '}
                {selectScopeDecision(state, item) === 'excluded'
                  ? '⚠ Missing'
                  : '✓ Available'}
              </span>
            );
          })}
        </div>
      </section>
      <section className="scope-boundary">
        <h2>POC boundary</h2>
        <div>
          <h3>POC will prove</h3>
          <ul>
            {included.map((item) => (
              <li key={item.id}>
                <Check size={13} aria-hidden="true" />
                {item.title}
              </li>
            ))}
          </ul>
          {!included.length && <p>No capabilities included.</p>}
        </div>
        <div>
          <h3>POC will not prove</h3>
          <ul>
            {excluded.map((item) => (
              <li key={item.id}>
                <ArrowRight size={13} aria-hidden="true" />
                {item.title}
              </li>
            ))}
          </ul>
          {!excluded.length && <p>No deferred capabilities.</p>}
        </div>
        <Link to="/clarifications">Review requirement uncertainty ↗</Link>
      </section>
    </div>
  );
}
