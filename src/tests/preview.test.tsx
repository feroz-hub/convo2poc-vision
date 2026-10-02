import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { routeObjects } from '@/app/routeObjects';
import { useDemoStore } from '@/store/demoStore';
import { preparePreview } from './previewFixtures';
import { pocReviewItems } from '@/data/pocRuntime';
import { transcript } from '@/data/transcript';
import { getBaselineTests } from '@/data/generation';
Element.prototype.scrollIntoView = vi.fn();
// Canvas layout is covered by the explorer tests and browser review.
vi.mock('@/components/traceability/TraceGraph', () => ({
  TraceGraph: () => null,
}));
async function renderPreview() {
  const router = createMemoryRouter(routeObjects, {
    initialEntries: ['/preview'],
  });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole(
    'heading',
    { name: 'Generated POC Review' },
    { timeout: 5000 },
  );
  return router;
}
const app = () =>
  within(screen.getByRole('region', { name: 'ServiceFlow POC application' }));
const evidence = () =>
  within(screen.getByRole('complementary', { name: 'Feature evidence' }));
describe('generated POC review workspace', () => {
  beforeEach(() => useDemoStore.getState().reset());
  it('renders meaningful locked governance and links to generation', async () => {
    await renderPreview();
    expect(
      screen.getByRole('heading', { name: 'POC Review Not Ready' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'ServiceFlow POC application' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View Generation Progress ↗' }),
    ).toHaveAttribute('href', '/generation');
    expect(
      screen.queryByRole('button', { name: 'Run Demo' }),
    ).not.toBeInTheDocument();
  });
  it('renders the validated dashboard with derived counts and honest coverage', async () => {
    preparePreview();
    await renderPreview();
    expect(
      app().getByRole('heading', { name: 'Operations at a glance' }),
    ).toBeInTheDocument();
    expect(
      app().getByRole('meter', { name: 'P1 request count' }),
    ).toHaveAttribute('value', '3');
    expect(
      screen.getByRole('region', { name: 'Review validation evidence' }),
    ).toHaveTextContent(
      `${getBaselineTests(useDemoStore.getState().pocBaseline!).length}/${getBaselineTests(useDemoStore.getState().pocBaseline!).length} PASS`,
    );
    expect(
      screen.getByRole('region', { name: 'Review validation evidence' }),
    ).toHaveTextContent('8/8');
    expect(screen.getAllByText('100%').length).toBeGreaterThan(0);
  });
  it.each([
    ['Why this feature? View Requests', 'TC-021'],
    ['Why this feature? Request History', 'TC-022'],
  ])('shows dedicated canonical PASS evidence for %s', async (button, id) => {
    preparePreview();
    await renderPreview();
    const user = userEvent.setup();
    if (id === 'TC-022')
      await user.click(
        app().getByRole('button', {
          name: 'Open SR-1041: Production access request',
        }),
      );
    await user.click(app().getByRole('button', { name: button }));
    expect(evidence().getByText(id)).toBeInTheDocument();
    expect(evidence().getByText('✓ PASSED')).toBeInTheDocument();
    expect(
      evidence().queryByText(/No dedicated Phase 6 check/),
    ).not.toBeInTheDocument();
  });
  it('creates a P1 request, updates the dashboard and shows canonical clarification evidence', async () => {
    preparePreview();
    await renderPreview();
    const user = userEvent.setup();
    await user.click(app().getByRole('button', { name: 'Create Request' }));
    await user.type(
      app().getByLabelText('Request title'),
      'Critical service access',
    );
    await user.type(
      app().getByLabelText('Description'),
      'Synthetic account access request',
    );
    await user.selectOptions(app().getByLabelText('Priority'), 'P1');
    expect(app().getByText('Manager Approval Required')).toBeInTheDocument();
    await user.click(
      within(
        app().getByRole('form', { name: 'Create service request' }),
      ).getByRole('button', { name: 'Create Request' }),
    );
    expect(
      app().getByRole('heading', { name: 'Critical service access' }),
    ).toBeInTheDocument();
    expect(app().getByRole('status')).toHaveTextContent('SR-1053 created');
    expect(
      evidence().getByRole('heading', { name: 'P1 Manager Approval' }),
    ).toBeInTheDocument();
    expect(
      evidence().getByRole('link', { name: 'View Clarification ↗' }),
    ).toHaveAttribute('href', '/clarifications?selected=OQ-001');
    expect(
      evidence().getAllByText(transcript.find((m) => m.id === 'msg-008')!.text)
        .length,
    ).toBeGreaterThan(0);
    await user.click(app().getByRole('button', { name: 'Dashboard' }));
    expect(
      app().getByRole('meter', { name: 'P1 request count' }),
    ).toHaveAttribute('value', '4');
  });
  it('switches demo roles, assigns as admin and progresses as the assigned engineer', async () => {
    preparePreview();
    await renderPreview();
    const user = userEvent.setup();
    await user.click(app().getByRole('button', { name: /Open SR-1043/ }));
    expect(
      app().queryByRole('button', { name: 'Assign Engineer' }),
    ).not.toBeInTheDocument();
    await user.selectOptions(
      app().getByRole('combobox', { name: 'Demo role' }),
      'administrator',
    );
    await user.click(app().getByRole('button', { name: /Open SR-1043/ }));
    await user.selectOptions(
      app().getByLabelText('Support engineer'),
      'user-engineer',
    );
    await user.click(app().getByRole('button', { name: 'Assign Engineer' }));
    expect(app().getByRole('status')).toHaveTextContent(
      'Assigned to Nikhil Shah',
    );
    expect(evidence().getByRole('link', { name: 'FR-003 ↗' })).toHaveAttribute(
      'href',
      '/requirements?selected=FR-003',
    );
    expect(evidence().getByText('TC-012')).toBeInTheDocument();
    await user.selectOptions(
      app().getByRole('combobox', { name: 'Demo role' }),
      'support-engineer',
    );
    await user.click(app().getByRole('button', { name: /Open SR-1043/ }));
    await user.click(
      app().getByRole('button', { name: 'Move to In Progress' }),
    );
    expect(app().getByRole('status')).toHaveTextContent(
      'Status changed to In Progress',
    );
    expect(
      evidence().getByRole('heading', { name: 'Status Update' }),
    ).toBeInTheDocument();
  });
  it('allows a manager to approve a pending P1 and prevents approval from other roles', async () => {
    preparePreview();
    await renderPreview();
    const user = userEvent.setup();
    await user.click(app().getByRole('button', { name: /Open SR-1041/ }));
    expect(
      app().queryByRole('button', { name: 'Approve P1 Request' }),
    ).not.toBeInTheDocument();
    await user.selectOptions(
      app().getByRole('combobox', { name: 'Demo role' }),
      'manager',
    );
    await user.click(app().getByRole('button', { name: /Open SR-1041/ }));
    await user.click(app().getByRole('button', { name: 'Approve P1 Request' }));
    expect(app().getByText('Manager Approval Confirmed')).toBeInTheDocument();
    expect(app().getByRole('status')).toHaveTextContent(
      'Manager approved P1 request',
    );
    expect(evidence().getByText('TC-015')).toBeInTheDocument();
    expect(evidence().getByText('TC-017')).toBeInTheDocument();
  });
  it('searches closed records and reveals their feature evidence', async () => {
    preparePreview();
    await renderPreview();
    const user = userEvent.setup();
    await user.click(app().getByRole('button', { name: 'Requests' }));
    await user.selectOptions(app().getByLabelText('Request status'), 'closed');
    await user.type(app().getByLabelText('Search requests'), 'Printer');
    expect(
      app().getByRole('button', { name: /Open SR-1044/ }),
    ).toBeInTheDocument();
    await user.click(
      app().getByRole('button', { name: 'Why this feature? Closed Search' }),
    );
    expect(
      evidence().getByRole('heading', { name: 'Closed Search' }),
    ).toBeInTheDocument();
    expect(evidence().getByText('TC-020')).toBeInTheDocument();
  });
  it('navigates from feature evidence to canonical conversation, scope and generation artifact', async () => {
    preparePreview();
    const router = await renderPreview();
    const user = userEvent.setup();
    expect(
      evidence().getByRole('link', { name: 'View Conversation ↗' }),
    ).toHaveAttribute('href', '/session?source=msg-011');
    expect(
      evidence().getByRole('link', { name: 'View POC Scope ↗' }),
    ).toHaveAttribute('href', '/scope?selected=scope-FR-006');
    await user.click(evidence().getByRole('link', { name: 'Dashboard ↗' }));
    await screen.findByRole(
      'heading',
      { name: 'AI Generation Command Center' },
      { timeout: 5000 },
    );
    expect(router.state.location.pathname).toBe('/generation');
    expect(useDemoStore.getState().generation.selectedArtifactId).toBe(
      'dashboard-screen',
    );
  });
  it('toggles evidence and presentation mode, with Escape to exit', async () => {
    preparePreview();
    await renderPreview();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Hide Evidence' }));
    expect(
      screen.queryByRole('complementary', { name: 'Feature evidence' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show Evidence' }));
    await user.click(screen.getByRole('button', { name: 'Present POC' }));
    expect(
      screen.getByRole('button', { name: 'Exit Presentation' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('complementary', { name: 'Feature evidence' }),
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(
      screen.getByRole('heading', { name: 'Generated POC Review' }),
    ).toBeInTheDocument();
  });
  it('requires explicit review checks before approval and links to the Traceability Explorer', async () => {
    preparePreview();
    const router = await renderPreview();
    const user = userEvent.setup();
    const approve = screen.getByRole('button', {
      name: 'Approve POC for Client Demonstration',
    });
    expect(approve).toBeDisabled();
    for (const item of pocReviewItems)
      await user.click(screen.getByRole('checkbox', { name: item.label }));
    expect(approve).toBeEnabled();
    await user.click(approve);
    expect(
      screen.getByText('APPROVED FOR CLIENT DEMONSTRATION'),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('link', { name: 'Review Traceability ↗' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Traceability Explorer' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/traceability');
  });
  it('resets only runtime POC data while full scenario reset relocks preview', async () => {
    preparePreview();
    await renderPreview();
    const user = userEvent.setup();
    const state = useDemoStore.getState();
    await user.selectOptions(
      app().getByRole('combobox', { name: 'Demo role' }),
      'manager',
    );
    await user.click(app().getByRole('button', { name: 'Reset POC Data' }));
    expect(app().getByRole('combobox', { name: 'Demo role' })).toHaveValue(
      'employee',
    );
    expect(useDemoStore.getState().generation).toBe(state.generation);
    expect(useDemoStore.getState().pocBaseline).toBe(state.pocBaseline);
    await user.click(screen.getByRole('button', { name: 'Reset Scenario' }));
    expect(
      screen.getByRole('heading', { name: 'POC Review Not Ready' }),
    ).toBeInTheDocument();
  });
  it('withdraws access if consultant review changes after generation', async () => {
    preparePreview();
    await renderPreview();
    await act(async () =>
      useDemoStore.getState().reopenClarification('OQ-001'),
    );
    await screen.findByRole('heading', { name: 'POC Review Not Ready' });
    expect(
      screen.queryByRole('region', { name: 'ServiceFlow POC application' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'POC Review Not Ready' }),
    ).toBeInTheDocument();
  });
});
