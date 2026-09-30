import { useEffect } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import {
  Clock3,
  ListChecks,
  MessageCircleQuestion,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';
import { overviewMetrics, catalogMetrics } from '@/data/metrics';
function MetricNumber({ value }: { value: string }) {
  const reduced = useReducedMotion();
  const target = Number.parseInt(value, 10);
  const counter = useMotionValue(reduced ? target : 0);
  const display = useTransform(counter, (current) =>
    value.replace(/^\d+/, String(Math.round(current))),
  );
  useEffect(() => {
    const control = animate(counter, target, { duration: reduced ? 0 : 0.9 });
    return () => control.stop();
  }, [counter, target, reduced]);
  return (
    <>
      <span className="sr-only">{value}</span>
      <motion.span aria-hidden="true">{display}</motion.span>
    </>
  );
}
const icons = {
  time: Clock3,
  requirements: ListChecks,
  clarifications: MessageCircleQuestion,
  traceability: GitBranch,
  tests: ShieldCheck,
};

export function MetricTelemetryCard({
  metric,
}: {
  metric: (typeof overviewMetrics)[number];
}) {
  const Icon = icons[metric.icon];
  return (
    <div
      className={`telemetry-metric telemetry-${metric.icon}`}
      data-variant={metric.icon}
    >
      <dt>
        <Icon size={15} aria-hidden="true" />
        {metric.label}
      </dt>
      <dd>
        <MetricNumber value={metric.value} />
      </dd>
      <TelemetryVisual variant={metric.icon} progress={metric.progress} />
      <p>{metric.detail}</p>
    </div>
  );
}
function TelemetryVisual({
  variant,
  progress,
}: {
  variant: (typeof overviewMetrics)[number]['icon'];
  progress: number;
}) {
  if (variant === 'time')
    return (
      <div
        className="telemetry-visual telemetry-time-visual"
        aria-hidden="true"
      >
        <Clock3 size={32} />
        <span>Scenario estimate</span>
      </div>
    );
  if (variant === 'requirements')
    return (
      <div
        className="telemetry-visual telemetry-record-visual"
        aria-hidden="true"
      >
        {Array.from({ length: catalogMetrics.requirements }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    );
  if (variant === 'clarifications')
    return (
      <div
        className="telemetry-visual telemetry-question-visual"
        aria-hidden="true"
      >
        {Array.from({ length: catalogMetrics.clarifications }, (_, index) => (
          <span key={index}>
            {index < catalogMetrics.resolvedClarifications ? '✓' : '?'}
          </span>
        ))}
      </div>
    );
  if (variant === 'tests')
    return (
      <div
        className="telemetry-visual telemetry-test-visual"
        aria-hidden="true"
      >
        {Array.from({ length: catalogMetrics.testsTotal }, (_, index) => (
          <span
            key={index}
            className={index < catalogMetrics.testsPassed ? 'passed' : ''}
          />
        ))}
      </div>
    );
  return (
    <svg
      className="telemetry-visual telemetry-trace-visual"
      viewBox="0 0 140 40"
      aria-hidden="true"
    >
      <path d="M8 20H45L80 8H130M45 20L80 32H130" />
      <circle cx="8" cy="20" r="4" />
      <circle cx="45" cy="20" r="4" />
      <circle cx="80" cy="8" r="4" />
      <circle cx="130" cy="8" r="4" />
      <circle cx="80" cy="32" r="4" />
      <circle cx="130" cy="32" r="4" />
      <rect x="5" y="38" width={progress * 1.3} height="2" />
    </svg>
  );
}
