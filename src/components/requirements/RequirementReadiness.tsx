import { getLiveReadinessBreakdown } from '@/simulation/readiness';
import { useDemoStore } from '@/store/demoStore';
import { selectRequirementSummary } from '@/store/requirementSelectors';
import { clarifications } from '@/data/requirements';
export function RequirementReadiness() {
  const state = useDemoStore();
  const dimensions = getLiveReadinessBreakdown(state);
  const summary = selectRequirementSummary(state);
  const pct = (part: number, total: number) => Math.round((part / total) * 100);
  return (
    <section className="ri-readiness" aria-labelledby="ri-readiness-title">
      <header>
        <div>
          <span className="ri-kicker">Illustrative shared readiness model</span>
          <h2 id="ri-readiness-title">Requirement Readiness</h2>
        </div>
        <strong>{state.liveReadiness}%</strong>
      </header>
      <progress
        aria-label="Requirement readiness"
        max={100}
        value={state.liveReadiness}
      />
      <div className="ri-dimensions">
        {dimensions.map((d) => (
          <div key={d.id}>
            <span>
              {d.label}
              <small>{d.weight}% weight</small>
            </span>
            <strong>{Math.round(d.score)}%</strong>
            <progress
              max={100}
              value={d.score}
              aria-label={`${d.label} coverage`}
            />
          </div>
        ))}
      </div>
      <details className="ri-quality">
        <summary>Model quality · illustrative catalog coverage</summary>
        <dl>
          {[
            [
              'Source linked',
              pct(summary.traceable, summary.total),
              `${summary.traceable}/${summary.total} · transcript or scenario brief`,
            ],
            [
              'Confirmed',
              pct(summary.confirmed, summary.total),
              `${summary.confirmed}/${summary.total} records`,
            ],
            [
              'Clarification reviewed',
              pct(summary.clarified, clarifications.length),
              `${summary.clarified}/${clarifications.length} questions`,
            ],
            [
              'Scope linked',
              pct(summary.scoped, summary.total),
              `${summary.scoped}/${summary.total} · direct or evidence relationship`,
            ],
          ].map(([label, value, note]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {value}%<small>{note}</small>
              </dd>
            </div>
          ))}
        </dl>
        <p>
          Source linkage does not imply client confirmation. Scope links reflect
          planning decisions; implementation is pending.
        </p>
      </details>
    </section>
  );
}
