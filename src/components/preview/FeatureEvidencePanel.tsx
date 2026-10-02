import { Link } from 'react-router-dom';
import { ArrowDown, FileCheck2, Fingerprint, X } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { selectFeatureEvidence } from '@/store/previewSelectors';
import { agents } from '@/data/agents';
import { transcript } from '@/data/transcript';
import { scopeDecisionLabels } from '@/data/scope';
export function FeatureEvidencePanel() {
  const state = useDemoStore();
  const data = selectFeatureEvidence(state, state.pocRuntime.selectedFeatureId);
  return (
    <aside className="preview-evidence" aria-label="Feature evidence">
      <header>
        <div>
          <span className="preview-kicker">
            <Fingerprint size={14} />
            WHY THIS FEATURE EXISTS
          </span>
          <h2 id="feature-evidence-heading" tabIndex={-1}>
            {data.feature.label}
          </h2>
        </div>
        <button
          aria-label="Hide feature evidence"
          onClick={() =>
            state.performPocAction({ type: 'evidence', open: false })
          }
        >
          <X size={17} />
        </button>
      </header>
      <div className="preview-evidence-body">
        <section>
          <h3>Approved requirements</h3>
          {data.records.map((r) => (
            <article className="evidence-requirement" key={r.id}>
              <Link to={`/requirements?selected=${r.id}`}>{r.id} ↗</Link>
              <span>
                {r.type === 'business-rule'
                  ? 'Business rule'
                  : r.type === 'assumption'
                    ? 'Acknowledged assumption'
                    : r.type === 'non-functional'
                      ? 'Non-functional'
                      : 'Functional'}{' '}
                ·{' '}
                {state.pocBaseline?.requirementIds.includes(r.id)
                  ? 'Baseline input'
                  : 'Not in baseline'}
              </span>
              <p>{r.description}</p>
            </article>
          ))}
        </section>
        <ArrowDown
          className="evidence-flow-arrow"
          size={15}
          aria-hidden="true"
        />
        {data.sources.length > 0 ? (
          <section>
            <h3>Conversation evidence</h3>
            {data.sources.map((m) => (
              <blockquote key={m.id}>
                <cite>
                  {m.speaker} · {m.timestamp} · {m.id}
                </cite>
                <p>“{m.text}”</p>
                <Link to={`/session?source=${m.id}`}>View Conversation ↗</Link>
              </blockquote>
            ))}
          </section>
        ) : (
          <section>
            <h3>Scenario evidence</h3>
            <p>
              Scenario brief and acknowledged demo assumptions. No client
              transcript is attributed to this dependency.
            </p>
          </section>
        )}
        {data.questions.length > 0 && (
          <section className="evidence-clarification">
            <h3>Clarification → confirmed baseline</h3>
            {data.questions.map((q) => (
              <div key={q.id}>
                <span>{q.id} · Consultant reviewed</span>
                <p>{q.question}</p>
                {q.id === 'OQ-001' && (
                  <>
                    <small>Original ambiguity</small>
                    <blockquote>
                      {transcript.find((m) => m.id === q.sourceMessageId)?.text}
                    </blockquote>
                    <small>Client answer</small>
                    <blockquote>
                      {
                        transcript.find((m) => m.id === q.resolutionMessageId)
                          ?.text
                      }
                    </blockquote>
                  </>
                )}
                <div className="evidence-id-chips">
                  {q.affectedRequirementIds.map((id) => (
                    <Link key={id} to={`/requirements?selected=${id}`}>
                      ✓ {id}
                    </Link>
                  ))}
                </div>
                <Link to={`/clarifications?selected=${q.id}`}>
                  View Clarification ↗
                </Link>
              </div>
            ))}
          </section>
        )}
        <section>
          <h3>Approved scope decision</h3>
          {data.scopes.map((item) => {
            const decision = state.pocBaseline?.decisions[item.id];
            return (
              <article key={item.id}>
                <strong>
                  {decision
                    ? scopeDecisionLabels[decision.decision]
                    : 'Not approved'}{' '}
                  · {item.title}
                </strong>
                <p>{decision?.reason ?? item.reason}</p>
                <Link to={`/scope?selected=${item.id}`}>View POC Scope ↗</Link>
              </article>
            );
          })}
        </section>
        <section>
          <h3>Generated artifacts</h3>
          {data.artifacts.map((a) => (
            <article className="evidence-artifact" key={a.id}>
              <FileCheck2 size={14} />
              <div>
                <Link
                  to="/generation"
                  onClick={() => state.selectGenerationArtifact(a.id)}
                >
                  {a.label} ↗
                </Link>
                <code>{a.path}</code>
                <small>
                  {agents.find((agent) => agent.id === a.generatedBy)?.name} ·{' '}
                  {state.generation.artifactStatuses[a.id]}
                </small>
              </div>
            </article>
          ))}
        </section>
        <section>
          <h3>Phase 6 test evidence</h3>
          {data.tests.length ? (
            data.tests.map((t) => (
              <article className="evidence-test" key={t.id}>
                <code>{t.id}</code>
                <p>{t.label}</p>
                <span>
                  ✓ {state.generation.testResults[t.id]?.toUpperCase()}
                  {t.successCriterionId ? ` · ${t.successCriterionId}` : ''}
                </span>
              </article>
            ))
          ) : (
            <p className="evidence-gap">
              No dedicated Phase 6 check maps to this feature. Requirement,
              conversation and artifact links remain available.
            </p>
          )}
        </section>
        <p className="evidence-footnote">
          Evidence metadata from RB-001 · simulated validation
        </p>
      </div>
    </aside>
  );
}
