import { useState } from 'react';
import { Layers3, RotateCcw, ShieldCheck } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { scopeItems } from '@/data/scope';
import { useDemoStore } from '@/store/demoStore';
import {
  selectScopeSummary,
  selectGenerationReadiness,
} from '@/store/scopeSelectors';
import { SolutionToPocFunnel } from '@/components/scope/SolutionToPocFunnel';
import { ScopeBoard } from '@/components/scope/ScopeBoard';
import { ScopeInspector } from '@/components/scope/ScopeInspector';
import { ScopeContract } from '@/components/scope/ScopeContract';
import { ScopeApprovalGate } from '@/components/scope/ScopeApprovalGate';
import { Button } from '@/components/ui/button';
import '@/styles/scope.css';
export function ScopePage() {
  const [resetRevision, setResetRevision] = useState(0);
  const selected = useDemoStore((s) => s.selectedScopeItemId);
  const overrides = useDemoStore((s) => s.scopeOverrides);
  const approved = useDemoStore((s) => s.scopeApproved);
  const readiness = useDemoStore((s) => s.liveReadiness);
  const baseline = useDemoStore((s) => s.pocBaseline);
  const reset = useDemoStore((s) => s.reset);
  const counts = useDemoStore(useShallow(selectScopeSummary));
  const generation = useDemoStore(selectGenerationReadiness);
  const item =
    scopeItems.find((item) => item.id === selected) ?? scopeItems[0]!;
  return (
    <div className="scope-page page-content">
      <header className="scope-header">
        <div>
          <span className="scope-kicker">
            <Layers3 size={15} aria-hidden="true" />
            AI-assisted solution scoping
          </span>
          <h1>POC Scope Studio</h1>
          <p>
            Define the smallest prototype that proves the client's core
            workflow.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            reset();
            setResetRevision((revision) => revision + 1);
          }}
        >
          <RotateCcw size={15} />
          Reset scenario
        </Button>
      </header>
      <dl className="scope-summary">
        {[
          ['Requirement Readiness', `${readiness}%`],
          [
            'Scope Status',
            approved ? 'Approved · Locked' : 'Recommended · Editable',
          ],
          ['Baseline Status', baseline?.id ?? 'Not approved'],
          ['Human Overrides', counts.overrides],
          ['Generation', generation],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <SolutionToPocFunnel />
      <div className="scope-workspace-heading">
        <div>
          <h2>{approved ? 'Approved scope' : 'Recommended scope'}</h2>
          <span>
            Inspect a capability to review its evidence or adjust the decision.
          </span>
        </div>
        <span>
          <ShieldCheck size={14} aria-hidden="true" />
          {counts.complexity} boundary · {counts.complexityUnits} planning units{' '}
          <small>Illustrative complexity model</small>
        </span>
      </div>
      <div className="scope-workspace">
        <ScopeBoard />
        <ScopeInspector
          key={`${item.id}-${overrides[item.id]?.decision ?? item.decision}-${overrides[item.id]?.reason ?? ''}-${resetRevision}`}
          item={item}
        />
      </div>
      <ScopeContract />
      <ScopeApprovalGate />
    </div>
  );
}
