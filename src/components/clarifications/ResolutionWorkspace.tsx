import { GuidedControls } from '@/components/demo/GuidedControls';
import { useDemoTarget } from '@/components/demo/demoTargets';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  Check,
  ShieldCheck,
  TriangleAlert,
  Pencil,
  ScanText,
} from 'lucide-react';
import { transcript } from '@/data/transcript';
import { requirements } from '@/data/requirements';
import { participants } from '@/data/liveSession';
import { useDemoStore } from '@/store/demoStore';
import {
  selectClarificationStatus,
  clarificationStatusLabels,
} from '@/store/clarificationSelectors';
import { Button } from '@/components/ui/button';
import type { Clarification } from '@/types/domain';
export function ClientEvidence({ messageId }: { messageId: string }) {
  const message = transcript.find((m) => m.id === messageId)!;
  const participant = participants.find((p) => p.role === message.role)!;
  return (
    <div className="client-evidence">
      <header>
        <span className="evidence-initials">{participant.initials}</span>
        <div>
          <strong>{participant.name}</strong>
          <small>
            {message.speaker} · <time>{message.timestamp}</time> ·{' '}
            <code>{message.id}</code>
          </small>
        </div>
      </header>
      <blockquote>“{message.text}”</blockquote>
      <Link to={`/session?source=${message.id}`}>
        View in Live Session <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
function FlowArrow() {
  return (
    <div className="resolution-arrow" aria-hidden="true">
      <ArrowDown size={17} />
    </div>
  );
}
export function ResolutionWorkspace({ item }: { item: Clarification }) {
  const demoTarget = useDemoTarget('clarification-oq001');
  const state = useDemoStore();
  const status = selectClarificationStatus(state, item);
  const confirmed = status === 'confirmed';
  const reviewed = state.reviewedEvidenceIds.includes(item.id);
  const accepted = state.acceptedSuggestionIds.includes(item.id);
  const question = state.editedClarificationQuestions[item.id] ?? item.question;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(question);
  const reduced = useReducedMotion();
  const source = transcript.find((m) => m.id === item.sourceMessageId)!;
  return (
    <GuidedControls>
      <section
        {...demoTarget}
        id="resolution-workspace"
        className="resolution-workspace governance-panel"
        aria-labelledby="resolution-title"
      >
        <div className="governance-panel-heading">
          <ShieldCheck size={18} aria-hidden="true" />
          <h2 id="resolution-title">Resolution workspace</h2>
        </div>
        <div className="resolution-context">
          <code>{item.id}</code>
          <span className={`governance-status ${status}`}>
            {confirmed ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <CircleMark />
            )}
            {clarificationStatusLabels[status]}
          </span>
        </div>
        <motion.div
          key={item.id}
          initial={reduced ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
        >
          <div className="resolution-stage original">
            <h3>
              <span>01</span>{' '}
              {source.role === 'client'
                ? 'Original client statement'
                : 'Original conversation statement'}
            </h3>
            <blockquote>“{source.text}”</blockquote>
            <small>
              {source.speaker} · {source.timestamp} · {source.id}
            </small>
          </div>
          <FlowArrow />
          <div className="resolution-stage uncertainty">
            <h3>
              <span>02</span> Why Convo2POC flagged it
            </h3>
            <p>
              <TriangleAlert size={16} aria-hidden="true" />
              {item.reason}
            </p>
            <small>
              {item.category === 'ambiguity'
                ? 'An undefined priority could route requests to the wrong approval path.'
                : item.category === 'role'
                  ? 'Unclear assignment authority could permit the wrong role to change ownership.'
                  : 'An unagreed integration boundary could expand the first prototype.'}
            </small>
          </div>
          <FlowArrow />
          <div className="resolution-stage">
            <h3>
              <span>03</span> AI-suggested clarification
            </h3>
            {editing ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  state.editClarificationQuestion(item.id, draft);
                  setEditing(false);
                }}
              >
                <label htmlFor="clarification-question">
                  Suggested question
                </label>
                <textarea
                  id="clarification-question"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                />
                <div className="question-actions">
                  <Button size="sm" disabled={!draft.trim()}>
                    Save question
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditing(false);
                      setDraft(question);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <blockquote>“{question}”</blockquote>
                <div className="question-actions">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={confirmed || accepted}
                    onClick={() => state.acceptClarificationSuggestion(item.id)}
                  >
                    <Check size={14} />
                    {accepted ? 'Suggestion accepted' : 'Accept suggestion'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={confirmed}
                    onClick={() => setEditing(true)}
                  >
                    <Pencil size={14} />
                    Edit question
                  </Button>
                </div>
              </>
            )}
            <small>AI-assisted suggestion · local draft only</small>
          </div>
          <FlowArrow />
          <div className="resolution-stage evidence-stage">
            <h3>
              <span>04</span> Client response / evidence
            </h3>
            <ClientEvidence messageId={item.resolutionMessageId} />
            <small>
              {state.visibleTranscriptMessageIds.includes(
                item.resolutionMessageId,
              )
                ? 'Answer captured in Live Session.'
                : 'Recorded workshop evidence available for consultant review.'}
            </small>
          </div>
          <FlowArrow />
          <div
            className={`resolution-stage proposed ${confirmed ? 'confirmed' : ''}`}
          >
            <h3>
              <span>05</span>{' '}
              {confirmed
                ? 'Confirmed requirement update'
                : 'Proposed requirement update'}
            </h3>
            <ul aria-label="Resolution outputs">
              {item.affectedRequirementIds.map((id) => (
                <li key={id} id={`requirement-${id}`}>
                  <code>{id}</code>
                  <p>{requirements.find((r) => r.id === id)!.description}</p>
                  <small>
                    {confirmed
                      ? '✓ Confirmed by consultant'
                      : 'Proposed · consultant approval required'}
                  </small>
                </li>
              ))}
            </ul>
            {!item.affectedRequirementIds.length && <p>{item.resolution}</p>}
          </div>
        </motion.div>
        <div
          className={`requirement-transformation ${confirmed ? 'confirmed' : ''}`}
          aria-label="Before and after requirement transformation"
        >
          <div>
            <small>BEFORE · Unclear</small>
            <TriangleAlert size={16} aria-hidden="true" />
            <p>{source.text}</p>
          </div>
          <ArrowDown aria-hidden="true" size={18} />
          <motion.div
            key={`${item.id}-${confirmed}`}
            initial={reduced ? false : { opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          >
            <small>AFTER · {confirmed ? 'Confirmed' : 'Proposed'}</small>
            {confirmed ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <ScanText size={16} aria-hidden="true" />
            )}
            <p>{item.resolution}</p>
          </motion.div>
        </div>
        <div className="resolution-governance">
          <h3>
            <ShieldCheck size={17} aria-hidden="true" />
            {confirmed
              ? 'Confirmed by consultant'
              : 'Consultant review required'}
          </h3>
          <p>
            {confirmed
              ? 'Evidence and the decision remain linked. Reopening withdraws this review approval.'
              : reviewed
                ? 'Evidence reviewed. Accept or reject the proposed update.'
                : 'Review the recorded answer before accepting a requirement update.'}
          </p>
          <div className="resolution-actions">
            {confirmed ? (
              <Button
                variant="outline"
                onClick={() => state.reopenClarification(item.id)}
              >
                Reopen Clarification
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={reviewed}
                  onClick={() => state.reviewClarificationEvidence(item.id)}
                >
                  {reviewed ? 'Evidence reviewed' : 'Review Evidence'}
                </Button>
                <Button
                  disabled={!reviewed}
                  onClick={() => state.acceptClarificationResolution(item.id)}
                >
                  <ShieldCheck size={15} />
                  Accept Resolution
                </Button>
                <Button
                  variant="ghost"
                  disabled={!reviewed}
                  onClick={() => state.rejectClarificationResolution(item.id)}
                >
                  Reject Resolution
                </Button>
              </>
            )}
          </div>
          {state.rejectedResolutionIds.includes(item.id) && (
            <p className="governance-rejection">
              Resolution rejected. Re-review the evidence before proposing
              approval.
            </p>
          )}
        </div>
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {item.id}: {clarificationStatusLabels[status]}
        </p>
      </section>
    </GuidedControls>
  );
}
function CircleMark() {
  return <span aria-hidden="true">○</span>;
}
