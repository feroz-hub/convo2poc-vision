import { useDemoTarget } from '@/components/demo/demoTargets';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import {
  BrainCircuit,
  TriangleAlert,
  UserRound,
  Check,
  Plus,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';
import { requirements, clarifications } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { scenario } from '@/data/scenario';
import {
  liveInsights,
  insightLabels,
  priorityAnswerConfirmationIds,
  type LiveInsightEvent,
} from '@/data/liveSession';
import { useDemoStore } from '@/store/demoStore';
import { selectSessionCounts } from '@/store/sessionSelectors';
function IntelligenceSummary() {
  const counts = useDemoStore(useShallow(selectSessionCounts));
  return (
    <dl className="intelligence-summary">
      {(
        [
          ['Requirements', counts.requirements],
          ['Confirmed', counts.confirmed],
          ['Needs clarification', counts.clarifications],
          ['Actors', counts.actors],
          ['Business rules', counts.rules],
          ['Assumptions', counts.assumptions],
        ] as const
      ).map(([label, count]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{String(count).padStart(2, '0')}</dd>
        </div>
      ))}
    </dl>
  );
}
function AmbiguityAlert() {
  const demoTarget = useDemoTarget('session-ambiguity');
  const open = useDemoStore((s) => s.openClarificationIds);
  const visible = useDemoStore((s) => s.visibleTranscriptMessageIds);
  const insights = useDemoStore((s) => s.visibleInsightEventIds);
  const confirmed = useDemoStore((s) => s.confirmedRequirementIds);
  const readiness = useDemoStore((s) => s.liveReadiness);
  const ambiguity = clarifications.find((q) => q.id === 'OQ-001')!;
  if (
    !insights.includes('insight-clarify-OQ-001') ||
    !open.includes(ambiguity.id)
  )
    return null;
  const answer = transcript.find(
    (m) => m.id === ambiguity.resolutionMessageId,
  )!;
  const answerVisible = visible.includes(answer.id);
  const priorityConfirmed = priorityAnswerConfirmationIds.every((id) =>
    confirmed.includes(id),
  );
  return (
    <aside
      {...demoTarget}
      className={`ambiguity-alert ${priorityConfirmed ? 'answer-confirmed' : ''}`}
      aria-labelledby="ambiguity-title"
    >
      <h3 id="ambiguity-title">
        {priorityConfirmed ? (
          <Check size={17} aria-hidden="true" />
        ) : (
          <TriangleAlert size={17} aria-hidden="true" />
        )}
        {priorityConfirmed
          ? 'Priority requirements confirmed'
          : 'Ambiguity detected'}{' '}
        <code>{ambiguity.id}</code>
      </h3>
      <blockquote>
        “{transcript.find((m) => m.id === ambiguity.sourceMessageId)!.text}”
      </blockquote>
      <p>
        <strong>
          {answerVisible ? 'Original ambiguity' : 'Missing definition'}
        </strong>
        {ambiguity.reason}
      </p>
      <p>
        <strong>Suggested clarification</strong>“{ambiguity.question}”
      </p>
      {answerVisible && (
        <div className="clarification-answer">
          <ArrowDown size={16} aria-hidden="true" />
          <p>
            <strong>Client answer · {answer.timestamp}</strong>
          </p>
          <blockquote>“{answer.text}”</blockquote>
          {priorityConfirmed ? (
            <>
              <ul aria-label="Confirmed priority requirements">
                {priorityAnswerConfirmationIds.map((id) => (
                  <li key={id}>
                    <Check size={14} aria-hidden="true" />
                    <span>
                      <code>{id}</code> confirmed
                    </span>
                  </li>
                ))}
                <li>
                  <Check size={14} aria-hidden="true" />
                  <span>POC readiness increased · {readiness}%</span>
                </li>
              </ul>
            </>
          ) : (
            <p>Structuring the client’s answer…</p>
          )}
        </div>
      )}
      <span className="clarification-status">
        {priorityConfirmed
          ? 'Requirements confirmed · formal review pending'
          : 'Needs clarification · review pending'}
      </span>
      <Link to={`/clarifications?selected=${ambiguity.id}`}>
        Review Clarification →
      </Link>
      {answerVisible && (
        <small>
          Client response captured at {answer.timestamp}. Consultant review is
          available in the Clarification Center.
        </small>
      )}
    </aside>
  );
}
export function InsightEventCard({ event }: { event: LiveInsightEvent }) {
  const reduced = useReducedMotion();
  const record = requirements.find((r) => r.id === event.requirementId);
  const source = transcript.find((m) => m.id === event.sourceMessageId);
  const warning =
    event.kind === 'clarification-needed' ||
    event.kind === 'open-question-detected';
  const Icon = warning
    ? TriangleAlert
    : event.kind === 'actor-detected'
      ? UserRound
      : event.kind === 'requirement-confirmed'
        ? Check
        : Plus;
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
      className={`insight-card ${warning ? 'question' : ''}`}
    >
      <div className="insight-card-heading">
        <Icon size={15} aria-hidden="true" />
        <code>{record?.id ?? (event.actor ? 'ACTOR' : 'CONTEXT')}</code>
        <span>{insightLabels[event.kind]}</span>
      </div>
      <h3>{record?.title ?? event.actor ?? 'Fragmented request intake'}</h3>
      {event.kind !== 'requirement-confirmed' && (
        <p>
          {record?.description ??
            (event.actor
              ? 'Role identified in the client workflow.'
              : scenario.businessProblem)}
        </p>
      )}
      <div className="insight-card-meta">
        <span>
          {warning
            ? 'Needs clarification'
            : event.kind === 'requirement-confirmed'
              ? 'Confirmed · explicit statement'
              : 'Detected'}
        </span>
        {record && <span>Confidence {record.confidence}%</span>}
        <span>Source: {source?.timestamp ?? 'Scenario brief'}</span>
      </div>
    </motion.li>
  );
}
export function LiveIntelligencePanel() {
  const demoTarget = useDemoTarget('session-requirement-detection');
  const ids = useDemoStore((s) => s.visibleInsightEventIds);
  const latest = liveInsights.find((i) => i.id === ids.at(-1));
  const reduced = useReducedMotion();
  return (
    <section
      {...demoTarget}
      className="intelligence-panel session-panel"
      aria-labelledby="intelligence-title"
    >
      <div className="session-panel-title">
        <div>
          <BrainCircuit size={19} aria-hidden="true" />
          <h2 id="intelligence-title">Live intelligence</h2>
        </div>
        <span>Evidence → Structure</span>
      </div>
      <IntelligenceSummary />
      <Link className="session-requirements-link" to="/requirements">
        Inspect Requirement Intelligence →
      </Link>
      <div className="insight-signal" aria-hidden="true">
        {latest ? (
          <motion.div
            key={latest.id}
            initial={reduced ? false : { opacity: 0.2, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0 : 0.45 }}
          >
            <ScanSignal />{' '}
            <span>
              {latest.sourceMessageId
                ? `Statement ${transcript.find((m) => m.id === latest.sourceMessageId)?.timestamp}`
                : 'Scenario brief'}
            </span>
            <ArrowRight size={15} />
            <strong>{insightLabels[latest.kind]}</strong>
          </motion.div>
        ) : (
          <div>
            <ScanSignal />
            <span>Listening for requirement signals</span>
          </div>
        )}
      </div>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {latest
          ? `${insightLabels[latest.kind]}: ${latest.requirementId ?? latest.actor ?? 'business context'}`
          : 'Intelligence ready'}
      </p>
      <AmbiguityAlert />
      <div
        className="intelligence-feed"
        tabIndex={0}
        role="region"
        aria-label="Live insight events"
      >
        {!ids.length ? (
          <div className="session-empty">
            <BrainCircuit size={32} aria-hidden="true" />
            <h3>Waiting for requirement signals</h3>
            <p>
              Requirements, roles, business rules and unanswered questions will
              appear as the conversation unfolds.
            </p>
            <span>Every detection keeps its source evidence.</span>
          </div>
        ) : (
          <ol>
            {[...liveInsights]
              .filter((i) => ids.includes(i.id))
              .reverse()
              .map((event) => (
                <InsightEventCard key={event.id} event={event} />
              ))}
          </ol>
        )}
      </div>
      <p className="intelligence-footnote">
        Requirements counts functional + non-functional records. Rules,
        assumptions and open questions are counted separately.
      </p>
    </section>
  );
}
function ScanSignal() {
  return <BrainCircuit size={16} aria-hidden="true" />;
}

export function InsightSignalAnimation() {
  const id = useDemoStore((s) => s.visibleInsightEventIds.at(-1));
  const event = liveInsights.find((i) => i.id === id);
  const reduced = useReducedMotion();
  if (!event?.sourceMessageId || reduced) return null;
  return (
    <motion.span
      key={id}
      className="source-signal"
      aria-hidden="true"
      initial={{ opacity: 1, x: -8 }}
      animate={{ opacity: 0, x: 14 }}
      transition={{ duration: 0.7 }}
    >
      <ArrowRight size={20} />
    </motion.span>
  );
}
