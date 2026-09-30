import { HeroCopy } from './HeroCopy';
import { ConceptFlowVisual } from './ConceptFlowVisual';
export function OverviewHero({ onStart }: { onStart: () => void }) {
  return (
    <section className="overview-hero" aria-labelledby="overview-title">
      <div className="hero-grid" aria-hidden="true" />
      <HeroCopy onStart={onStart} />
      <ConceptFlowVisual />
    </section>
  );
}
