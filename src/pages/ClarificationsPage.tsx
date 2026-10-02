import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { ShieldCheck, RotateCcw, ArrowRight } from 'lucide-react';
import { clarifications } from '@/data/requirements';
import { useDemoStore } from '@/store/demoStore';
import { selectClarificationSummary } from '@/store/clarificationSelectors';
import { ClarificationQueue } from '@/components/clarifications/ClarificationQueue';
import { ResolutionWorkspace } from '@/components/clarifications/ResolutionWorkspace';
import { ClarificationImpactPanel } from '@/components/clarifications/ClarificationImpactPanel';
import { Button } from '@/components/ui/button';
import '@/styles/clarifications.css';
export function ClarificationsPage() {
  const [resetRevision, setResetRevision] = useState(0);
  const [params, setParams] = useSearchParams();
  const edits = useDemoStore((s) => s.editedClarificationQuestions);
  const selected = useDemoStore((s) => s.selectedClarificationId);
  const select = useDemoStore((s) => s.selectClarification);
  const reset = useDemoStore((s) => s.reset);
  const summary = useDemoStore(useShallow(selectClarificationSummary));
  const requested = params.get('selected');
  useEffect(() => {
    if (requested) select(requested);
  }, [requested, select]);
  const item =
    clarifications.find((q) => q.id === selected) ?? clarifications[0]!;
  return (
    <div className="clarifications-page page-content">
      <header className="clarification-header">
        <div>
          <span className="governance-eyebrow">
            <ShieldCheck size={15} aria-hidden="true" />
            AI-assisted requirement governance
          </span>
          <h1>Clarification Center</h1>
          <p>Resolve uncertainty before POC generation.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            reset();
            setResetRevision((value) => value + 1);
            setParams({});
          }}
        >
          <RotateCcw size={15} />
          Reset scenario
        </Button>
      </header>
      <dl className="clarification-summary">
        {[
          ['Open', summary.open],
          ['Resolved', summary.resolved],
          ['Needs Review', summary.needsReview],
          ['Requirements Affected', summary.affected],
          ['POC Readiness', `${summary.readiness}%`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div
        className="governance-story"
        aria-label="Clarification governance flow"
      >
        {[
          'Unclear statement',
          'Client evidence',
          'Consultant review',
          'Confirmed requirement',
        ].map((label, index) => (
          <span key={label}>
            {index > 0 && <ArrowRight size={16} aria-hidden="true" />}
            {label}
          </span>
        ))}
      </div>
      <div className="clarification-layout">
        <ClarificationQueue
          onSelect={(id) => {
            select(id);
            setParams({ selected: id });
          }}
        />
        <ResolutionWorkspace
          key={`${item.id}-${edits[item.id] ?? item.question}-${resetRevision}`}
          item={item}
        />
        <ClarificationImpactPanel item={item} />
      </div>
    </div>
  );
}
