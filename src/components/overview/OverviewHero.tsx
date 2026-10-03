import { useDemoTarget } from '@/components/demo/demoTargets';
import { HeroCopy } from './HeroCopy';
import { ConceptFlowVisual } from './ConceptFlowVisual';
export function OverviewHero({
  onStart,
  onManual,
}: {
  onStart: () => void;
  onManual: () => void;
}) {
  const demoTarget = useDemoTarget('overview-concept');
  return (
    <section
      className="overview-hero"
      {...demoTarget}
      aria-labelledby="overview-title"
    >
      <div className="hero-grid" aria-hidden="true" />
      <HeroCopy onStart={onStart} onManual={onManual} />
      <ConceptFlowVisual />
    </section>
  );
}
