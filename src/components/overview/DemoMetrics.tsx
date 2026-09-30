import {
  Clock3,
  ListChecks,
  MessageCircleQuestion,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';
import { overviewMetrics } from '@/data/metrics';
const icons = {
  time: Clock3,
  requirements: ListChecks,
  clarifications: MessageCircleQuestion,
  traceability: GitBranch,
  tests: ShieldCheck,
};
export function DemoMetrics() {
  return (
    <section
      className="overview-section telemetry-section"
      aria-labelledby="metrics-title"
    >
      <div className="telemetry-heading">
        <h2 id="metrics-title">Illustrative demo metrics</h2>
        <p>Canonical scenario catalog · not production KPIs or live results</p>
      </div>
      <dl className="telemetry-grid">
        {overviewMetrics.map((metric) => {
          const Icon = icons[metric.icon];
          return (
            <div key={metric.id} className="telemetry-metric">
              <dt>
                <Icon size={15} aria-hidden="true" />
                {metric.label}
              </dt>
              <dd>{metric.value}</dd>
              <p>{metric.detail}</p>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
