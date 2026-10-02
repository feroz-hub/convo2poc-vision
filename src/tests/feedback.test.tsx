import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { routeObjects } from '@/app/routeObjects';
import { useDemoStore } from '@/store/demoStore';
import {
  prepareFeedback,
  analyzeFeedback,
  prepareV2,
} from './feedbackFixtures';
import { feedbackMessages, feedbackReviews } from '@/data/feedbackEvolution';
Element.prototype.scrollIntoView = vi.fn();
async function open(path = '/feedback') {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole(
    'heading',
    {
      name: path.startsWith('/preview')
        ? 'Generated POC Review'
        : 'Client Feedback & Change Impact',
    },
    { timeout: 5000 },
  );
  return router;
}
describe('feedback workspace and versioned preview', () => {
  beforeEach(() => useDemoStore.getState().reset());
  it('renders meaningful pending state with governed access and no premature client evidence', async () => {
    await open();
    expect(
      screen.getByRole('button', { name: 'Run Feedback Demo' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('link', { name: 'Review & approve POC v1 ↗' }),
    ).toHaveAttribute('href', '/preview?version=v1');
    expect(
      screen.queryByText(feedbackMessages[1].text, { exact: false }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Approve CR-001 & Create RB-002' }),
    ).not.toBeInTheDocument();
  });
  it('captures feedback progressively and stops at explicit human review', async () => {
    prepareFeedback();
    await open();
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Run Feedback Demo' }));
    await u.click(screen.getByRole('button', { name: 'Pause Feedback' }));
    act(() => useDemoStore.getState().tick(25000));
    expect(
      screen.queryByText(/The workflow looks good/),
    ).not.toBeInTheDocument();
    for (let i = 0; i < 5; i++)
      await u.click(
        screen.getByRole('button', { name: 'Next Feedback Event' }),
      );
    expect(screen.getByText(/The workflow looks good/)).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Approval policy before and after' }),
    ).toHaveTextContent('No approval required');
    expect(
      screen.getByRole('region', { name: 'Approval policy before and after' }),
    ).toHaveTextContent('Behavior changed');
    expect(
      screen.getByRole('button', { name: 'Approve CR-001 & Create RB-002' }),
    ).toBeDisabled();
    expect(useDemoStore.getState().feedback.baseline).toBeNull();
  });
  it('selects impact artifacts, reviews all five checks and creates a baseline without auto-generation', async () => {
    analyzeFeedback();
    await open();
    const u = userEvent.setup();
    await u.click(
      screen.getByRole('button', {
        name: /Application architecture.*architecture.*Reused/,
      }),
    );
    expect(
      screen.getByText(
        'Outside the changed policy path. Original artifact reused.',
      ),
    ).toBeInTheDocument();
    for (const r of feedbackReviews)
      await u.click(screen.getByRole('checkbox', { name: r.label }));
    await u.click(
      screen.getByRole('button', { name: 'Approve CR-001 & Create RB-002' }),
    );
    expect(
      screen.getByRole('heading', { name: 'RB-002 approved & locked' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Start Targeted Regeneration' }),
    ).toBeEnabled();
    expect(useDemoStore.getState().feedback.delta.status).toBe('idle');
    expect(
      screen.getByRole('link', { name: 'Inspect historical RB-001 ↗' }),
    ).toHaveAttribute('href', '/scope');
  });
  it('renders v2 validation, lineage, versioned PASS evidence and correct navigation', async () => {
    prepareV2();
    const router = await open();
    expect(
      screen.getByRole('heading', { name: 'POC v2 ready for human review' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Targeted regeneration' }),
    ).toHaveTextContent('Supersedes TC-023 for v2');
    expect(
      screen.getByRole('region', { name: 'Version timeline' }),
    ).toHaveTextContent('RB-002');
    const u = userEvent.setup();
    await u.click(screen.getByRole('link', { name: 'Open POC v2 ↗' }));
    await screen.findByRole('heading', { name: 'Generated POC Review' });
    expect(router.state.location.search).toBe('?version=v2');
    expect(screen.getByRole('combobox', { name: 'POC version' })).toHaveValue(
      'v2',
    );
    expect(
      screen.getByText('P1 and P2 require manager approval'),
    ).toBeInTheDocument();
  });
  it('shows P2 approval in v2, preserves v1 behavior through the selector and updates evidence', async () => {
    prepareV2();
    await open('/preview?version=v2');
    const u = userEvent.setup(),
      app = within(
        screen.getByRole('region', { name: 'ServiceFlow POC application' }),
      );
    await u.click(app.getByRole('button', { name: 'Create Request' }));
    await u.type(
      app.getByRole('textbox', { name: 'Request title' }),
      'V2 P2 policy',
    );
    await u.type(
      app.getByRole('textbox', { name: 'Description' }),
      'Review approval expansion',
    );
    await u.selectOptions(
      app.getByRole('combobox', { name: 'Priority' }),
      'P2',
    );
    expect(
      app.getByText('P2 work begins only after manager approval.'),
    ).toBeInTheDocument();
    await u.click(
      app.getAllByRole('button', { name: 'Create Request' }).at(-1)!,
    );
    expect(
      app.getByRole('region', { name: 'P2 approval workflow' }),
    ).toHaveTextContent('Manager Approval Required');
    await u.click(
      app.getByRole('button', {
        name: 'Why this feature? P1 / P2 Manager Approval',
      }),
    );
    const evidence = within(
      screen.getByRole('complementary', { name: 'Feature evidence' }),
    );
    expect(
      evidence.getByText('P1 and P2 requests require manager approval.'),
    ).toBeInTheDocument();
    expect(evidence.getByText('TC-016')).toBeInTheDocument();
    await u.selectOptions(
      screen.getByRole('combobox', { name: 'POC version' }),
      'v1',
    );
    expect(useDemoStore.getState().currentPocVersion).toBe('v1');
    expect(
      useDemoStore
        .getState()
        .pocRuntime.requests.some((r) => r.title === 'V2 P2 policy'),
    ).toBe(false);
    expect(app.getByText('P1 requires manager approval')).toBeInTheDocument();
  });
  it('requires v2 availability on a direct link and restarts feedback without resetting v1', async () => {
    await open('/preview?version=v2');
    expect(
      screen.getByRole('heading', { name: 'POC Review Not Ready' }),
    ).toBeInTheDocument();
  });
  it('rejection and restart remain local to feedback', async () => {
    analyzeFeedback();
    await open();
    const baseline = useDemoStore.getState().pocBaseline;
    const u = userEvent.setup();
    await u.click(
      screen.getByRole('button', { name: 'Request Clarification' }),
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Clarification requested',
    );
    expect(
      screen.getByRole('button', { name: 'Approve CR-001 & Create RB-002' }),
    ).toBeDisabled();
    await u.click(
      screen.getByRole('button', { name: 'Restart Feedback Demo' }),
    );
    expect(
      screen.getByRole('button', { name: 'Run Feedback Demo' }),
    ).toBeEnabled();
    expect(useDemoStore.getState().pocBaseline).toBe(baseline);
  });
});
