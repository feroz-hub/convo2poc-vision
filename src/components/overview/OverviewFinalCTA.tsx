import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function OverviewFinalCTA({ onStart }: { onStart: () => void }) {
  return (
    <section
      className="overview-section overview-final-cta"
      aria-labelledby="final-cta-title"
    >
      <div>
        <span className="section-kicker">
          CONVERSATION → CLARITY → WORKING PROTOTYPE
        </span>
        <h2 id="final-cta-title">
          A clear path. Human control. Working proof.
        </h2>
        <span className="final-governance">
          <LockKeyhole size={14} aria-hidden="true" />
          Approval before generation and version changes
        </span>
      </div>
      <Button onClick={onStart} size="lg">
        Explore the demo
        <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </section>
  );
}
