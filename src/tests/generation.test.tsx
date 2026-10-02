import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routeObjects } from '@/app/routeObjects';
import { AppProviders } from '@/app/providers';
import { useDemoStore } from '@/store/demoStore';
import { approveGenerationBaseline } from './generationFixtures';
import { engineeringTests, getBaselineArtifacts } from '@/data/generation';
import type { ReactNode, ComponentType } from 'react';
Element.prototype.scrollIntoView = vi.fn();
vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => true,
}));
// jsdom cannot measure React Flow's canvas. Keep custom node content, selection and the semantic fallback under test.
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({
    nodes,
    nodeTypes,
    edges,
    children,
  }: {
    nodes: { id: string; data: unknown }[];
    nodeTypes: Record<string, ComponentType<{ data: unknown }>>;
    edges: { animated: boolean }[];
    children: ReactNode;
  }) => {
    const Node = nodeTypes.engineering!;
    return (
      <div
        data-testid="orchestration-canvas"
        data-edge-animation={edges.some((e) => e.animated)}
      >
        {nodes.map((n) => (
          <Node key={n.id} data={n.data} />
        ))}
        {children}
      </div>
    );
  },
  Handle: () => null,
  Controls: () => null,
  Position: { Top: 'top', Bottom: 'bottom' },
}));
async function renderGeneration(path = '/generation') {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole(
    'heading',
    {
      level: 1,
      name:
        path === '/scope' ? 'POC Scope Studio' : 'AI Generation Command Center',
    },
    { timeout: 5000 },
  );
  return router;
}
beforeEach(() => useDemoStore.getState().reset());
describe('AI Generation Command Center', () => {
  it('renders a governed locked route and links to scope without a start action', async () => {
    await renderGeneration();
    expect(
      screen.getByRole('heading', { name: 'Generation not ready' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Start Generation' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Review POC Scope ↗' }),
    ).toHaveAttribute('href', '/scope');
  });
  it('shows locked-baseline input, canonical readiness and planned outputs when approved', async () => {
    approveGenerationBaseline();
    await renderGeneration();
    const input = screen.getByRole('region', {
      name: 'Approved baseline input',
    });
    expect(input).toHaveTextContent('RB-001');
    expect(input).toHaveTextContent('LOCKED');
    expect(within(input).getByText('8')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Start Generation' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('progressbar', { name: 'Overall generation progress' }),
    ).toHaveAttribute('value', '0');
    expect(
      screen.getByRole('region', { name: 'Success-criterion validation' }),
    ).toHaveTextContent(`0/${engineeringTests.length} PASS`);
  });
  it('starts, pauses, resumes and deterministically advances through shared actions', async () => {
    approveGenerationBaseline();
    await renderGeneration();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Start Generation' }));
    act(() => useDemoStore.getState().tick(22000));
    expect(
      useDemoStore
        .getState()
        .agentStatuses.filter((a) => a.status === 'running'),
    ).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'Pause Generation' }));
    expect(screen.getByTestId('orchestration-canvas')).toHaveAttribute(
      'data-edge-animation',
      'false',
    );
    const elapsed = useDemoStore.getState().generation.elapsedMs;
    act(() => useDemoStore.getState().tick(1000));
    expect(useDemoStore.getState().generation.elapsedMs).toBe(elapsed);
    await user.click(screen.getByRole('button', { name: 'Resume Generation' }));
    await user.click(screen.getByRole('button', { name: 'Next Event' }));
    expect(useDemoStore.getState().generation.elapsedMs).toBeGreaterThan(
      elapsed,
    );
  });
  it('exposes dedicated request-list and history checks in completed validation and Test Agent outputs', async () => {
    const state = approveGenerationBaseline();
    state.startGeneration();
    state.tick(80000);
    await renderGeneration();
    const validation = within(
      screen.getByRole('region', { name: 'Success-criterion validation' }),
    );
    for (const id of ['TC-021', 'TC-022']) {
      const test = engineeringTests.find((t) => t.id === id)!;
      const row = validation.getByText(id).closest('article')!;
      expect(row).toHaveTextContent(test.requirementIds[0]!);
      expect(row).toHaveTextContent(test.label);
      expect(row).toHaveTextContent('✓ PASS');
    }
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: 'Inspect Test Agent: Completed' }),
    );
    const inspector = screen.getByRole('complementary', {
      name: 'Agent inspector',
    });
    for (const id of ['TC-021', 'TC-022'])
      expect(inspector).toHaveTextContent(
        engineeringTests.find((t) => t.id === id)!.label,
      );
  });
  it('selects agents with keyboard controls and exposes inputs, outputs and requirement evidence links', async () => {
    approveGenerationBaseline();
    await renderGeneration();
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: 'Inspect Backend Agent: Waiting' }),
    );
    const inspector = screen.getByRole('complementary', {
      name: 'Agent inspector',
    });
    expect(
      within(inspector).getByRole('heading', { name: 'Backend Agent' }),
    ).toBeInTheDocument();
    expect(inspector).toHaveTextContent('api-contract.json');
    expect(
      within(inspector).getByRole('link', { name: 'FR-003 ↗' }),
    ).toHaveAttribute('href', '/requirements?selected=FR-003');
    expect(
      within(inspector).getByRole('link', {
        name: 'View priority clarification ↗',
      }),
    ).toHaveAttribute('href', '/clarifications?selected=OQ-001');
    expect(
      screen.getByText('Accessible pipeline summary & agent selection'),
    ).toBeInTheDocument();
  });
  it('reveals artifacts after events and opens a metadata-only inspector', async () => {
    const a = approveGenerationBaseline();
    await renderGeneration();
    act(() => {
      a.startGeneration();
      a.tick(20000);
    });
    const explorer = screen.getByRole('region', { name: 'Artifact explorer' });
    await userEvent.setup().click(
      within(explorer).getByRole('button', {
        name: 'Inspect api-contract.json: generated',
      }),
    );
    expect(
      screen.getByRole('complementary', { name: 'Artifact inspector' }),
    ).toHaveTextContent('Architecture Agent');
    expect(
      screen.getByRole('complementary', { name: 'Artifact inspector' }),
    ).toHaveTextContent('no source files created');
  });
  it('completes test mapping and opens the governed POC review', async () => {
    const a = approveGenerationBaseline();
    const router = await renderGeneration();
    act(() => {
      a.startGeneration();
      a.tick(80000);
    });
    expect(
      screen.getByRole('heading', { name: 'POC Ready for Human Review' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Success-criterion validation' }),
    ).toHaveTextContent(
      `${engineeringTests.length}/${engineeringTests.length} PASS`,
    );
    expect(
      screen.getByRole('region', { name: 'Artifact explorer' }),
    ).toHaveTextContent(
      `${getBaselineArtifacts(useDemoStore.getState().pocBaseline!).length}/${getBaselineArtifacts(useDemoStore.getState().pocBaseline!).length} prepared`,
    );
    await userEvent
      .setup()
      .click(screen.getByRole('link', { name: 'Open POC Review ↗' }));
    expect(
      await screen.findByRole('heading', { name: 'Generated POC Review' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/preview');
    expect(
      screen.getByRole('region', { name: 'ServiceFlow POC application' }),
    ).toBeInTheDocument();
  });
  it('scope approval enables navigation but does not auto-start generation', async () => {
    approveGenerationBaseline();
    const router = await renderGeneration('/scope');
    await userEvent
      .setup()
      .click(screen.getByRole('link', { name: 'Start POC Generation ↗' }));
    await screen.findByRole('heading', {
      name: 'AI Generation Command Center',
    });
    expect(router.state.location.pathname).toBe('/generation');
    expect(useDemoStore.getState().generation.status).toBe('idle');
  });
  it('blocks reviewed-baseline drift and resets to the canonical initial route state', async () => {
    const a = approveGenerationBaseline();
    await renderGeneration();
    act(() => a.reopenClarification('OQ-001'));
    expect(
      screen.getByRole('heading', { name: 'Generation not ready' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Open POC Review ↗' }),
    ).not.toBeInTheDocument();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /^Reset Scenario$/ }));
    expect(useDemoStore.getState().pocBaseline).toBeNull();
    expect(useDemoStore.getState().generation.elapsedMs).toBe(0);
  });
});
