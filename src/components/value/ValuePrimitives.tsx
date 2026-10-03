import type { ReactNode } from 'react';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useDemoTarget } from '@/components/demo/demoTargets';
import type { DemoTargetId } from '@/demo/demoTypes';
export function ValueSection({
  title,
  eyebrow,
  target,
  children,
}: {
  title: string;
  eyebrow: string;
  target?: DemoTargetId;
  children: ReactNode;
}) {
  const spotlight = useDemoTarget(target ?? 'value-summary');
  return (
    <section className="value-panel" {...(target ? spotlight : {})}>
      <header>
        <span className="value-kicker">{eyebrow}</span>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}
export function ValueMetrics({
  items,
}: {
  items: readonly (readonly [string, string | number])[];
}) {
  return (
    <dl className="value-metrics">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function ValueFlow({ items }: { items: readonly string[] }) {
  return (
    <ol className="value-flow">
      {items.map((item, i) => (
        <li key={`${i}-${item}`}>
          <span>{item}</span>
          {i < items.length - 1 && <ArrowRight size={16} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}
export function ValueCheck({
  done,
  children,
}: {
  done: boolean;
  children: ReactNode;
}) {
  return (
    <li className="value-check">
      {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      <span>{children}</span>
      <b>{done ? 'Complete' : 'Pending review'}</b>
    </li>
  );
}
