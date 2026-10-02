import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ScanSearch,
  ShieldCheck,
  ArrowUpRight,
  LockKeyhole,
} from 'lucide-react';
import { requirements, clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { scopeDecisionLabels } from '@/data/scope';
import { useDemoStore } from '@/store/demoStore';
import { selectScopeDecision, getScopeScore } from '@/store/scopeSelectors';
import { Button } from '@/components/ui/button';
import type { ScopeItem, ScopeDecision } from '@/types/domain';
export function ScopeInspector({ item }: { item: ScopeItem }) {
  const state = useDemoStore();
  const override = state.scopeOverrides[item.id];
  const decision = selectScopeDecision(state, item);
  const model = getScopeScore(item);
  const [reason, setReason] = useState(override?.reason ?? '');
  const linked = clarifications.filter((q) =>
    item.clarificationIds.includes(q.id),
  );
  return (
    <aside
      id="scope-inspector"
      className="scope-inspector"
      tabIndex={-1}
      aria-labelledby="scope-inspector-title"
    >
      <header>
        <ScanSearch size={19} aria-hidden="true" />
        <div>
          <span className="scope-kicker">Inspect the decision</span>
          <h2 id="scope-inspector-title">{item.title}</h2>
        </div>
      </header>
      <div className="scope-inspector-body">
        <div className="scope-recommendation">
          <span>AI recommendation</span>
          <strong>{scopeDecisionLabels[item.decision]}</strong>
          {override && (
            <>
              <span>
                <ShieldCheck size={13} aria-hidden="true" />
                Consultant decision · Human override
              </span>
              <strong>{scopeDecisionLabels[decision]}</strong>
            </>
          )}
        </div>
        <p className="scope-reason">{item.reason}</p>
        <section className="scope-score">
          <h3>
            Illustrative POC scope model <strong>{model.score}/100</strong>
          </h3>
          <dl>
            {[
              [
                'Business criticality',
                item.relevance === 'core'
                  ? 'High'
                  : item.relevance === 'supporting'
                    ? 'Medium'
                    : 'Low',
              ],
              [
                'Demo value',
                item.relevance === 'core'
                  ? 'High'
                  : item.relevance === 'supporting'
                    ? 'Medium'
                    : 'Low',
              ],
              ['Dependency complexity', item.complexity],
              ['External dependency', item.externalDependency],
              [
                'Requirement confidence',
                model.confidence === null
                  ? 'Not scored · scenario boundary'
                  : `${model.confidence}%`,
              ],
              [
                'Build feasibility',
                item.complexity === 'low'
                  ? 'High'
                  : item.complexity === 'medium'
                    ? 'Medium'
                    : 'Low',
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <small>
            Deterministic review aid. Explicit client decisions take precedence
            over this illustrative score.
          </small>
        </section>
        <section className="scope-evidence">
          <h3>Requirement & evidence</h3>
          {item.requirementIds.map((id) => (
            <div key={id}>
              <Link to={`/requirements?selected=${id}`}>
                <code>{id}</code> · View Requirement{' '}
                <ArrowUpRight size={12} aria-hidden="true" />
              </Link>
              <p>{requirements.find((r) => r.id === id)!.description}</p>
            </div>
          ))}
          {!item.requirementIds.length && (
            <p>
              Scenario boundary recommendation; no client requirement ID is
              assigned.
            </p>
          )}
          {linked.map((q) => (
            <Link key={q.id} to={`/clarifications?selected=${q.id}`}>
              <code>{q.id}</code> · View Clarification{' '}
              <span>
                {state.resolvedClarificationIds.includes(q.id)
                  ? '✓ Consultant confirmed'
                  : 'Review pending'}
              </span>
            </Link>
          ))}
          {item.evidenceMessageIds.map((id) => {
            const message = transcript.find((m) => m.id === id)!;
            return (
              <blockquote key={id}>
                <small>
                  {message.speaker} · {message.timestamp} · {message.id}
                </small>
                <p>“{message.text}”</p>
                <Link to={`/session?source=${id}`}>
                  View Conversation Evidence{' '}
                  <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </blockquote>
            );
          })}
          {!item.evidenceMessageIds.length && (
            <small>
              Source: canonical scenario brief. No conversation statement is
              attributed to this dependency.
            </small>
          )}
        </section>
        <section className="scope-override">
          <h3>
            {state.scopeApproved ? (
              <>
                <LockKeyhole size={14} aria-hidden="true" />
                Approved decision locked
              </>
            ) : (
              'Consultant decision'
            )}
          </h3>
          <label htmlFor="scope-override-reason">
            Override reason <small>(optional local note)</small>
          </label>
          <textarea
            id="scope-override-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={state.scopeApproved}
            placeholder="Explain the scope tradeoff…"
          />
          <div className="scope-override-actions">
            {(['included', 'mocked', 'excluded'] as ScopeDecision[]).map(
              (value) => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  disabled={state.scopeApproved || decision === value}
                  onClick={() => state.setScopeDecision(item.id, value, reason)}
                >
                  Move to{' '}
                  {value === 'excluded'
                    ? 'Out of Scope'
                    : value === 'mocked'
                      ? 'Mocked'
                      : 'Included'}
                </Button>
              ),
            )}
            {override && (
              <Button
                size="sm"
                variant="outline"
                disabled={
                  state.scopeApproved || reason.trim() === override.reason
                }
                onClick={() =>
                  state.setScopeDecision(item.id, decision, reason)
                }
              >
                Save override reason
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              disabled={state.scopeApproved || !override}
              onClick={() => state.resetScopeRecommendation(item.id)}
            >
              Reset recommendation
            </Button>
          </div>
          {state.scopeApproved && (
            <p>
              Future client changes require a new baseline. This approved scope
              stays intact.
            </p>
          )}
        </section>
      </div>
    </aside>
  );
}
