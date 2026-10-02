import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { selectPocRequests } from '@/store/previewSelectors';
import { featureAvailable } from '@/simulation/pocRuntime';
import {
  pocCategories,
  pocPriorities,
  pocRoleLabels,
  pocStatusLabels,
  pocUsers,
} from '@/data/pocRuntime';
import type {
  PocPriority,
  PocRole,
  PocRequestStatus,
  ServiceRequest,
} from '@/types/pocRuntime';

export function FeatureEvidenceButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const select = useDemoStore((s) => s.performPocAction);
  const baseline = useDemoStore((s) => s.pocBaseline);
  if (!featureAvailable(baseline, id)) return null;
  return (
    <button
      type="button"
      className="poc-why"
      aria-label={`Why this feature? ${label}`}
      title="Why this feature?"
      onClick={() => {
        select({ type: 'feature', id });
        requestAnimationFrame(() => {
          const heading = document.getElementById('feature-evidence-heading');
          heading?.focus({ preventScroll: true });
          if (window.matchMedia('(max-width: 1200px)').matches)
            heading?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
        });
      }}
    >
      <CircleHelp size={15} aria-hidden="true" />
      <span className="sr-only">Why this feature? {label}</span>
    </button>
  );
}
const person = (id: string | null) =>
  pocUsers.find((u) => u.id === id)?.name ?? 'Unassigned';
export function PocStatusBadge({ request }: { request: ServiceRequest }) {
  return (
    <span className={`poc-status poc-status-${request.status}`}>
      {request.status === 'closed' && <Check size={12} aria-hidden="true" />}
      {pocStatusLabels[request.status]}
    </span>
  );
}
function RequestRows({ requests }: { requests: ServiceRequest[] }) {
  const act = useDemoStore((s) => s.performPocAction);
  return (
    <ul className="poc-request-list" aria-label="Service requests">
      {requests.map((r) => (
        <li key={r.id}>
          <button
            className="poc-request-open"
            onClick={() => act({ type: 'select-request', id: r.id })}
            aria-label={`Open ${r.id}: ${r.title}`}
          >
            <code>{r.id}</code>
            <strong>{r.title}</strong>
            <span>
              {r.category} · {person(r.requesterId)}
            </span>
          </button>
          <div className="poc-request-meta">
            <span className={`poc-priority poc-priority-${r.priority}`}>
              {r.priority}
            </span>
            <PocStatusBadge request={r} />
          </div>
          <div className="poc-request-owner">
            <span>
              Engineer <strong>{person(r.assignedEngineerId)}</strong>
            </span>
            <span>
              Approval{' '}
              <strong>
                {r.approvalStatus === 'not-required'
                  ? 'Not required'
                  : r.approvalStatus}
              </strong>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
function PocDashboard() {
  const runtime = useDemoStore((s) => s.pocRuntime);
  const user = pocUsers.find((u) => u.id === runtime.userId)!;
  const recent = runtime.requests
    .filter((r) => user.role !== 'employee' || r.requesterId === user.id)
    .slice(0, 4);
  const states = [
    'open',
    'in-progress',
    'awaiting-approval',
    'closed',
  ] as const;
  const counts = Object.fromEntries(
    Object.keys(pocStatusLabels).map((status) => [
      status,
      runtime.requests.filter((r) => r.status === status).length,
    ]),
  );
  return (
    <>
      <div className="poc-view-heading">
        <div>
          <span className="poc-eyebrow">SERVICE OPERATIONS</span>
          <h2>Operations at a glance</h2>
          <p>A shared view of the request lifecycle.</p>
        </div>
        <FeatureEvidenceButton id="dashboard" label="Dashboard" />
      </div>
      <dl className="poc-metrics">
        {states.map((status) => (
          <div key={status}>
            <dt>{pocStatusLabels[status]} Requests</dt>
            <dd>{counts[status]}</dd>
            <span className={`poc-metric-line poc-line-${status}`} />
          </div>
        ))}
      </dl>
      <div className="poc-chart-grid">
        <section className="poc-card">
          <h3>Request lifecycle</h3>
          <p>{runtime.requests.length} synthetic requests · all demo users</p>
          <div className="poc-bars">
            {Object.entries(pocStatusLabels).map(([id, label]) => (
              <div key={id}>
                <span>{label}</span>
                <meter
                  aria-label={`${label} request count`}
                  min={0}
                  max={runtime.requests.length}
                  value={counts[id]}
                />
                <strong>{counts[id]}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="poc-card">
          <h3>Priority distribution</h3>
          <p>P1 requires manager approval</p>
          <div className="poc-priority-chart">
            {pocPriorities.map((priority) => {
              const count = runtime.requests.filter(
                (r) => r.priority === priority,
              ).length;
              return (
                <div key={priority}>
                  <span className={`poc-priority poc-priority-${priority}`}>
                    {priority}
                  </span>
                  <strong>{count}</strong>
                  <meter
                    min={0}
                    max={runtime.requests.length}
                    value={count}
                    aria-label={`${priority} request count`}
                  />
                </div>
              );
            })}
          </div>
          <button
            className="poc-text-button"
            onClick={() =>
              useDemoStore
                .getState()
                .performPocAction({ type: 'feature', id: 'approval' })
            }
          >
            See why P1 needs approval <ArrowRight size={14} />
          </button>
        </section>
      </div>
      <section className="poc-card poc-recent">
        <div className="poc-section-title">
          <div>
            <h3>
              {user.role === 'employee'
                ? 'Your recent requests'
                : 'Recent requests'}
            </h3>
            <span>Select a request to explore its workflow.</span>
          </div>
          <FeatureEvidenceButton id="requests" label="View Requests" />
        </div>
        <RequestRows requests={recent} />
      </section>
    </>
  );
}
function PocRequestList() {
  const state = useDemoStore();
  const runtime = state.pocRuntime;
  const rows = selectPocRequests(state);
  return (
    <>
      <div className="poc-view-heading">
        <div>
          <span className="poc-eyebrow">REQUEST WORKSPACE</span>
          <h2>
            {pocUsers.find((u) => u.id === runtime.userId)!.role === 'employee'
              ? 'Your service requests'
              : 'Service requests'}
          </h2>
          <p>Track ownership, progress, and approval.</p>
        </div>
        <FeatureEvidenceButton id="requests" label="View Requests" />
      </div>
      <div className="poc-filters">
        <label>
          Search requests
          <input
            type="search"
            value={runtime.search}
            placeholder="ID, title or description"
            onChange={(e) =>
              state.performPocAction({
                type: 'filters',
                search: e.target.value,
              })
            }
          />
        </label>
        <label>
          Request status
          <select
            value={runtime.statusFilter}
            onChange={(e) =>
              state.performPocAction({
                type: 'filters',
                status: e.target.value as PocRequestStatus | 'all',
              })
            }
          >
            <option value="all">All statuses</option>
            {Object.entries(pocStatusLabels).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Request priority
          <select
            value={runtime.priorityFilter}
            onChange={(e) =>
              state.performPocAction({
                type: 'filters',
                priority: e.target.value as PocPriority | 'all',
              })
            }
          >
            <option value="all">All priorities</option>
            {pocPriorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      {runtime.statusFilter === 'closed' && (
        <div className="poc-inline-info">
          <Check size={16} />
          Closed requests remain searchable.
          <FeatureEvidenceButton id="closed-search" label="Closed Search" />
        </div>
      )}
      <div className="poc-list-count">
        {rows.length} matching {rows.length === 1 ? 'request' : 'requests'} ·
        synthetic data
      </div>
      <div className="poc-card">
        {rows.length ? (
          <RequestRows requests={rows} />
        ) : (
          <p className="poc-empty">
            No matching requests. Try another search or filter.
          </p>
        )}
      </div>
    </>
  );
}
function CreateRequestForm() {
  const act = useDemoStore((s) => s.performPocAction);
  const [priority, setPriority] = useState<PocPriority>('P3');
  return (
    <>
      <div className="poc-view-heading">
        <div>
          <span className="poc-eyebrow">EMPLOYEE SELF SERVICE</span>
          <h2>Create a service request</h2>
          <p>One place to ask for help and track progress.</p>
        </div>
        <FeatureEvidenceButton id="create" label="Create Request" />
      </div>
      <form
        aria-label="Create service request"
        className="poc-card poc-create-form"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          act({
            type: 'create',
            title: String(data.get('title') ?? ''),
            description: String(data.get('description') ?? ''),
            category: String(data.get('category') ?? ''),
            priority,
          });
        }}
      >
        <label>
          Request title
          <input
            name="title"
            required
            maxLength={120}
            placeholder="What do you need help with?"
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            rows={4}
            required
            maxLength={2000}
            placeholder="Describe the issue and the outcome you need."
          />
        </label>
        <div className="poc-form-columns">
          <label>
            Category
            <select name="category">
              {pocCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PocPriority)}
            >
              {pocPriorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>
        {priority === 'P1' && (
          <div className="poc-approval-banner">
            <ShieldCheck size={21} />
            <div>
              <strong>Manager Approval Required</strong>
              <span>P1 work begins only after manager approval.</span>
            </div>
            <FeatureEvidenceButton id="approval" label="P1 Manager Approval" />
          </div>
        )}
        <div className="poc-form-footer">
          <span>Saved only in this simulated sandbox.</span>
          <button className="poc-primary-button" type="submit">
            <Plus size={15} />
            Create Request
          </button>
        </div>
      </form>
    </>
  );
}
function RequestDetail() {
  const state = useDemoStore();
  const runtime = state.pocRuntime;
  const r = runtime.requests.find((r) => r.id === runtime.selectedRequestId);
  const user = pocUsers.find((u) => u.id === runtime.userId)!;
  const [engineer, setEngineer] = useState('user-engineer');
  const [note, setNote] = useState('');
  if (!r)
    return <p className="poc-empty">Select a request from the dashboard.</p>;
  const available = (id: string) => featureAvailable(state.pocBaseline, id);
  const next = {
    open: 'In Progress',
    'in-progress': 'Resolved',
    resolved: 'Closed',
  } as const;
  const nextLabel = next[r.status as keyof typeof next];
  return (
    <>
      <button
        className="poc-text-button"
        onClick={() =>
          state.performPocAction({
            type: 'navigate',
            route: available('requests') ? 'requests' : 'dashboard',
          })
        }
      >
        <ArrowLeft size={14} />
        Back to {available('requests') ? 'requests' : 'dashboard'}
      </button>
      <div className="poc-view-heading">
        <div>
          <span className="poc-eyebrow">
            {r.id} · {r.category}
          </span>
          <h2>{r.title}</h2>
          <p>{r.description}</p>
        </div>
        <span className={`poc-priority poc-priority-${r.priority}`}>
          {r.priority}
        </span>
      </div>
      <dl className="poc-detail-meta">
        <div>
          <dt>Status</dt>
          <dd>
            <PocStatusBadge request={r} />
          </dd>
        </div>
        <div>
          <dt>Requester</dt>
          <dd>{person(r.requesterId)}</dd>
        </div>
        <div>
          <dt>Assigned engineer</dt>
          <dd>{person(r.assignedEngineerId)}</dd>
        </div>
        <div>
          <dt>Approval</dt>
          <dd>
            {r.approvalStatus === 'not-required'
              ? 'Not required'
              : r.approvalStatus}
          </dd>
        </div>
      </dl>
      {r.priority === 'P1' && (
        <section
          className="poc-approval-banner"
          aria-label="P1 approval workflow"
        >
          <ShieldCheck size={22} />
          <div>
            <strong>
              {r.approvalStatus === 'approved'
                ? 'Manager Approval Confirmed'
                : r.approvalStatus === 'rejected'
                  ? 'Manager Approval Rejected'
                  : 'Manager Approval Required'}
            </strong>
            <span>
              {r.approvalStatus === 'approved'
                ? r.status === 'closed' || r.status === 'resolved'
                  ? 'Manager approval is preserved in request history.'
                  : 'Assigned engineer may begin work.'
                : 'Work is blocked until a manager approves this P1 request.'}
            </span>
          </div>
          <FeatureEvidenceButton id="approval" label="P1 Manager Approval" />
          {user.role === 'manager' &&
            r.approvalStatus === 'pending' &&
            available('approval') && (
              <div className="poc-approval-actions">
                <button
                  className="poc-primary-button"
                  onClick={() =>
                    state.performPocAction({
                      type: 'approval',
                      decision: 'approved',
                    })
                  }
                >
                  Approve P1 Request
                </button>
                <button
                  className="poc-secondary-button"
                  onClick={() =>
                    state.performPocAction({
                      type: 'approval',
                      decision: 'rejected',
                    })
                  }
                >
                  Reject P1 Request
                </button>
              </div>
            )}
        </section>
      )}
      {user.role === 'administrator' &&
        r.status !== 'closed' &&
        available('assignment') && (
          <section
            className="poc-card poc-action-card"
            aria-label="Engineer assignment"
          >
            <div className="poc-section-title">
              <h3>
                {r.assignedEngineerId ? 'Reassign Engineer' : 'Assign Engineer'}
              </h3>
              <FeatureEvidenceButton id="assignment" label="Admin Assignment" />
            </div>
            <div className="poc-assignment-row">
              <label>
                Support engineer
                <select
                  value={engineer}
                  onChange={(e) => setEngineer(e.target.value)}
                >
                  {pocUsers
                    .filter((u) => u.role === 'support-engineer')
                    .map((u) => (
                      <option value={u.id} key={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </label>
              <button
                className="poc-primary-button"
                onClick={() =>
                  state.performPocAction({
                    type: 'assign',
                    engineerId: engineer,
                  })
                }
              >
                {r.assignedEngineerId ? 'Reassign Engineer' : 'Assign Engineer'}
              </button>
            </div>
          </section>
        )}
      {user.role === 'support-engineer' && available('status') && (
        <section
          className="poc-card poc-action-card"
          aria-label="Request status update"
        >
          <div className="poc-section-title">
            <h3>Progress the request</h3>
            <FeatureEvidenceButton id="status" label="Status Update" />
          </div>
          <p>
            {r.assignedEngineerId !== user.id
              ? 'Only the assigned engineer can update this request.'
              : r.priority === 'P1' && r.approvalStatus !== 'approved'
                ? 'P1 is waiting for manager approval.'
                : nextLabel
                  ? `Next step: ${nextLabel}`
                  : 'The workflow is complete.'}
          </p>
          {nextLabel && (
            <button
              className="poc-primary-button"
              disabled={
                r.assignedEngineerId !== user.id ||
                (r.priority === 'P1' && r.approvalStatus !== 'approved')
              }
              onClick={() => state.performPocAction({ type: 'progress' })}
            >
              Move to {nextLabel}
            </button>
          )}
        </section>
      )}
      {r.status === 'closed' && (
        <div className="poc-inline-info">
          <Check size={16} />
          Closed request · read only. Administrators may append notes.
        </div>
      )}
      {r.status === 'closed' &&
        user.role === 'administrator' &&
        available('history') && (
          <form
            className="poc-card poc-action-card"
            onSubmit={(e) => {
              e.preventDefault();
              state.performPocAction({ type: 'note', text: note });
              setNote('');
            }}
          >
            <label>
              Administrator note
              <textarea
                required
                value={note}
                maxLength={500}
                rows={2}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <button className="poc-secondary-button" type="submit">
              Add note
            </button>
          </form>
        )}
      {available('history') && (
        <section className="poc-card">
          <div className="poc-section-title">
            <div>
              <h3>Request history</h3>
              <span>Deterministic sandbox activity</span>
            </div>
            <FeatureEvidenceButton id="history" label="Request History" />
          </div>
          <ol className="poc-history">
            {r.history.map((event) => (
              <li key={event.id}>
                <time>{event.timestamp}</time>
                <div>
                  <strong>{event.text}</strong>
                  <span>{person(event.userId)}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
export function GeneratedPocApp() {
  const state = useDemoStore();
  const runtime = state.pocRuntime;
  const user = pocUsers.find((u) => u.id === runtime.userId)!;
  const nav = [
    { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { route: 'requests', label: 'Requests', icon: ClipboardList },
    { route: 'create', label: 'Create Request', icon: Plus },
  ] as const;
  return (
    <section
      className="sandbox-browser"
      aria-label="ServiceFlow POC application"
    >
      <div className="sandbox-browser-bar">
        <span className="sandbox-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>
          <ShieldCheck size={13} />
          c2p-poc-001.internal
        </span>
        <span>Simulated Sandbox</span>
      </div>
      <div className="poc-app">
        <header className="poc-app-header">
          <div className="poc-wordmark">
            <span>
              <ClipboardList size={20} />
            </span>
            <div>
              <strong>
                ServiceFlow<span> POC</span>
              </strong>
              <small>Acme Enterprise Services</small>
            </div>
          </div>
          <div className="poc-identity">
            <label>
              Demo Identity
              <select
                aria-label="Demo role"
                value={user.role}
                onChange={(e) =>
                  state.performPocAction({
                    type: 'role',
                    role: e.target.value as PocRole,
                  })
                }
              >
                {Object.entries(pocRoleLabels).map(([role, label]) => (
                  <option key={role} value={role}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <FeatureEvidenceButton id="identity" label="Demo Identity" />
            <span
              className="poc-avatar"
              title={user.name}
              aria-label={user.name}
            >
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
        </header>
        <nav className="poc-navigation" aria-label="ServiceFlow navigation">
          {nav
            .filter(
              (n) =>
                featureAvailable(state.pocBaseline, n.route) &&
                (n.route !== 'create' || user.role === 'employee'),
            )
            .map((n) => (
              <button
                key={n.route}
                aria-current={runtime.route === n.route ? 'page' : undefined}
                onClick={() =>
                  state.performPocAction({ type: 'navigate', route: n.route })
                }
              >
                <n.icon size={15} />
                {n.label}
              </button>
            ))}
          <span>RB-001 · v1</span>
        </nav>
        <div className="poc-content">
          <div className="poc-session-caption">
            <span>Welcome, {user.name}</span>
            <span>Synthetic data · {pocRoleLabels[user.role]}</span>
          </div>
          {runtime.notice && (
            <p className="poc-notice" role="status">
              <Check size={15} />
              {runtime.notice}
            </p>
          )}
          {runtime.route === 'dashboard' && <PocDashboard />}
          {runtime.route === 'requests' && <PocRequestList />}
          {runtime.route === 'create' && <CreateRequestForm />}
          {runtime.route === 'detail' && (
            <RequestDetail key={runtime.selectedRequestId} />
          )}
        </div>
        <footer className="poc-app-footer">
          <span>Generated POC · Not Production Ready</span>
          <button onClick={state.resetPocData} className="poc-text-button">
            Reset POC Data
          </button>
        </footer>
      </div>
    </section>
  );
}
