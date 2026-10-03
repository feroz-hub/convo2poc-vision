import { GuidedControls } from '@/components/demo/GuidedControls';
import { useDemoTarget } from '@/components/demo/demoTargets';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, LockKeyhole, Check, TriangleAlert } from 'lucide-react';
import { requirements, clarifications } from '@/data/requirements';
import { useDemoStore } from '@/store/demoStore';
import {
  canApproveScope,
  selectScopePrerequisites,
  selectScopeReadiness,
  selectGenerationReadiness,
} from '@/store/scopeSelectors';
import { Button } from '@/components/ui/button';
import type { ScopeReviewKey } from '@/types/domain';
const reviewLabels: Record<ScopeReviewKey, string> = {
  requirements: 'Requirements reviewed',
  assumptions: 'Assumptions acknowledged',
  scope: 'POC scope reviewed',
  successCriteria: 'Success criteria reviewed',
};
export function ScopeApprovalGate() {
  const demoTarget = useDemoTarget('scope-approval');
  const state = useDemoStore();
  const gates = selectScopePrerequisites(state);
  const ready = canApproveScope(state);
  const readiness = selectScopeReadiness(state);
  const generation = selectGenerationReadiness(state);
  const baseline = state.pocBaseline;
  const reduced = useReducedMotion();
  return (
    <GuidedControls>
      <section
        {...demoTarget}
        className={`scope-approval ${baseline ? 'approved' : ''}`}
        aria-labelledby="scope-approval-title"
      >
        <header>
          <ShieldCheck size={23} aria-hidden="true" />
          <div>
            <span className="scope-kicker">Human approval gate</span>
            <h2 id="scope-approval-title">
              {baseline
                ? 'Approved baseline · RB-001'
                : 'Review the boundary before approving'}
            </h2>
          </div>
          <span className="scope-review-progress">
            Scope readiness <strong>{readiness}%</strong>
          </span>
        </header>
        {baseline ? (
          <motion.div
            className="approved-baseline"
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          >
            <div className="baseline-lock">
              <LockKeyhole size={28} aria-hidden="true" />
              <strong>RB-001</strong>
              <span>LOCKED</span>
              <p>
                {generation === 'Ready'
                  ? 'APPROVED FOR GENERATION'
                  : 'REVIEW REQUIRED'}
              </p>
            </div>
            <dl>
              {[
                ['POC version', baseline.version],
                ['Requirements', baseline.requirementIds.length],
                ['Included', baseline.includedScopeItemIds.length],
                ['Mocked', baseline.mockedScopeItemIds.length],
                ['Excluded', baseline.excludedScopeItemIds.length],
                ['Success criteria', baseline.successCriteriaIds.length],
                ['Approved by', baseline.approvedBy],
                ['Timestamp', baseline.approvedAt],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p>
              Future client changes create a new baseline rather than silently
              modifying this approved scope.
            </p>
            {generation === 'Ready' && (
              <Link className="scope-generation-link" to="/generation">
                Start POC Generation ↗
              </Link>
            )}
            {generation === 'Review required' && (
              <p className="scope-blocker">
                <TriangleAlert size={15} aria-hidden="true" />
                Clarification review changed after approval. RB-001 is
                preserved; generation requires a new reviewed baseline.
              </p>
            )}
          </motion.div>
        ) : (
          <>
            <div className="scope-review-checklist">
              {(Object.entries(reviewLabels) as [ScopeReviewKey, string][]).map(
                ([key, label]) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={state.scopeReviews[key]}
                      onChange={(e) =>
                        state.setScopeReview(key, e.target.checked)
                      }
                    />
                    <span>{label}</span>
                  </label>
                ),
              )}
              <div
                className={`clarification-prerequisite ${gates.clarificationsResolved ? 'complete' : ''}`}
              >
                {gates.clarificationsResolved ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <TriangleAlert size={16} aria-hidden="true" />
                )}
                <span>
                  Clarifications resolved ·{' '}
                  {
                    clarifications.filter((q) =>
                      state.resolvedClarificationIds.includes(q.id),
                    ).length
                  }
                  /{clarifications.length}
                </span>
                <Link to="/clarifications">Review ↗</Link>
              </div>
            </div>
            <details className="scope-assumptions">
              <summary>
                Assumptions to acknowledge ·{' '}
                {requirements.filter((r) => r.type === 'assumption').length}
              </summary>
              <ul>
                {requirements
                  .filter((r) => r.type === 'assumption')
                  .map((r) => (
                    <li key={r.id}>
                      <code>{r.id}</code> {r.description}
                    </li>
                  ))}
              </ul>
            </details>
            {!gates.requirementsCaptured && (
              <p className="scope-blocker">
                <TriangleAlert size={15} aria-hidden="true" />
                Capture the complete workshop before approving the requirement
                baseline. <Link to="/session">Open Live Session ↗</Link>
              </p>
            )}
            {!gates.criteriaCovered && (
              <p className="scope-blocker">
                <TriangleAlert size={15} aria-hidden="true" />
                Restore Included coverage for all mandatory success criteria
                before approval.
              </p>
            )}
            {!gates.dependenciesCovered && (
              <p className="scope-blocker">
                <TriangleAlert size={15} aria-hidden="true" />
                Authentication and user directory must be included or simulated
                to demonstrate the workflow.
              </p>
            )}
            <div className="scope-approval-action">
              <Button disabled={!ready} onClick={state.approveScope}>
                <ShieldCheck size={17} />
                Approve POC Scope & Create Baseline
              </Button>
              <span>
                {ready
                  ? 'Ready for consultant approval'
                  : 'Complete the review prerequisites to approve RB-001.'}
              </span>
            </div>
          </>
        )}
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {baseline
            ? `Baseline RB-001 locked. Generation ${generation}.`
            : `Scope readiness ${readiness} percent. Approval ${ready ? 'available' : 'pending review'}.`}
        </p>
      </section>
    </GuidedControls>
  );
}
