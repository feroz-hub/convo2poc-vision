import type { DemoApi, DemoState, DemoActions } from '@/store/demoStore';
import { pocUsers, pocReviewItems } from '@/data/pocRuntime';
import { feedbackReviews } from '@/data/feedbackEvolution';
import type { DemoAction, DemoDirectorState } from './demoTypes';
export interface DirectorHost {
  get: () => DemoApi;
  set: (patch: Partial<DemoState>) => void;
}
let dispatchDepth = 0;
export const isDirectorDispatch = () => dispatchDepth > 0;
export function dispatchDirector<T>(action: () => T): T {
  dispatchDepth++;
  try {
    return action();
  } finally {
    dispatchDepth--;
  }
}
const controlled = new Set<keyof DemoActions>([
  'start',
  'pause',
  'resume',
  'restart',
  'nextEvent',
  'reset',
  'setDemoSpeed',
  'startGeneration',
  'pauseGeneration',
  'resumeGeneration',
  'nextGenerationEvent',
  'restartGeneration',
  'setScopeDecision',
  'resetScopeRecommendation',
  'setScopeReview',
  'approveScope',
  'editClarificationQuestion',
  'acceptClarificationSuggestion',
  'reviewClarificationEvidence',
  'acceptClarificationResolution',
  'rejectClarificationResolution',
  'reopenClarification',
  'startFeedback',
  'feedbackPlayback',
  'reviewChange',
  'decideChange',
  'restartFeedback',
  'startDelta',
  'deltaPlayback',
  'selectPocVersion',
  'resetPocData',
]);
// Guard the same public actions used by the manual UI; inspection selectors remain available.
export function protectManualActions(
  api: DemoApi,
  get: () => DemoApi,
): DemoApi {
  const result = { ...api };
  for (const name of controlled) {
    const key = name;
    const original = api[key] as (...args: unknown[]) => void;
    Object.assign(result, {
      [key]: (...args: unknown[]) => {
        if (get().director.mode === 'autopilot' && !isDirectorDispatch())
          return;
        original(...args);
      },
    });
  }
  const perform = api.performPocAction;
  result.performPocAction = (action) => {
    if (
      get().director.mode === 'autopilot' &&
      !isDirectorDispatch() &&
      !['feature', 'evidence', 'presentation'].includes(action.type)
    )
      return;
    perform(action);
  };
  return result;
}
export function updateDirector(
  host: DirectorHost,
  patch: Partial<DemoDirectorState>,
) {
  host.set({ director: { ...host.get().director, ...patch } });
}
export function executeDemoAction(host: DirectorHost, action: DemoAction) {
  dispatchDirector(() => {
    const a = host.get();
    const selectP1 = () => {
      a.selectPocVersion('v1');
      const id = host.get().director.requestIds.p1;
      if (id) a.performPocAction({ type: 'select-request', id });
    };
    const create = (
      priority: 'P1' | 'P2',
      version: 'v1' | 'v2',
      slot: keyof DemoDirectorState['requestIds'],
    ) => {
      a.selectPocVersion(version);
      a.performPocAction({ type: 'role', role: 'employee' });
      a.performPocAction({
        type: 'create',
        title: `Guided ${priority} service request`,
        description:
          'Synthetic workflow proof for the guided client demonstration.',
        category: 'IT Support',
        priority,
      });
      const s = host.get(),
        runtime = version === 'v1' ? s.pocRuntime : s.feedback.v2Runtime;
      updateDirector(host, {
        requestIds: {
          ...s.director.requestIds,
          [slot]: runtime?.selectedRequestId ?? null,
        },
      });
      a.performPocAction({ type: 'feature', id: 'approval' });
    };
    switch (action.type) {
      case 'clarification':
        action.ids.forEach((id) => {
          a.selectClarification(id);
          a.acceptClarificationSuggestion(id);
          a.reviewClarificationEvidence(id);
          a.acceptClarificationResolution(id);
        });
        a.selectClarification(action.ids[0]!);
        break;
      case 'select-requirement':
        a.setRequirementView({
          selectedId: action.id,
          type: 'all',
          status: 'all',
          actor: null,
          search: '',
        });
        break;
      case 'approve-scope':
        (
          ['requirements', 'assumptions', 'scope', 'successCriteria'] as const
        ).forEach((key) => a.setScopeReview(key, true));
        a.approveScope();
        break;
      case 'p1-create':
        create('P1', 'v1', 'p1');
        break;
      case 'p1-assign':
        a.performPocAction({ type: 'role', role: 'administrator' });
        selectP1();
        a.performPocAction({
          type: 'assign',
          engineerId: pocUsers.find((u) => u.role === 'support-engineer')!.id,
        });
        break;
      case 'p1-blocked':
        a.performPocAction({ type: 'role', role: 'support-engineer' });
        selectP1();
        a.performPocAction({ type: 'progress' });
        break;
      case 'p1-approve':
        a.performPocAction({ type: 'role', role: 'manager' });
        selectP1();
        a.performPocAction({ type: 'approval', decision: 'approved' });
        break;
      case 'p1-progress':
        a.performPocAction({ type: 'role', role: 'support-engineer' });
        selectP1();
        a.performPocAction({ type: 'progress' });
        break;
      case 'p1-history':
        selectP1();
        a.performPocAction({ type: 'feature', id: 'history' });
        break;
      case 'feature-evidence':
        selectP1();
        a.performPocAction({ type: 'feature', id: 'approval' });
        break;
      case 'approve-v1':
        a.selectPocVersion('v1');
        pocReviewItems.forEach((r) =>
          a.performPocAction({ type: 'review', key: r.key, checked: true }),
        );
        a.performPocAction({ type: 'approve-review' });
        break;
      case 'trace-p1':
        a.setTraceView({
          workflow: 'approval',
          selectedId: 'requirement:FR-007',
          search: '',
          filter: 'all',
        });
        break;
      case 'approve-change':
        feedbackReviews.forEach((r) => a.reviewChange(r.key, true));
        a.decideChange('approve');
        break;
      case 'p2-v1':
        create('P2', 'v1', 'p2v1');
        break;
      case 'p2-v2':
        create('P2', 'v2', 'p2v2');
        break;
    }
  });
}
