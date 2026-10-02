import { ArrowRight, ShieldCheck, Minus } from 'lucide-react';
export function PolicyComparison({ proposed = true }: { proposed?: boolean }) {
  return (
    <section
      className="fb-policy"
      aria-label="Approval policy before and after"
    >
      <div>
        <span className="fb-kicker">RB-001 · POC v1</span>
        <h2>Original approval policy</h2>
        {['P1', 'P2'].map((p) => (
          <div className="fb-policy-row" key={p}>
            <b>{p}</b>
            <ArrowRight size={17} />
            {p === 'P1' ? <ShieldCheck size={17} /> : <Minus size={17} />}
            <span>
              {p === 'P1' ? 'Manager approval' : 'No approval required'}
            </span>
          </div>
        ))}
      </div>
      <div className="fb-policy-shift">
        <ArrowRight />
        <small>CR-001</small>
      </div>
      <div className="fb-proposed">
        <span className="fb-kicker">
          {proposed ? 'PROPOSED' : 'APPROVED'} · POC v2
        </span>
        <h2>Expanded approval policy</h2>
        {['P1', 'P2'].map((p) => (
          <div className="fb-policy-row" key={p}>
            <b>{p}</b>
            <ArrowRight size={17} />
            <ShieldCheck size={17} />
            <span>
              Manager approval{p === 'P2' && <small>Behavior changed</small>}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
