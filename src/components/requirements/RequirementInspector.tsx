import { useDemoTarget } from '@/components/demo/demoTargets';
import { Link } from 'react-router-dom';
import { ScanSearch, ArrowDown, UsersRound } from 'lucide-react';
import { transcript } from '@/data/transcript';
import { successCriteria, scopeDecisionLabels } from '@/data/scope';
import { requirements } from '@/data/requirements';
import { useDemoStore } from '@/store/demoStore';
import {
  getRequirementClarifications,
  getRequirementRelationships,
  getRequirementScopes,
  selectIntelligenceStatus,
  selectEvidenceState,
  requirementTypeLabels,
} from '@/store/requirementSelectors';
import {
  selectClarificationStatus,
  clarificationStatusLabels,
} from '@/store/clarificationSelectors';
import { selectScopeDecision } from '@/store/scopeSelectors';
import { RequirementStatus } from './RequirementStatus';
import type { Requirement } from '@/types/domain';
export function RequirementInspector({ item }: { item: Requirement }) {
  const demoTarget = useDemoTarget('requirement-fr007');
  const state = useDemoStore();
  const source = transcript.find((m) => m.id === item.sourceMessageId);
  const related = getRequirementRelationships(item);
  const questions = getRequirementClarifications(item);
  const scopes = getRequirementScopes(item);
  const criteria = successCriteria.filter((c) =>
    c.requirementIds.includes(item.id),
  );
  const consultantConfirmed = questions.some((q) =>
    state.resolvedClarificationIds.includes(q.id),
  );
  return (
    <aside
      {...demoTarget}
      id="requirement-inspector"
      className="ri-inspector"
      tabIndex={-1}
      aria-labelledby="ri-inspector-title"
    >
      <header>
        <ScanSearch size={20} aria-hidden="true" />
        <div>
          <span className="ri-kicker">Evidence-backed requirement</span>
          <h2 id="ri-inspector-title">
            {item.id} · {item.title}
          </h2>
        </div>
      </header>
      <section className="ri-detail">
        <span className="ri-type">{requirementTypeLabels[item.type]}</span>
        <p className="ri-description">{item.description}</p>
        <RequirementStatus status={selectIntelligenceStatus(state, item)} />
        <dl>
          <div>
            <dt>Illustrative AI confidence</dt>
            <dd>{item.confidence}%</dd>
          </div>
          <div>
            <dt>Review context</dt>
            <dd>
              {item.type === 'assumption'
                ? 'Prototype assumption · not a client fact'
                : item.type === 'open-question'
                  ? 'Resolution managed in Clarification Center'
                  : consultantConfirmed
                    ? 'Confirmed by consultant'
                    : state.confirmedRequirementIds.includes(item.id)
                      ? 'Explicit client statement · consultant review separate'
                      : 'Catalog detection · reviewable input'}
            </dd>
          </div>
        </dl>
        <small>Confidence is an illustrative signal, not certainty.</small>
      </section>
      <section className="ri-source">
        <h3>Source evidence</h3>
        {source ? (
          <>
            <small>
              {source.speaker} · {source.timestamp} · <code>{source.id}</code>
            </small>
            <blockquote>“{source.text}”</blockquote>
            <span>{selectEvidenceState(state, item)}</span>
            <Link to={`/session?source=${source.id}`}>
              View in Live Session ↗
            </Link>
          </>
        ) : (
          <>
            <p>
              Canonical scenario brief. No client statement is attributed to
              this record.
            </p>
            <span>
              {item.type === 'assumption'
                ? 'Consultant acknowledgement required in POC Scope.'
                : 'Demo constraint · not a measured production result.'}
            </span>
          </>
        )}
      </section>
      <section>
        <h3>
          <UsersRound size={14} aria-hidden="true" /> Related actors
        </h3>
        {item.actors.length ? (
          <div className="ri-detail-actors">
            {item.actors.map((actor) => (
              <button
                key={actor}
                onClick={() =>
                  state.setRequirementView({
                    actor,
                    type: 'all',
                    status: 'all',
                    search: '',
                  })
                }
              >
                {actor}
              </button>
            ))}
          </div>
        ) : (
          <p>No actor assigned in the canonical record.</p>
        )}
      </section>
      <section>
        <h3>Connected requirement model</h3>
        <p className="ri-explanation">
          Linked by shared source, clarification outputs or scope references.
        </p>
        {related.length ? (
          <ul className="ri-related">
            {related.map((r) => (
              <li key={r.id}>
                <Link to={`/requirements?selected=${r.id}`}>
                  <code>{r.id}</code>
                  <span>{r.title}</span>
                  <small>{requirementTypeLabels[r.type]}</small>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No additional canonical relationship recorded.</p>
        )}
      </section>
      {questions.length > 0 && (
        <section className="ri-clarification-flow">
          <h3>Requirement → Clarification</h3>
          {questions.map((q) => {
            const answer = transcript.find(
              (m) => m.id === q.resolutionMessageId,
            )!;
            return (
              <div key={q.id}>
                <blockquote>
                  “{transcript.find((m) => m.id === q.sourceMessageId)!.text}”
                </blockquote>
                <ArrowDown size={15} aria-hidden="true" />
                <Link to={`/clarifications?selected=${q.id}`}>
                  <code>{q.id}</code> · Review Clarification ↗
                  <span>
                    {
                      clarificationStatusLabels[
                        selectClarificationStatus(state, q)
                      ]
                    }
                  </span>
                </Link>
                <ArrowDown size={15} aria-hidden="true" />
                <small>Recorded client answer · {answer.timestamp}</small>
                <blockquote>“{answer.text}”</blockquote>
                <span>
                  {state.resolvedClarificationIds.includes(q.id)
                    ? '✓ Consultant-confirmed resolution'
                    : 'Consultant review pending'}
                </span>
                <ul>
                  {q.affectedRequirementIds.map((id) => (
                    <li key={id}>
                      <code>{id}</code> ·{' '}
                      {requirements.find((r) => r.id === id)!.title}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}
      <section className="ri-scope-links">
        <h3>Requirement → POC Scope</h3>
        {scopes.length ? (
          scopes.map((s) => (
            <Link key={s.id} to={`/scope?selected=${s.id}`}>
              <code>{item.id}</code>
              <ArrowDown size={13} aria-hidden="true" />
              <strong>
                {scopeDecisionLabels[selectScopeDecision(state, s)]}
              </strong>
              <span>{s.title}</span>
              <small>
                {state.scopeApproved
                  ? 'Approved · RB-001'
                  : 'Recommended / consultant decision'}{' '}
                · View POC Scope Decision ↗
              </small>
            </Link>
          ))
        ) : (
          <p>
            No explicit scope item linked. Baseline records remain separate from
            capability decisions.
          </p>
        )}
      </section>
      {criteria.length > 0 && (
        <section>
          <h3>Success criteria</h3>
          <ul>
            {criteria.map((c) => (
              <li key={c.id}>
                <code>{c.id}</code> · {item.description}
              </li>
            ))}
          </ul>
        </section>
      )}
      <footer>
        {state.pocBaseline?.requirementIds.includes(item.id)
          ? `Baseline input retained · ${state.pocBaseline.id} locked`
          : 'Reviewable baseline input · approval remains in POC Scope'}
      </footer>
    </aside>
  );
}
