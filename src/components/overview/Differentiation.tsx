import { differentiators } from '@/data/overview';
export function Differentiation() {
  return (
    <section className="overview-section" aria-labelledby="difference-title">
      <div className="overview-section-heading">
        <div>
          <span className="section-kicker">CLARITY AND CONTROL, BUILT IN</span>
          <h2 id="difference-title">More than generating code</h2>
        </div>
        <p className="section-aside">
          A reviewable path from business intent to engineering evidence.
        </p>
      </div>
      <div className="differentiation-grid">
        {differentiators.map((item) => {
          const Icon = item.icon;
          return (
            <article className="difference-module" key={item.title}>
              <Icon size={22} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span>{item.cue}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
