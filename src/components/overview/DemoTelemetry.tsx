import { overviewMetrics } from '@/data/metrics';
import { MetricTelemetryCard } from './MetricTelemetryCard';
export function DemoTelemetry() {
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
        {overviewMetrics.map((metric) => (
          <MetricTelemetryCard key={metric.id} metric={metric} />
        ))}
      </dl>
    </section>
  );
}
