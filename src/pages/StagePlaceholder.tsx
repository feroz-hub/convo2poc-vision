import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { scenario } from '@/data/scenario';
import { routes } from '@/app/routes';
import { StatusBadge } from '@/components/common/StatusBadge';
export function StagePlaceholder({
  route,
}: {
  route: (typeof routes)[number];
}) {
  const Icon = route.icon;
  return (
    <section aria-labelledby="page-title" className="page-content">
      <div className="page-eyebrow">
        CONVERSATION → CLARITY → WORKING PROTOTYPE
      </div>
      <header className="page-header">
        <div>
          <h1 id="page-title">{route.label}</h1>
          <p>{route.description}</p>
        </div>
        <StatusBadge>Phase 1 · Foundation</StatusBadge>
      </header>
      <div className="placeholder-panel">
        <div className="placeholder-icon">
          <Icon size={30} aria-hidden="true" />
        </div>
        <StatusBadge>Planned for Phase {route.phase}</StatusBadge>
        <h2>The workspace is ready for the next phase</h2>
        <p>
          Navigation, shared state, and canonical scenario data are in place.
          This screen’s interactive experience will be implemented in its
          designated phase.
        </p>
        <div className="placeholder-rule" />
        <div className="scenario-caption">
          <span>CANONICAL DEMO SCENARIO</span>
          <strong>{scenario.name}</strong>
          <small>{scenario.client}</small>
        </div>
      </div>
      <div className="foundation-note">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <strong>A governed, simulation-first foundation</strong>
          <p>
            Synthetic demo data · Human approval required · No production
            integrations
          </p>
        </div>
        <ArrowUpRight size={20} aria-hidden="true" />
      </div>
    </section>
  );
}
