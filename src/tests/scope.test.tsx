import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routeObjects } from '@/app/routeObjects';
import { AppProviders } from '@/app/providers';
import { useDemoStore } from '@/store/demoStore';
import { clarifications } from '@/data/requirements';
import { scopeItems, successCriteria } from '@/data/scope';
vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => true,
}));
const scrollInspector = vi.fn();
Element.prototype.scrollIntoView = scrollInspector;
async function renderScope(path = '/scope') {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole('heading', {
    name:
      path === '/clarifications' ? 'Clarification Center' : 'POC Scope Studio',
    level: 1,
  });
  return router;
}
function captureAndClarify() {
  const state = useDemoStore.getState();
  state.start();
  state.tick(80000);
  for (const q of clarifications) {
    state.reviewClarificationEvidence(q.id);
    state.acceptClarificationResolution(q.id);
  }
}
beforeEach(() => {
  useDemoStore.getState().reset();
  scrollInspector.mockClear();
});
describe('POC Scope Studio', () => {
  it('renders canonical decision groups, the funnel, criteria and blocked approval', async () => {
    await renderScope();
    expect(
      screen.getByRole('region', {
        name: 'Full solution to governed prototype',
      }),
    ).toHaveTextContent('15');
    expect(
      within(screen.getByRole('region', { name: 'Included' })).getAllByRole(
        'button',
      ),
    ).toHaveLength(8);
    expect(
      within(
        screen.getByRole('region', { name: 'Mocked / Simulated' }),
      ).getAllByRole('button'),
    ).toHaveLength(2);
    expect(
      within(
        screen.getByRole('region', { name: 'Out of POC Scope' }),
      ).getAllByRole('button'),
    ).toHaveLength(5);
    expect(
      screen.getByRole('region', { name: 'POC success criteria' }),
    ).toHaveTextContent('6 / 6 covered');
    for (const c of successCriteria)
      expect(
        screen.getByRole('region', { name: 'POC success criteria' }),
      ).toHaveTextContent(c.id);
    expect(
      screen.getByRole('button', {
        name: 'Approve POC Scope & Create Baseline',
      }),
    ).toBeDisabled();
  });
  it('selects a capability, shows evidence and records/resets a consultant override', async () => {
    const user = userEvent.setup();
    await renderScope();
    await user.click(
      screen.getByRole('button', { name: /Email notifications.*OQ-003/ }),
    );
    const inspector = screen.getByRole('complementary', {
      name: 'Email notifications',
    });
    await waitFor(() => expect(inspector).toHaveFocus());
    expect(scrollInspector).toHaveBeenCalledWith({
      block: 'nearest',
      behavior: 'auto',
    });
    expect(inspector).toHaveTextContent(
      'Not for the first POC. We can add that later.',
    );
    expect(
      within(inspector).getByRole('link', { name: /View Clarification/ }),
    ).toHaveAttribute('href', '/clarifications?selected=OQ-003');
    await user.type(
      within(inspector).getByRole('textbox', { name: /Override reason/ }),
      'Simulate notifications only.',
    );
    await user.click(
      within(inspector).getByRole('button', { name: 'Move to Mocked' }),
    );
    expect(useDemoStore.getState().scopeOverrides['scope-email']).toEqual({
      decision: 'mocked',
      reason: 'Simulate notifications only.',
    });
    expect(
      within(
        screen.getByRole('region', { name: 'Mocked / Simulated' }),
      ).getAllByRole('button'),
    ).toHaveLength(3);
    expect(
      screen.getByRole('complementary', { name: 'Email notifications' }),
    ).toHaveTextContent('Human override');
    await user.click(
      screen.getByRole('button', { name: 'Reset recommendation' }),
    );
    expect(useDemoStore.getState().scopeOverrides).toEqual({});
  });
  it('approves the reviewed scope and displays a locked baseline with no generation action', async () => {
    const user = userEvent.setup();
    await renderScope();
    act(captureAndClarify);
    for (const label of [
      'Requirements reviewed',
      'Assumptions acknowledged',
      'POC scope reviewed',
      'Success criteria reviewed',
    ])
      await user.click(screen.getByRole('checkbox', { name: label }));
    await user.click(
      screen.getByRole('button', {
        name: 'Approve POC Scope & Create Baseline',
      }),
    );
    const gate = screen.getByRole('region', {
      name: 'Approved baseline · RB-001',
    });
    expect(gate).toHaveTextContent('LOCKED');
    expect(gate).toHaveTextContent('APPROVED FOR GENERATION');
    expect(gate).toHaveTextContent('Demo 01:20');
    expect(
      screen.getByRole('button', { name: 'Move to Mocked' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('textbox', { name: /Override reason/ }),
    ).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: /Generate POC/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset scenario' }));
    expect(useDemoStore.getState().pocBaseline).toBeNull();
    expect(
      screen.getByRole('button', {
        name: 'Approve POC Scope & Create Baseline',
      }),
    ).toBeDisabled();
  });
  it('exposes a scope gap and blocks approval when a mandatory workflow capability is deferred', async () => {
    const user = userEvent.setup();
    await renderScope();
    act(captureAndClarify);
    await user.click(
      screen.getByRole('button', { name: 'Move to Out of Scope' }),
    );
    expect(
      screen.getByRole('region', { name: 'POC success criteria' }),
    ).toHaveTextContent('5 / 6 covered');
    expect(screen.getByText(/Restore Included coverage/)).toBeInTheDocument();
    for (const label of [
      'Requirements reviewed',
      'Assumptions acknowledged',
      'POC scope reviewed',
      'Success criteria reviewed',
    ])
      await user.click(screen.getByRole('checkbox', { name: label }));
    expect(
      screen.getByRole('button', {
        name: 'Approve POC Scope & Create Baseline',
      }),
    ).toBeDisabled();
  });
  it('clears an unsaved inspector note on scenario reset', async () => {
    const user = userEvent.setup();
    await renderScope();
    await user.type(
      screen.getByRole('textbox', { name: /Override reason/ }),
      'Draft tradeoff',
    );
    await user.click(screen.getByRole('button', { name: 'Reset scenario' }));
    expect(
      screen.getByRole('textbox', { name: /Override reason/ }),
    ).toHaveValue('');
  });
  it('offers Clarification → Scope navigation only when all canonical reviews are confirmed', async () => {
    const user = userEvent.setup();
    const router = await renderScope('/clarifications');
    expect(
      screen.queryByRole('link', { name: 'Continue to POC Scope →' }),
    ).not.toBeInTheDocument();
    act(captureAndClarify);
    await user.click(
      screen.getByRole('link', { name: 'Continue to POC Scope →' }),
    );
    await screen.findByRole('heading', { name: 'POC Scope Studio' });
    expect(router.state.location.pathname).toBe('/scope');
  });
  it('links canonical requirements, clarification and conversation evidence', async () => {
    const user = userEvent.setup();
    const router = await renderScope();
    const inspector = screen.getByRole('complementary', {
      name: 'P1 approval',
    });
    expect(
      within(inspector).getByRole('link', { name: /View Requirement/ }),
    ).toHaveAttribute('href', '/requirements?selected=FR-007');
    expect(
      within(inspector).getByRole('link', { name: /View Clarification/ }),
    ).toHaveAttribute('href', '/clarifications?selected=OQ-001');
    const source = scopeItems.find((item) => item.id === 'scope-FR-007')!
      .evidenceMessageIds[0];
    await user.click(
      within(inspector).getAllByRole('link', {
        name: /View Conversation Evidence/,
      })[0]!,
    );
    await screen.findByRole('heading', { name: 'Live Session', level: 1 });
    expect(router.state.location.search).toBe(`?source=${source}`);
    expect(useDemoStore.getState().elapsedMs).toBe(0);
  });
});
