import { getEvidenceCaptureReadiness } from '@/simulation/clarificationReadiness';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  ArrowDown,
  ShieldCheck,
  UsersRound,
  History,
  TrendingUp,
} from 'lucide-react';
import { requirements } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { useDemoStore } from '@/store/demoStore';
import { selectResolutionReadiness } from '@/store/clarificationSelectors';
import type { Clarification, ClarificationHistoryEntry } from '@/types/domain';
const actionLabels: Record<ClarificationHistoryEntry['action'], string> = {
  'suggestion-accepted': 'Suggested question accepted',
  'question-edited': 'Suggested question edited',
  'evidence-reviewed': 'Client evidence reviewed',
  confirmed: 'Consultant confirmed resolution',
  rejected: 'Consultant rejected resolution',
  reopened: 'Clarification reopened',
};
export function ClarificationImpactPanel({ item }: { item: Clarification }) {
  const state = useDemoStore();
  const impact = selectResolutionReadiness(state, item.id);
  const capture = getEvidenceCaptureReadiness(item);
  const source = transcript.find((m) => m.id === item.sourceMessageId)!;
  const suggested = transcript.find(
    (m) => m.role === 'system' && m.text === item.question,
  );
  const answer = transcript.find((m) => m.id === item.resolutionMessageId)!;
  const affected = requirements.filter((r) =>
    item.affectedRequirementIds.includes(r.id),
  );
  const actors = [...new Set(affected.flatMap((r) => r.actors))];
  const confirmed = state.resolvedClarificationIds.includes(item.id);
  return (
    <aside
      className="clarification-impact governance-panel"
      aria-labelledby="impact-title"
    >
      <div className="governance-panel-heading">
        <GitBranch size={18} aria-hidden="true" />
        <h2 id="impact-title">Evidence & impact</h2>
      </div>
      <section>
        <h3>Source evidence</h3>
        <Link to={`/session?source=${source.id}`}>
          {source.speaker} · {source.timestamp} <code>{source.id}</code> ↗
        </Link>
        <p>
          Client response · {answer.timestamp} <code>{answer.id}</code>
        </p>
      </section>
      <section>
        <h3>Affected requirements</h3>
        <ul>
          {affected.map((r) => (
            <li className="impact-requirement" key={r.id}>
              <code>{r.id}</code>
              <strong>{r.title}</strong>
              <small>
                {confirmed ? '✓ Confirmed by consultant' : 'Proposed update'}
              </small>
              <Link to={`/requirements?selected=${r.id}`}>
                Inspect requirement ↗
              </Link>
            </li>
          ))}
        </ul>
        {!affected.length && (
          <p>
            Integration boundary decision. No existing functional requirement is
            changed.
          </p>
        )}
      </section>
      {actors.length > 0 && (
        <section>
          <h3>
            <UsersRound size={14} aria-hidden="true" />
            Related actors
          </h3>
          <div className="impact-actors">
            {actors.map((actor) => (
              <span key={actor}>{actor}</span>
            ))}
          </div>
        </section>
      )}
      <section>
        <h3>POC impact</h3>
        <p>
          {item.category === 'ambiguity'
            ? 'Priority definition & manager approval workflow'
            : item.category === 'role'
              ? 'Assignment permissions & ownership'
              : 'Email notification integration boundary'}
        </p>
      </section>
      <section className="review-readiness">
        {capture.delta > 0 && (
          <div className="evidence-readiness">
            <small>Answer capture · workshop model</small>
            <strong>
              {capture.before}% → {capture.after}%
            </strong>
            <span>+{capture.delta} pts from structured client evidence</span>
          </div>
        )}
        <h3>
          <TrendingUp size={15} aria-hidden="true" />
          Readiness impact
        </h3>
        <div className="readiness-comparison">
          <div>
            <small>Before review</small>
            <strong>{impact.before}%</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <small>After approval</small>
            <strong>{impact.after}%</strong>
          </div>
        </div>
        <progress
          max={100}
          value={state.liveReadiness}
          aria-label="Clarification POC readiness"
        />
        <span className="readiness-contribution">
          +{impact.delta} pts · uncertainty resolved
        </span>
        <small>
          Illustrative shared readiness model. Capture coverage stays unchanged;
          consultant review contributes to the 10% clarification weight.
        </small>
        {!state.visibleTranscriptMessageIds.length && (
          <p>Run Live Session to build the remaining readiness coverage.</p>
        )}
      </section>
      <section className="traceability-mini">
        <h3>Decision traceability</h3>
        <Link to={`/session?source=${source.id}`}>
          {source.role === 'client'
            ? 'Client statement'
            : 'Conversation statement'}{' '}
          <code>{source.id}</code>
        </Link>
        <ArrowDown size={15} aria-hidden="true" />
        <span className="trace-question">
          <code>{item.id}</code>{' '}
          {confirmed ? '✓ Consultant confirmed' : 'Review pending'}
        </span>
        <ArrowDown size={15} aria-hidden="true" />
        <div className="trace-outputs">
          {affected.length ? (
            affected.map((r) => (
              <a key={r.id} href={`#requirement-${r.id}`}>
                <code>{r.id}</code>
              </a>
            ))
          ) : (
            <span>Integration boundary decision</span>
          )}
        </div>
      </section>
      <section className="resolution-history">
        <h3>
          <History size={15} aria-hidden="true" />
          Resolution history
        </h3>
        <ol>
          <li>
            <time>{source.timestamp}</time>
            <span>Clarification identified · {source.id}</span>
          </li>
          {suggested && (
            <li>
              <time>{suggested.timestamp}</time>
              <span>Clarification suggested · {suggested.id}</span>
            </li>
          )}
          <li>
            <time>{answer.timestamp}</time>
            <span>
              {state.visibleTranscriptMessageIds.includes(answer.id)
                ? 'Client evidence captured'
                : 'Recorded client answer'}{' '}
              · {answer.id}
            </span>
          </li>
          {state.clarificationHistory
            .filter((h) => h.clarificationId === item.id)
            .map((h) => (
              <li key={h.sequence}>
                <span className="history-step">#{h.sequence}</span>
                <span>
                  {actionLabels[h.action]}
                  <small>
                    Demo {Math.floor(h.elapsedMs / 1000)}s · consultant action
                  </small>
                </span>
              </li>
            ))}
        </ol>
        <small>
          Workshop timestamps for evidence; deterministic action order for
          consultant review.
        </small>
      </section>
      <footer>
        <ShieldCheck size={17} aria-hidden="true" />
        Human approval preserved
      </footer>
    </aside>
  );
}
