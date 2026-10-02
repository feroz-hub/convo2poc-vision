import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { routeObjects } from '@/app/routeObjects';
import { engineeringTests } from '@/data/generation';
import { useDemoStore } from '@/store/demoStore';
import { preparePreview } from './previewFixtures';
import { transcript } from '@/data/transcript';
import type { ComponentType } from 'react';
Element.prototype.scrollIntoView = vi.fn();
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
      <div data-testid="trace-canvas">
        {nodes.map((node) => (
          <Node key={node.id} data={node.data} />
        ))}
      </div>
    );
  },
  Handle: () => null,
  Controls: () => null,
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
}));
async function renderTrace(path = '/traceability') {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole('heading', { name: 'Traceability Explorer' });
  return router;
}
const inspector = () =>
  within(
    screen.getByRole('complementary', { name: 'Traceability node inspector' }),
  );
describe('Traceability Explorer', () => {
  beforeEach(() => useDemoStore.getState().reset());
  it('renders a pending canonical overview without pretending generation completed', async () => {
    await renderTrace();
    expect(
      screen.getByText('Canonical map · baseline pending'),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Workflow' })).toHaveValue(
      'overview',
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Run Demo' }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Traceability lanes')).toHaveTextContent(
      'Implementation',
    );
  });
  it('renders derived completed health and a clean representative overview', async () => {
    preparePreview();
    await renderTrace();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Derived traceability health'),
    ).toHaveTextContent(
      `${engineeringTests.length}/${engineeringTests.length}`,
    );
    expect(
      within(screen.getByTestId('trace-canvas')).getAllByRole('button'),
    ).toHaveLength(15);
    expect(
      screen.getByText('Three representative workflows.', { exact: false }),
    ).toBeInTheDocument();
  });
  it('selects graph nodes, expands a workflow and shows exact source evidence', async () => {
    preparePreview();
    const router = await renderTrace();
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: 'Inspect Conversation msg-004' }),
    );
    expect(router.state.location.search).toContain('feature=assignment');
    expect(
      inspector().getByText(transcript.find((m) => m.id === 'msg-004')!.text),
    ).toBeInTheDocument();
    expect(
      inspector().getByRole('link', { name: 'View conversation evidence' }),
    ).toHaveAttribute('href', '/session?source=msg-004');
  });
  it('loads priority deep links, preserves the client answer and navigates clarification', async () => {
    preparePreview();
    const router = await renderTrace(
      '/traceability?feature=approval&selected=clarification:OQ-001',
    );
    expect(
      await inspector().findByRole('heading', { name: 'Clarification' }),
    ).toBeInTheDocument();
    expect(
      inspector().getByText('High priority has no measurable definition.'),
    ).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(
      inspector().getByRole('link', { name: 'Review clarification' }),
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/clarifications'),
    );
    expect(router.state.location.search).toBe('?selected=OQ-001');
  });
  it('shows dedicated tests for FR-002 and FR-005 and selects test artifact evidence', async () => {
    preparePreview();
    const router = await renderTrace();
    const user = userEvent.setup();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Workflow' }),
      'requests',
    );
    await user.click(
      screen.getByRole('button', { name: 'Inspect Test evidence TC-021' }),
    );
    expect(inspector().getByText('passed')).toBeInTheDocument();
    await user.click(
      inspector().getByRole('link', { name: 'Inspect generation evidence' }),
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/generation'),
    );
    expect(useDemoStore.getState().generation.selectedArtifactId).toBe(
      'TC-021',
    );
  });
  it('searches canonical IDs and filters pending versus complete chains', async () => {
    preparePreview();
    await renderTrace();
    const user = userEvent.setup();
    await user.type(
      screen.getByRole('textbox', { name: 'Search evidence' }),
      'TC-022',
    );
    expect(screen.getByLabelText('Explore core workflows')).toHaveTextContent(
      'Request History',
    );
    expect(
      within(screen.getByLabelText('Explore core workflows')).getAllByRole(
        'button',
      ),
    ).toHaveLength(1);
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Health' }),
      'gaps',
    );
    expect(
      screen.getByRole('heading', { name: 'No matching evidence chains' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset view' }));
    expect(
      screen.getByRole('textbox', { name: 'Search evidence' }),
    ).toHaveValue('');
  });
  it('opens a working POC feature without mutating baseline or requirement data', async () => {
    const state = preparePreview();
    const router = await renderTrace(
      '/traceability?feature=history&selected=feature:history',
    );
    expect(
      await inspector().findByRole('link', {
        name: 'Open working POC evidence',
      }),
    ).toBeInTheDocument();
    await userEvent
      .setup()
      .click(
        inspector().getByRole('link', { name: 'Open working POC evidence' }),
      );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/preview'),
    );
    expect(useDemoStore.getState().pocRuntime.selectedFeatureId).toBe(
      'history',
    );
    expect(useDemoStore.getState().pocBaseline).toBe(state.pocBaseline);
  });
  it('keeps keyboard node selection and accessible chain controls usable', async () => {
    preparePreview();
    await renderTrace();
    const user = userEvent.setup();
    const button = screen.getByRole('button', {
      name: 'Inspect Requirement FR-007',
    });
    button.focus();
    await user.keyboard('{Enter}');
    expect(
      inspector().getByText('P1 requests require manager approval.'),
    ).toBeInTheDocument();
    await user.click(
      screen.getByText('Accessible evidence chain & node selection'),
    );
    expect(
      screen.getByRole('button', { name: /Requirement · BR-001/ }),
    ).toBeInTheDocument();
  });
});
