import { beforeEach, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { AppProviders } from '@/app/providers';
import { routeObjects } from '@/app/routeObjects';
import { useDemoStore } from '@/store/demoStore';
import { prepareV2 } from './feedbackFixtures';
const renderValue = async () => {
  const router = createMemoryRouter(routeObjects, {
    initialEntries: ['/value'],
  });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole('heading', {
    name: 'Value Creation Report',
    level: 1,
  });
  return router;
};
beforeEach(() => {
  useDemoStore.getState().exitFullDemo();
  useDemoStore.getState().reset();
});
it('renders an honest initial report with pilot proposals and pending outcomes', async () => {
  await renderValue();
  expect(screen.getByText('Journey in progress')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'How We Would Validate Real Value' }),
  ).toBeInTheDocument();
  expect(screen.getAllByText('To be measured')).toHaveLength(22);
  expect(screen.queryByText('25 minutes')).not.toBeInTheDocument();
});
it('shows canonical evidence, derived timings and versioned validation without claiming v2 approval', async () => {
  prepareV2();
  await renderValue();
  expect(screen.getAllByText('2m 40s')).toHaveLength(2);
  expect(screen.getByText('0m 47s')).toBeInTheDocument();
  expect(screen.getByText('POC v2 Ready for Human Review')).toBeInTheDocument();
  expect(screen.getByText(/We already use P1 to P4/)).toBeInTheDocument();
  const version = screen
    .getByRole('heading', {
      name: 'A changed rule keeps its historical result',
    })
    .closest('section')!;
  expect(within(version).getAllByText('PASSED')).toHaveLength(2);
});
it('links report evidence to existing canonical routes', async () => {
  const router = await renderValue();
  expect(
    screen.getByRole('link', { name: 'Review clarification evidence →' }),
  ).toHaveAttribute('href', '/clarifications?selected=OQ-001');
  expect(
    screen.getByRole('link', { name: 'Review POC scope →' }),
  ).toHaveAttribute('href', '/scope');
  await userEvent
    .setup()
    .click(
      screen.getByRole('link', { name: 'Review Requirement Intelligence →' }),
    );
  await screen.findByRole('heading', {
    name: 'Requirement Intelligence',
    level: 1,
  });
  expect(router.state.location.pathname).toBe('/requirements');
});
it('Replay uses the existing director and navigates to its first route', async () => {
  await renderValue();
  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: 'Replay Full Demo' }));
  expect(useDemoStore.getState().director.mode).toBe('autopilot');
  expect(useDemoStore.getState().director.stepIndex).toBe(0);
});
