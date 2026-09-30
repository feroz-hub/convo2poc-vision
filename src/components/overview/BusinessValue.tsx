import { ArrowRight, Timer, ShieldCheck } from 'lucide-react';
import { processComparison } from '@/data/overview';
export function BusinessValue() {
  return (
    <section
      className="overview-section business-value"
      aria-labelledby="value-title"
    >
      <div className="value-intro">
        <span className="section-kicker">THE VALUE: SHORTER TIME-TO-POC</span>
        <h2 id="value-title">Less distance between a problem and proof</h2>
        <p>
          Reduce the gap between a client explaining a problem and seeing a
          reviewable working solution.
        </p>
        <div>
          <span>
            <Timer size={14} />
            Earlier requirement validation
          </span>
          <span>
            <ShieldCheck size={14} />
            Preserved human control
          </span>
        </div>
      </div>
      <div className="process-comparison">
        {processComparison.map((process) => (
          <div className={`process-row ${process.id}`} key={process.id}>
            <div className="process-label">
              <strong>{process.title}</strong>
              <span>{process.caption}</span>
            </div>
            <ol>
              {process.stages.map((stage, index) => (
                <li key={stage}>
                  <span>{stage}</span>
                  {index < process.stages.length - 1 && (
                    <ArrowRight size={12} aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}
        <p className="comparison-note">
          Conceptual comparison · illustrative workflow, no quantified savings
          claim
        </p>
      </div>
    </section>
  );
}
