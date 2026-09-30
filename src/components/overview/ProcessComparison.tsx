import {
  ArrowRight,
  AudioLines,
  NotebookPen,
  ListChecks,
  Network,
  Code2,
  ShieldCheck,
  Monitor,
  MessageCircleQuestion,
  LockKeyhole,
  WandSparkles,
} from 'lucide-react';
import { processComparison } from '@/data/overview';
const processIcons = {
  traditional: [
    AudioLines,
    NotebookPen,
    ListChecks,
    Network,
    Code2,
    ShieldCheck,
    Monitor,
  ],
  convo2poc: [
    AudioLines,
    ListChecks,
    MessageCircleQuestion,
    LockKeyhole,
    WandSparkles,
    ShieldCheck,
    Monitor,
  ],
};
export function ProcessComparison() {
  return (
    <section
      className="overview-section visual-comparison"
      aria-labelledby="value-title"
    >
      <div className="overview-section-heading">
        <div>
          <span className="section-kicker">
            FROM HANDOFFS TO A CONNECTED FLOW
          </span>
          <h2 id="value-title">Traditional vs Convo2POC</h2>
        </div>
        <span className="section-aside">
          Conceptual comparison · no quantified savings claim
        </span>
      </div>
      <div className="comparison-grid">
        <TraditionalFlow />
        <Convo2PocFlow />
      </div>
    </section>
  );
}

function ComparisonFlow({
  process,
}: {
  process: (typeof processComparison)[number];
}) {
  return (
    <article
      className={`comparison-panel ${process.id}`}
      aria-labelledby={`${process.id}-title`}
    >
      <div className="process-label">
        <h3 id={`${process.id}-title`}>{process.title}</h3>
        <span>{process.caption}</span>
      </div>
      <ol>
        {process.stages.map((stage, index) => {
          const Icon = processIcons[process.id][index];
          return (
            <li key={stage}>
              <div className="comparison-node">
                {Icon && <Icon size={22} aria-hidden="true" />}
              </div>
              <span>{stage}</span>
              {index < process.stages.length - 1 && (
                <ArrowRight
                  className="comparison-arrow"
                  size={14}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <div className="comparison-footer">
        {process.id === 'traditional'
          ? 'Separate steps · interpretation at each handoff'
          : 'Source evidence · approval gates · traceable output'}
      </div>
    </article>
  );
}
export function TraditionalFlow() {
  return <ComparisonFlow process={processComparison[0]} />;
}
export function Convo2PocFlow() {
  return <ComparisonFlow process={processComparison[1]} />;
}
