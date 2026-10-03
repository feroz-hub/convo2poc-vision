import type { ComponentType } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routeObjects } from '@/app/routeObjects';
import { AppProviders } from '@/app/providers';
import { createInitialDemoState, useDemoStore } from '@/store/demoStore';
import { DemoPresenterBar } from '@/components/demo/DemoPresenterBar';
import { useDemoTarget, watchDemoTarget } from '@/components/demo/demoTargets';
import * as demoEngine from '@/simulation/demoEngine';
import { demoStory } from '@/demo/demoStory';
import { DemoCompletion } from '@/components/demo/DemoCompletion';
const reduced = vi.hoisted(() => ({ value: false }));
vi.mock('framer-motion', async (original) => ({
  ...(await original<typeof import('framer-motion')>()),
  useReducedMotion: () => reduced.value,
}));
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({
    nodes,
    nodeTypes,
  }: {
    nodes: { id: string; data: unknown }[];
    nodeTypes: Record<string, ComponentType<{ data: unknown }>>;
  }) => {
    const Node = nodeTypes.evidence ?? nodeTypes.engineering!;
    return (
      <div>
        {nodes.map((n) => (
          <Node key={n.id} data={n.data} />
        ))}
      </div>
    );
  },
  Handle: () => null,
  Controls: () => null,
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
}));
const state = useDemoStore.getState;
async function app() {
  const router = createMemoryRouter(routeObjects, { initialEntries: ['/'] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole('button', { name: 'Run Full Demo' });
  return router;
}
describe('guided presentation integration', () => {
  beforeEach(() => {
    state().exitFullDemo();
    state().reset();
    reduced.value = false;
  });
  it('offers explicit entry paths, runs the director, pauses, resumes and exits to functional manual mode', async () => {
    const router = await app();
    const user = userEvent.setup();
    expect(
      screen.getByRole('button', { name: 'Explore Manually' }),
    ).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Run Full Demo' }));
    const dock = screen.getByRole('complementary', {
      name: 'Guided Demo presenter',
    });
    expect(within(dock).getByText('CONVO2POC GUIDED DEMO')).toBeInTheDocument();
    await user.click(within(dock).getByRole('button', { name: 'Pause' }));
    expect(state().director.status).toBe('paused');
    await user.click(within(dock).getByRole('button', { name: 'Resume' }));
    await user.click(within(dock).getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/session'),
    );
    await screen.findByRole('heading', { name: 'Live Session', level: 1 });
    expect(screen.getByRole('button', { name: 'Run Demo' })).toBeDisabled();
    await user.click(
      within(dock).getByRole('button', { name: 'Exit Autopilot' }),
    );
    expect(
      screen.queryByRole('complementary', { name: 'Guided Demo presenter' }),
    ).toBeNull();
    expect(screen.getByRole('button', { name: 'Resume' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(state().isRunning).toBe(true);
  });
  it('supports chapter preparation, previous, speed and restart with visible governance', async () => {
    const router = await app(),
      user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run Full Demo' }));
    const dock = screen.getByRole('complementary', {
      name: 'Guided Demo presenter',
    });
    await user.selectOptions(
      within(dock).getByRole('combobox', { name: 'Guided Demo speed' }),
      '2',
    );
    expect(state().director.speed).toBe(2);
    await user.click(within(dock).getByRole('button', { name: 'Pause' }));
    await user.click(within(dock).getByRole('button', { name: 'Chapters' }));
    await user.click(
      screen.getByRole('button', { name: /Scope.*Define POC Boundary/ }),
    );
    await waitFor(() => expect(router.state.location.pathname).toBe('/scope'));
    expect(state().pocBaseline).toBeNull();
    expect(
      within(dock).getByText(/Prerequisites replayed/),
    ).toBeInTheDocument();
    await user.click(within(dock).getByRole('button', { name: 'Next' }));
    await user.click(within(dock).getByRole('button', { name: 'Next' }));
    expect(
      within(dock).getByText(
        'Simulating consultant approval for this guided demo',
      ),
    ).toBeInTheDocument();
    await user.click(within(dock).getByRole('button', { name: 'Previous' }));
    expect(state().pocBaseline).toBeNull();
    await user.click(
      within(dock).getByRole('button', { name: 'Restart Demo' }),
    );
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(state().director.stepIndex).toBe(0);
    expect(state().director.speed).toBe(2);
  });
  it('does not fight manual navigation and offers return or exit', async () => {
    const router = await app(),
      user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run Full Demo' }));
    await act(async () => {
      await router.navigate('/requirements');
    });
    await screen.findByText('Guided Demo is currently running.');
    expect(router.state.location.pathname).toBe('/requirements');
    expect(state().director.routeBlocked).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Return to Demo' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(state().director.routeBlocked).toBe(false);
  });
  it('scrolls semantic targets without motion under reduced motion', async () => {
    reduced.value = true;
    const scroll = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scroll,
    });
    await app();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Run Full Demo' }));
    expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'center' });
  });
  it('registers and cleans semantic target refs and never needs DOM querying', () => {
    function Target() {
      return <section {...useDemoTarget('scope-funnel')}>Scope</section>;
    }
    const watch = vi.fn(),
      unwatch = watchDemoTarget('scope-funnel', watch),
      view = render(<Target />);
    expect(watch).toHaveBeenCalledOnce();
    view.unmount();
    unwatch();
    const after = vi.fn(),
      stop = watchDemoTarget('scope-funnel', after);
    expect(after).not.toHaveBeenCalled();
    stop();
  });
  it('renders a completion experience backed by reached state with no Phase 10 route', () => {
    state().startFullDemo();
    state().jumpToDemoChapter('outcome');
    state().acknowledgeDemoRoute();
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <>
            <DemoCompletion />
            <DemoPresenterBar />
          </>
        ),
      },
    ]);
    render(<RouterProvider router={router} />);
    expect(
      screen.getByRole('heading', {
        name: 'Client intent. Governed evolution. Working proof.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('100% for scoped workflows')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replay Demo' })).toBeEnabled();
    expect(screen.queryByText('Review required')).toBeNull();
  });
  it('navigates the complete declarative story without route loops or missing prerequisites', async () => {
    const router = await app();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Run Full Demo' }));
    for (let i = 0; i < demoStory.length; i++) {
      const step = demoStory[i]!;
      await waitFor(() =>
        expect(
          router.state.location.pathname + router.state.location.search,
        ).toBe(step.route),
      );
      await waitFor(() => expect(state().director.routeReady).toBe(true));
      expect(state().director.stepIndex, step.id).toBe(i);
      expect(state().director.routeBlocked, step.id).toBe(false);
      await act(async () => state().tick(step.durationMs));
      expect(state().director.error, step.id).toBeNull();
    }
    expect(state().director.status).toBe('completed');
    expect(
      screen.getByRole('heading', {
        name: 'Client intent. Governed evolution. Working proof.',
      }),
    ).toBeInTheDocument();
  });
  it('attaches one controlled clock only while running and cleans it on pause and exit', async () => {
    const dispose = vi.fn(),
      clock = vi.spyOn(demoEngine, 'attachDemoClock').mockReturnValue(dispose);
    const view = await app();
    expect(clock).not.toHaveBeenCalled();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Run Full Demo' }));
    expect(clock).toHaveBeenCalledOnce();
    const dock = screen.getByRole('complementary', {
      name: 'Guided Demo presenter',
    });
    await user.click(within(dock).getByRole('button', { name: 'Pause' }));
    expect(dispose).toHaveBeenCalledOnce();
    await user.click(within(dock).getByRole('button', { name: 'Resume' }));
    expect(clock).toHaveBeenCalledTimes(2);
    await user.click(
      within(dock).getByRole('button', { name: 'Exit Autopilot' }),
    );
    expect(dispose).toHaveBeenCalledTimes(2);
    expect(view.state.location.pathname).toBe('/');
    clock.mockRestore();
  });
  it('manual entry retains the canonical reset and leaves autopilot idle', async () => {
    const router = await app();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Explore Manually' }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/session'),
    );
    expect(state()).toMatchObject(createInitialDemoState());
  });
});
