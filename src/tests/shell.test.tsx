import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { routeObjects } from '@/app/routeObjects';
import { routes } from '@/app/routes';
import { useDemoStore } from '@/store/demoStore';
const renderRoute = (path = '/') =>
  render(
    <AppProviders>
      <RouterProvider
        router={createMemoryRouter(routeObjects, { initialEntries: [path] })}
      />
    </AppProviders>,
  );
describe('application shell and route placeholders', () => {
  beforeEach(() => useDemoStore.getState().reset());
  it.each(
    routes.filter(
      (route) =>
        route.path !== '/' &&
        route.path !== '/session' &&
        route.path !== '/clarifications' &&
        route.path !== '/scope' &&
        route.path !== '/requirements' &&
        route.path !== '/generation' &&
        route.path !== '/preview' &&
        route.path !== '/traceability' &&
        route.path !== '/feedback',
    ),
  )('renders $path and marks its navigation active', async (route) => {
    renderRoute(route.path);
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: route.path === '/value' ? 'Value Creation Report' : route.label,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: route.label })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
  it('supports manual navigation independently of demo state', async () => {
    const user = userEvent.setup();
    renderRoute();
    await screen.findByRole('heading', {
      level: 1,
      name: 'Turn client conversations into validated working POCs',
    });
    await user.click(screen.getByRole('link', { name: 'POC Scope' }));
    expect(
      await screen.findByRole(
        'heading',
        {
          level: 1,
          name: 'POC Scope Studio',
        },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(useDemoStore.getState().scopeApproved).toBe(false);
  });
  it('disables unavailable playback but resets state without refreshing', async () => {
    const user = userEvent.setup();
    useDemoStore.setState({
      currentPocVersion: 'v2',
      detectedRequirementIds: ['FR-001'],
    });
    renderRoute('/value');
    await screen.findByRole('heading', {
      name: 'Value Creation Report',
      level: 1,
    });
    expect(screen.getByRole('button', { name: 'Run Demo' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Reset scenario' }));
    expect(screen.getAllByText('POC v1').length).toBeGreaterThan(0);
    expect(useDemoStore.getState().detectedRequirementIds).toEqual([]);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Value Creation Report',
      }),
    ).toBeInTheDocument();
  });
  it('opens navigation, moves focus, and closes on Escape', async () => {
    const user = userEvent.setup();
    renderRoute();
    await screen.findByRole('heading', {
      level: 1,
      name: 'Turn client conversations into validated working POCs',
    });
    const trigger = screen.getByRole('button', { name: 'Open navigation' });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: 'Close navigation' }),
    ).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });
  it('provides a recovery route for an unknown URL', () => {
    renderRoute('/missing');
    expect(
      screen.getByRole('heading', { name: 'Workspace not found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Return to Overview' }),
    ).toHaveAttribute('href', '/');
  });
});
