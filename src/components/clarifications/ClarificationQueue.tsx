import { ListFilter, CheckCircle2, Circle, FileCheck2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { requirements } from '@/data/requirements';
import { transcript } from '@/data/transcript';
import { useDemoStore } from '@/store/demoStore';
import {
  selectClarificationQueue,
  selectClarificationStatus,
  clarificationStatusLabels,
} from '@/store/clarificationSelectors';
import type {
  ClarificationCategory,
  ClarificationFilter,
} from '@/types/domain';
const categoryLabels: Record<ClarificationCategory, string> = {
  ambiguity: 'Ambiguous term',
  'business-rule': 'Missing business rule',
  role: 'Role ambiguity',
  scope: 'Scope uncertainty',
  integration: 'Integration unknown',
  assumption: 'Assumption requiring confirmation',
};
export function ClarificationQueue({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const state = useDemoStore();
  const queue = useDemoStore(useShallow(selectClarificationQueue));
  return (
    <aside
      className="clarification-queue governance-panel"
      aria-labelledby="queue-title"
    >
      <div className="governance-panel-heading">
        <ListFilter size={18} aria-hidden="true" />
        <h2 id="queue-title">Clarification queue</h2>
        <span>{queue.length}</span>
      </div>
      <div
        className="clarification-filters"
        role="group"
        aria-label="Filter clarifications"
      >
        {(
          [
            ['all', 'All'],
            ['open', 'Open'],
            ['needs-review', 'Needs Review'],
            ['resolved', 'Resolved'],
          ] as [ClarificationFilter, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            aria-pressed={state.clarificationFilter === value}
            onClick={() => state.setClarificationFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <ul aria-label="Clarification queue">
        {queue.map((q) => {
          const status = selectClarificationStatus(state, q);
          const Icon =
            status === 'confirmed'
              ? CheckCircle2
              : status === 'needs-review' || status === 'evidence-captured'
                ? FileCheck2
                : Circle;
          return (
            <li key={q.id}>
              <button
                className="clarification-queue-item"
                aria-pressed={state.selectedClarificationId === q.id}
                aria-controls="resolution-workspace"
                onClick={() => onSelect(q.id)}
              >
                <div>
                  <code>{q.id}</code>
                  <span>{q.impact} impact</span>
                </div>
                <strong>
                  {requirements.find((r) => r.id === q.requirementId)!.title}
                </strong>
                <small>{categoryLabels[q.category]}</small>
                <span className={`governance-status ${status}`}>
                  <Icon size={14} aria-hidden="true" />
                  {clarificationStatusLabels[status]}
                </span>
                <footer>
                  <span>
                    {q.affectedRequirementIds.join(' · ') ||
                      'POC integration boundary'}
                  </span>
                  <time>
                    {
                      transcript.find((m) => m.id === q.sourceMessageId)!
                        .timestamp
                    }
                  </time>
                </footer>
              </button>
            </li>
          );
        })}
      </ul>
      {!queue.length && (
        <p className="governance-empty">No clarifications in this filter.</p>
      )}
      <div className="queue-principle">
        <FileCheck2 size={23} aria-hidden="true" />
        <strong>Evidence first. Human decision.</strong>
        <p>A client answer proposes a resolution. A consultant confirms it.</p>
      </div>
    </aside>
  );
}
