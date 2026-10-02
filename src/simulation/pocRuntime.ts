import {
  createSyntheticRequests,
  featureEvidence,
  pocCategories,
  pocPriorities,
  pocReviewItems,
  pocStatusLabels,
  pocUsers,
} from '@/data/pocRuntime';
import type { PocAction, PocRuntime, ServiceRequest } from '@/types/pocRuntime';
import type { PocBaseline } from '@/types/domain';
export const approvalRequired = (priority: string, version: string = 'v1') =>
  priority === 'P1' || (version === 'v2' && priority === 'P2');
export const createPocRuntime = (): PocRuntime => ({
  route: 'dashboard',
  userId: 'user-employee',
  requests: createSyntheticRequests(),
  selectedRequestId: null,
  selectedFeatureId: 'dashboard',
  statusFilter: 'all',
  priorityFilter: 'all',
  search: '',
  sequence: 0,
  notice: '',
  reviews: {
    workflow: false,
    scope: false,
    criteria: false,
    limitations: false,
    content: false,
  },
  approval: null,
  presentation: false,
  evidenceOpen: true,
});
export function featureAvailable(baseline: PocBaseline | null, id: string) {
  const feature = featureEvidence.find((f) => f.id === id);
  return (
    !!baseline &&
    !!feature &&
    feature.scopeItemIds.every(
      (s) =>
        baseline.decisions[s]?.decision &&
        baseline.decisions[s]?.decision !== 'excluded',
    )
  );
}
export const runtimeTime = (sequence: number) =>
  `${String(10 + Math.floor(sequence / 60)).padStart(2, '0')}:${String(sequence % 60).padStart(2, '0')}`;
// All role/business-rule guards live in this transition, not just hidden UI controls.
export function applyPocAction(
  runtime: PocRuntime,
  action: PocAction,
  baseline: PocBaseline,
): PocRuntime {
  const user = pocUsers.find((u) => u.id === runtime.userId)!;
  const selected = runtime.requests.find(
    (r) => r.id === runtime.selectedRequestId,
  );
  const deny = (notice: string) => ({ ...runtime, notice });
  const feature = (id: string) => featureAvailable(baseline, id);
  const change = (request: ServiceRequest, text: string, featureId: string) => {
    const sequence = runtime.sequence + 1;
    return {
      ...runtime,
      sequence,
      notice: text,
      selectedFeatureId: featureId,
      evidenceOpen: true,
      requests: runtime.requests.map((r) =>
        r.id === request.id
          ? {
              ...request,
              history: [
                ...request.history,
                {
                  id: `runtime-${sequence}`,
                  timestamp: runtimeTime(sequence),
                  text,
                  userId: user.id,
                },
              ],
            }
          : r,
      ),
    };
  };
  switch (action.type) {
    case 'navigate': {
      const id = action.route === 'detail' ? 'history' : action.route;
      if (!feature(id))
        return deny('This feature is outside the approved scope.');
      if (action.route === 'create' && user.role !== 'employee')
        return deny('Only the Employee demo role can create requests.');
      return {
        ...runtime,
        route: action.route,
        selectedFeatureId: id,
        notice: '',
      };
    }
    case 'role': {
      const next = pocUsers.find((u) => u.role === action.role);
      if (!next) return runtime;
      return {
        ...runtime,
        userId: next.id,
        route: 'dashboard',
        selectedRequestId: null,
        selectedFeatureId: 'identity',
        notice: '',
        search: '',
        statusFilter: 'all',
        priorityFilter: 'all',
      };
    }
    case 'select-request':
      if (
        !runtime.requests.some(
          (r) =>
            r.id === action.id &&
            (user.role !== 'employee' || r.requesterId === user.id),
        )
      )
        return runtime;
      return {
        ...runtime,
        route: 'detail',
        selectedRequestId: action.id,
        selectedFeatureId: feature('history') ? 'history' : 'status',
        notice: '',
      };
    case 'feature':
      return feature(action.id)
        ? { ...runtime, selectedFeatureId: action.id, evidenceOpen: true }
        : runtime;
    case 'filters':
      return {
        ...runtime,
        statusFilter: action.status ?? runtime.statusFilter,
        priorityFilter: action.priority ?? runtime.priorityFilter,
        search: action.search ?? runtime.search,
        selectedFeatureId:
          action.status === 'closed' ? 'closed-search' : 'requests',
      };
    case 'create': {
      if (user.role !== 'employee' || !feature('create'))
        return deny(
          'Request creation requires the Employee demo role and approved scope.',
        );
      if (
        !action.title.trim() ||
        !action.description.trim() ||
        !pocPriorities.includes(action.priority) ||
        !pocCategories.includes(action.category)
      )
        return deny(
          'Provide a title, description, category and valid priority.',
        );
      const sequence = runtime.sequence + 1;
      const id = `SR-${Math.max(...runtime.requests.map((r) => Number(r.id.slice(3)))) + 1}`;
      const approval = approvalRequired(action.priority, baseline.version);
      const record: ServiceRequest = {
        id,
        title: action.title.trim().slice(0, 120),
        description: action.description.trim().slice(0, 2000),
        category: action.category,
        priority: action.priority,
        requesterId: user.id,
        assignedEngineerId: null,
        status: approval ? 'awaiting-approval' : 'open',
        approvalStatus: approval ? 'pending' : 'not-required',
        history: [
          {
            id: `runtime-${sequence}`,
            timestamp: runtimeTime(sequence),
            text: approval
              ? 'Request created · manager approval required'
              : 'Request created',
            userId: user.id,
          },
        ],
      };
      return {
        ...runtime,
        sequence,
        requests: [record, ...runtime.requests],
        selectedRequestId: id,
        route: 'detail',
        selectedFeatureId: approval ? 'approval' : 'create',
        notice: `${id} created${approval ? ' · manager approval required' : ''}.`,
      };
    }
    case 'assign': {
      if (!selected || user.role !== 'administrator' || !feature('assignment'))
        return deny('Only administrators may assign or reassign engineers.');
      if (selected.status === 'closed')
        return deny(
          'Closed requests cannot be reassigned. Administrator notes remain available.',
        );
      const engineer = pocUsers.find(
        (u) => u.id === action.engineerId && u.role === 'support-engineer',
      );
      if (!engineer) return deny('Select a support engineer.');
      if (selected.assignedEngineerId === engineer.id)
        return deny('This engineer is already assigned.');
      return change(
        { ...selected, assignedEngineerId: engineer.id },
        `${selected.assignedEngineerId ? 'Reassigned' : 'Assigned'} to ${engineer.name}`,
        'assignment',
      );
    }
    case 'progress': {
      if (
        !selected ||
        user.role !== 'support-engineer' ||
        selected.assignedEngineerId !== user.id ||
        !feature('status')
      )
        return deny(
          'Only the assigned support engineer may progress this request.',
        );
      if (
        approvalRequired(selected.priority, baseline.version) &&
        selected.approvalStatus !== 'approved'
      )
        return deny(
          `${selected.priority} requires manager approval before work begins.`,
        );
      const next = {
        open: 'in-progress',
        'in-progress': 'resolved',
        resolved: 'closed',
      } as const;
      if (!(selected.status in next))
        return deny('No further status transition is available.');
      const status = next[selected.status as keyof typeof next];
      return change(
        { ...selected, status },
        `Status changed to ${pocStatusLabels[status]}`,
        'status',
      );
    }
    case 'approval':
      if (
        !selected ||
        user.role !== 'manager' ||
        !approvalRequired(selected.priority, baseline.version) ||
        selected.approvalStatus !== 'pending' ||
        !feature('approval')
      )
        return deny(
          `Only managers may decide pending ${baseline.version === 'v2' ? 'P1/P2' : 'P1'} approvals.`,
        );
      return change(
        {
          ...selected,
          approvalStatus: action.decision,
          status: action.decision === 'approved' ? 'open' : 'awaiting-approval',
        },
        `Manager ${action.decision} ${selected.priority} request`,
        'approval',
      );
    case 'note':
      if (
        !selected ||
        user.role !== 'administrator' ||
        selected.status !== 'closed' ||
        !action.text.trim() ||
        !feature('history')
      )
        return deny('Only administrators may add notes to closed requests.');
      return change(
        selected,
        `Administrator note: ${action.text.trim().slice(0, 500)}`,
        'history',
      );
    case 'review':
      return runtime.approval
        ? runtime
        : {
            ...runtime,
            reviews: { ...runtime.reviews, [action.key]: action.checked },
          };
    case 'approve-review':
      if (
        runtime.approval ||
        !pocReviewItems.every((i) => runtime.reviews[i.key])
      )
        return runtime;
      return {
        ...runtime,
        approval: {
          baselineId: baseline.id,
          approvedBy: 'Consultant',
          approvedAt: runtimeTime(runtime.sequence + 1),
        },
        sequence: runtime.sequence + 1,
        notice: `POC ${baseline.version} approved for client demonstration. Internal approval only.`,
      };
    case 'presentation':
      return { ...runtime, presentation: action.enabled };
    case 'evidence':
      return { ...runtime, evidenceOpen: action.open };
  }
}
