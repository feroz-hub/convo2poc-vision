import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, GitBranch, ShieldCheck } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { selectPreviewTraceability } from '@/store/previewSelectors';
import { selectV2Ready } from '@/store/feedbackSelectors';
export function DemoCompletion() {
  const completion = useRef<HTMLElement>(null);
  useEffect(() => {
    completion.current?.scrollIntoView?.({ behavior: 'auto', block: 'start' });
    completion.current?.focus({ preventScroll: true });
  }, []);
  const s = useDemoStore(),
    navigate = useNavigate();
  const review = (route: string) => {
    s.exitFullDemo();
    navigate(route);
  };
  return (
    <section
      ref={completion}
      tabIndex={-1}
      className="demo-completion page-content"
      aria-labelledby="demo-complete-title"
    >
      <span className="demo-complete-icon">
        <GitBranch size={36} />
      </span>
      <p className="demo-kicker">CONVO2POC GUIDED DEMO COMPLETE</p>
      <h1 id="demo-complete-title">
        Client intent. Governed evolution. Working proof.
      </h1>
      <p>
        The complete walkthrough used the same product transitions as manual
        exploration.
      </p>
      <ol>
        {[
          ['Conversation', 'Understood', s.sessionComplete],
          ['Requirements', 'Structured', s.detectedRequirementIds.length > 0],
          [
            'Clarification',
            'Consultant reviewed',
            s.resolvedClarificationIds.length > 0,
          ],
          ['POC Scope', 'RB-001 approved', !!s.pocBaseline],
          ['POC v1', 'Generated and validated', !!s.pocRuntime.approval],
          [
            'Validation',
            'Build, tests and sandbox checked',
            s.generation.status === 'completed' &&
              s.buildChecks.every((c) => c.status === 'passed'),
          ],
          [
            'Traceability',
            `${selectPreviewTraceability(s).coverage}% for scoped workflows`,
            selectPreviewTraceability(s).coverage === 100,
          ],
          [
            'Client change',
            'Governed through CR-001',
            s.approvedChangeIds.includes('CR-001'),
          ],
          ['POC v2', 'Targeted regeneration validated', selectV2Ready(s)],
          [
            'Value Report',
            'Executive evidence ready for review',
            selectV2Ready(s),
          ],
        ].map(([title, label, done]) => (
          <li key={String(title)}>
            <Check size={18} />
            <div>
              <b>{title}</b>
              <span>{done ? label : 'Review required'}</span>
            </div>
          </li>
        ))}
      </ol>
      <div className="demo-completion-actions">
        <button onClick={s.exitFullDemo}>Explore Manually</button>
        <button onClick={() => review('/value')}>Review Value Report</button>
        <button onClick={s.restartFullDemo}>Replay Demo</button>
        <button onClick={() => review('/preview?version=v2')}>
          Review POC v2
        </button>
        <button onClick={() => review('/traceability?feature=approval')}>
          Review Traceability
        </button>
      </div>
      <p className="demo-complete-governance">
        <ShieldCheck size={17} /> Consultant approvals were explicitly simulated
        for this guided demonstration.
      </p>
    </section>
  );
}
