import {
  CheckCircle2,
  FlaskConical,
  CircleSlash2,
  ShieldCheck,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { scopeItems, scopeDecisionLabels } from '@/data/scope';
import { useDemoStore } from '@/store/demoStore';
import { selectScopeDecision } from '@/store/scopeSelectors';
import type { ScopeDecision } from '@/types/domain';
const icons = {
  included: CheckCircle2,
  mocked: FlaskConical,
  excluded: CircleSlash2,
};
const descriptions = {
  included: 'Prove the core workflow',
  mocked: 'Demonstrate without enterprise dependencies',
  excluded: 'Retain for the broader solution',
};
export function ScopeBoard() {
  const state = useDemoStore();
  const reduced = useReducedMotion();
  return (
    <section className="scope-board" aria-label="Scope decision board">
      {(['included', 'mocked', 'excluded'] as ScopeDecision[]).map(
        (decision) => {
          const items = scopeItems.filter(
            (item) => selectScopeDecision(state, item) === decision,
          );
          const Icon = icons[decision];
          return (
            <section
              key={decision}
              className={`scope-column ${decision}`}
              aria-labelledby={`scope-column-${decision}`}
            >
              <header>
                <div>
                  <Icon size={19} aria-hidden="true" />
                  <h2 id={`scope-column-${decision}`}>
                    {scopeDecisionLabels[decision]}
                  </h2>
                  <strong>{items.length}</strong>
                </div>
                <p>{descriptions[decision]}</p>
              </header>
              <ul>
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout={!reduced}
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reduced ? 0 : 0.25 }}
                  >
                    <button
                      className="scope-item-card"
                      aria-pressed={state.selectedScopeItemId === item.id}
                      aria-controls="scope-inspector"
                      onClick={() => {
                        state.selectScopeItem(item.id);
                        requestAnimationFrame(() => {
                          const inspector =
                            document.getElementById('scope-inspector');
                          inspector?.focus({ preventScroll: true });
                          inspector?.scrollIntoView({
                            block: 'nearest',
                            behavior: reduced ? 'auto' : 'smooth',
                          });
                        });
                      }}
                    >
                      <div className="scope-card-top">
                        <strong>{item.title}</strong>
                        {state.scopeOverrides[item.id] && (
                          <ShieldCheck size={14} aria-label="Human override" />
                        )}
                      </div>
                      <div className="scope-ids">
                        {item.requirementIds.length ? (
                          item.requirementIds.map((id) => (
                            <code key={id}>{id}</code>
                          ))
                        ) : (
                          <small>Scenario boundary · no requirement ID</small>
                        )}
                      </div>
                      <p>
                        {state.scopeOverrides[item.id]?.reason || item.reason}
                      </p>
                      <footer>
                        <span>
                          {item.relevance === 'core'
                            ? 'High'
                            : item.relevance === 'supporting'
                              ? 'Medium'
                              : 'Low'}{' '}
                          relevance
                        </span>
                        <span>{item.complexity} complexity</span>
                      </footer>
                      <div className="scope-card-status">
                        {state.scopeApproved
                          ? 'Locked decision'
                          : state.scopeOverrides[item.id]
                            ? 'Human override'
                            : 'AI recommendation'}
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>
              {!items.length && (
                <p className="scope-column-empty">
                  No capabilities assigned to this decision.
                </p>
              )}
            </section>
          );
        },
      )}
    </section>
  );
}
