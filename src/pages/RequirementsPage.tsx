import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BrainCircuit, RotateCcw } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { requirements } from '@/data/requirements';
import { useDemoStore } from '@/store/demoStore';
import { selectRequirementSummary } from '@/store/requirementSelectors';
import { RequirementModelVisual } from '@/components/requirements/RequirementModelVisual';
import { RequirementReadiness } from '@/components/requirements/RequirementReadiness';
import { RequirementWorkspace } from '@/components/requirements/RequirementWorkspace';
import { RequirementInspector } from '@/components/requirements/RequirementInspector';
import { Button } from '@/components/ui/button';
import '@/styles/requirements.css';
export function RequirementsPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('selected');
  const selected = useDemoStore((s) => s.requirementView.selectedId);
  const update = useDemoStore((s) => s.setRequirementView);
  const reset = useDemoStore((s) => s.reset);
  const readiness = useDemoStore((s) => s.liveReadiness);
  const summary = useDemoStore(useShallow(selectRequirementSummary));
  useEffect(() => {
    if (requested) update({ selectedId: requested });
  }, [requested, update]);
  const item = requirements.find((r) => r.id === selected) ?? requirements[0]!;
  return (
    <div className="requirements-page page-content">
      <header className="ri-header">
        <div>
          <span className="ri-kicker">
            <BrainCircuit size={15} aria-hidden="true" />
            AI-assisted requirement intelligence
          </span>
          <h1>Requirement Intelligence</h1>
          <p>Turn conversation into structured, traceable requirements.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            reset();
            setParams({});
          }}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Reset scenario
        </Button>
      </header>
      <dl className="ri-summary">
        {[
          ['Total Requirements', summary.total],
          ['Confirmed', summary.confirmed],
          ['Needs Clarification', summary.needsClarification],
          ['Business Rules', summary.rules],
          ['Assumptions', summary.assumptions],
          ['Actors', summary.actors],
          ['Requirement Readiness', `${readiness}%`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="ri-summary-note">
        {summary.functional} functional · {summary.rules} business rules ·{' '}
        {summary.nonFunctional} non-functional · {summary.assumptions}{' '}
        assumptions · {summary.questions} questions. {summary.captured}/
        {summary.total} captured in the simulation.
      </p>
      <div className="ri-overview">
        <RequirementModelVisual />
        <RequirementReadiness />
      </div>
      <div className="ri-workspace">
        <RequirementWorkspace
          onSelect={(id) => {
            update({ selectedId: id });
            setParams({ selected: id });
          }}
        />
        <RequirementInspector item={item} />
      </div>
    </div>
  );
}
