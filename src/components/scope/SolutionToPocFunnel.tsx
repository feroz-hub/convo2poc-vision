import { ArrowRight, BrainCircuit, ShieldCheck, Layers3 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useDemoStore } from '@/store/demoStore';
import { selectScopeSummary } from '@/store/scopeSelectors';
export function SolutionToPocFunnel() {
  const counts = useDemoStore(useShallow(selectScopeSummary));
  const reduced = useReducedMotion();
  const approved = useDemoStore((s) => s.scopeApproved);
  return (
    <section
      className="scope-funnel"
      aria-label="Full solution to governed prototype"
    >
      <div className="full-solution">
        <span className="scope-kicker">
          <Layers3 size={15} aria-hidden="true" />
          Full solution
        </span>
        <strong>
          {counts.total}
          <small> capabilities considered</small>
        </strong>
        <div className="capability-matrix" aria-hidden="true">
          {Array.from({ length: counts.total }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <p>The broader client vision</p>
      </div>
      <div className="scope-funnel-engine">
        <svg
          viewBox="0 0 200 100"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path d="M0 5 L75 30 M0 95 L75 70 M125 30 L200 38 M125 70 L200 62" />
        </svg>
        <span>
          <BrainCircuit size={26} aria-hidden="true" />
        </span>
        <strong>Scope intelligence</strong>
        <small>Evidence · Value · Feasibility</small>
      </div>
      <div className="poc-reduction">
        <span className="scope-kicker">
          <ShieldCheck size={15} aria-hidden="true" />
          {approved ? 'Approved POC v1' : 'Recommended POC v1'}
        </span>
        <motion.div
          className="scope-distribution"
          layout={!reduced}
          aria-hidden="true"
        >
          {(['included', 'mocked', 'excluded'] as const).map((decision) => (
            <span
              key={decision}
              className={decision}
              style={{ flex: counts[decision] }}
            >
              {Array.from({ length: counts[decision] }, (_, i) => (
                <i key={i} />
              ))}
            </span>
          ))}
        </motion.div>
        <div className="funnel-counts">
          <div>
            <strong>{counts.included}</strong>
            <span>Included</span>
          </div>
          <div>
            <strong>{counts.mocked}</strong>
            <span>Simulated</span>
          </div>
          <div>
            <strong>{counts.excluded}</strong>
            <span>Deferred</span>
          </div>
        </div>
        <p>
          <ArrowRight size={14} aria-hidden="true" />
          Deliberately narrowed. Every decision retained.
        </p>
      </div>
    </section>
  );
}
