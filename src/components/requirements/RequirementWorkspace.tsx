import { Search, UsersRound, ArrowRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { requirements } from '@/data/requirements';
import { scenario } from '@/data/scenario';
import { transcript } from '@/data/transcript';
import { useDemoStore } from '@/store/demoStore';
import {
  requirementTypeLabels,
  intelligenceStatusLabels,
  selectRequirementList,
  selectIntelligenceStatus,
  selectEvidenceState,
  getRequirementClarifications,
} from '@/store/requirementSelectors';
import { RequirementStatus } from './RequirementStatus';
export function RequirementWorkspace({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const state = useDemoStore();
  const view = state.requirementView;
  const records = selectRequirementList(state);
  const reduced = useReducedMotion();
  return (
    <section className="ri-catalog" aria-labelledby="ri-catalog-title">
      <header>
        <div>
          <span className="ri-kicker">Reviewable catalog</span>
          <h2 id="ri-catalog-title">Requirement model</h2>
        </div>
        <strong>
          {records.length} / {requirements.length}
        </strong>
      </header>
      <div className="ri-filters">
        <div
          className="ri-type-filters"
          role="group"
          aria-label="Requirement type filters"
        >
          {(
            ['all', ...Object.keys(requirementTypeLabels)] as (
              keyof typeof requirementTypeLabels | 'all'
            )[]
          ).map((type) => (
            <button
              key={type}
              aria-pressed={view.type === type}
              onClick={() => state.setRequirementView({ type })}
            >
              {type === 'all' ? 'All' : requirementTypeLabels[type]}
            </button>
          ))}
        </div>
        <div className="ri-filter-tools">
          <label>
            <Search size={15} aria-hidden="true" />
            <input
              aria-label="Search requirements"
              placeholder="Search ID or requirement…"
              value={view.search}
              onChange={(e) =>
                state.setRequirementView({ search: e.target.value })
              }
            />
          </label>
          <label>
            Status
            <select
              aria-label="Requirement status filter"
              value={view.status}
              onChange={(e) =>
                state.setRequirementView({
                  status: e.target.value as typeof view.status,
                })
              }
            >
              <option value="all">All statuses</option>
              {Object.entries(intelligenceStatusLabels).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>
          <button
            onClick={() =>
              state.setRequirementView({
                type: 'all',
                status: 'all',
                actor: null,
                search: '',
              })
            }
          >
            Clear filters
          </button>
        </div>
        <div
          className="ri-actor-filters"
          role="group"
          aria-label="Actor filters"
        >
          <span>
            <UsersRound size={14} aria-hidden="true" /> Actors
          </span>
          {scenario.actors.map((actor) => (
            <button
              key={actor}
              aria-pressed={view.actor === actor}
              onClick={() =>
                state.setRequirementView({
                  actor: view.actor === actor ? null : actor,
                })
              }
            >
              {actor}
              <strong>
                {requirements.filter((r) => r.actors.includes(actor)).length}
              </strong>
            </button>
          ))}
        </div>
      </div>
      <p className="ri-catalog-note">
        All canonical records are reviewable. Live capture, client confirmation
        and consultant review remain distinct.
      </p>
      <ul className="ri-list" aria-label="Canonical requirement records">
        {records.map((r) => {
          const source = transcript.find((m) => m.id === r.sourceMessageId);
          const status = selectIntelligenceStatus(state, r);
          return (
            <li key={r.id} className={`ri-row ${r.type}`}>
              <button
                aria-pressed={view.selectedId === r.id}
                aria-controls="requirement-inspector"
                onClick={() => {
                  onSelect(r.id);
                  requestAnimationFrame(() => {
                    const inspector = document.getElementById(
                      'requirement-inspector',
                    );
                    inspector?.focus({ preventScroll: true });
                    inspector?.scrollIntoView({
                      block: 'nearest',
                      behavior: reduced ? 'auto' : 'smooth',
                    });
                  });
                }}
              >
                <div className="ri-row-main">
                  <code>{r.id}</code>
                  <strong>{r.title}</strong>
                  <ArrowRight size={14} aria-hidden="true" />
                </div>
                <div className="ri-row-meta">
                  <span>{requirementTypeLabels[r.type]}</span>
                  <RequirementStatus status={status} />
                  <span
                    aria-label={`Illustrative AI confidence ${r.confidence} percent`}
                  >
                    {r.confidence}% confidence
                  </span>
                </div>
                <div className="ri-row-source">
                  <span>
                    {source
                      ? `${source.speaker} · ${source.timestamp}`
                      : 'Scenario brief'}
                  </span>
                  <span>{r.actors.join(' · ') || 'No actor assigned'}</span>
                  {getRequirementClarifications(r).length > 0 && (
                    <span>Clarification linked ↗</span>
                  )}
                </div>
                <small>{selectEvidenceState(state, r)}</small>
              </button>
            </li>
          );
        })}
      </ul>
      {!records.length && (
        <div className="ri-empty">
          <Search size={22} aria-hidden="true" />
          <h3>No matching requirements</h3>
          <p>Change the type, status, actor or search filter.</p>
        </div>
      )}
    </section>
  );
}
