import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { routeObjects } from '@/app/routeObjects';
import {
  workflowStages,
  processComparison,
  storyboardFrames,
  heroStory,
} from '@/data/overview';
import {
  catalogMetrics,
  deriveCatalogMetrics,
  overviewMetrics,
} from '@/data/metrics';
import { requirements, clarifications } from '@/data/requirements';
import { scopeItems } from '@/data/scope';
import { traceNodes, traceEdges } from '@/data/traceability';
import { scenarioTestCases } from '@/data/validation';
import { createInitialDemoState, useDemoStore } from '@/store/demoStore';
const motionPreference = vi.hoisted(() => ({ reduced: false }));
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useReducedMotion: () => motionPreference.reduced };
});
const renderOverview = async () => {
  const router = createMemoryRouter(routeObjects, { initialEntries: ['/'] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole('heading', {
    level: 1,
    name: 'Turn client conversations into validated working POCs',
  });
  return router;
};
describe('Overview executive command center', () => {
  beforeEach(() => {
    motionPreference.reduced = false;
    useDemoStore.getState().reset();
  });
  it('renders the hero, positioning, CTAs, and prototype context at /', async () => {
    await renderOverview();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Turn client conversations into validated working POCs',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Enterprise Conversation-to-POC Platform'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('From conversation to clarity to working prototype.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Demo' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Explore Workflow' }),
    ).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
  it('renders all eight connected journey stages and four story frames', async () => {
    await renderOverview();
    const workflow = screen.getByRole('region', {
      name: 'From a conversation to a solution you can review',
    });
    expect(within(workflow).getAllByRole('listitem')).toHaveLength(
      workflowStages.length,
    );
    for (const stage of workflowStages) {
      expect(
        within(workflow).getByRole('heading', { name: stage.title }),
      ).toBeInTheDocument();
      expect(within(workflow).getByText(stage.phrase)).toBeInTheDocument();
    }
    const story = screen.getByRole('region', { name: 'See the idea unfold' });
    expect(within(story).getAllByRole('listitem')).toHaveLength(4);
    for (const frame of storyboardFrames)
      expect(
        within(story).getByRole('heading', { name: frame.title }),
      ).toBeInTheDocument();
  });
  it('renders the complete visual concept and both comparison flows', async () => {
    await renderOverview();
    expect(
      screen.getByRole('img', {
        name: /Conversation flows through AI intelligence/,
      }),
    ).toBeInTheDocument();
    const comparison = screen.getByRole('region', {
      name: 'Traditional vs Convo2POC',
    });
    for (const process of processComparison) {
      const panel = within(comparison).getByRole('article', {
        name: process.title,
      });
      expect(within(panel).getAllByRole('listitem')).toHaveLength(7);
      for (const stage of process.stages)
        expect(within(panel).getByText(stage)).toBeInTheDocument();
    }
  });
  it('supports keyboard theme changes on Overview without changing demo state', async () => {
    document.documentElement.classList.add('dark');
    const router = await renderOverview();
    const user = userEvent.setup();
    screen.getByRole('button', { name: 'Switch to light mode' }).focus();
    await user.keyboard('{Enter}');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(
      screen.getByRole('heading', { name: 'Traditional vs Convo2POC' }),
    ).toBeInTheDocument();
    await user.keyboard(' ');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(router.state.location.pathname).toBe('/');
    expect(useDemoStore.getState()).toMatchObject(createInitialDemoState());
  });
  it('renders five distinct telemetry variants and a working final CTA', async () => {
    const router = await renderOverview();
    const telemetry = screen.getByRole('region', {
      name: 'Illustrative demo metrics',
    });
    for (const metric of overviewMetrics) {
      const label = within(telemetry).getByText(metric.label);
      expect(label.closest('[data-variant]')).toHaveAttribute(
        'data-variant',
        metric.icon,
      );
    }
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Explore the demo' }));
    expect(router.state.location.pathname).toBe('/session');
    expect(useDemoStore.getState()).toMatchObject(createInitialDemoState());
  });
  it('shows a complete static concept with reduced motion and preserves governance', async () => {
    motionPreference.reduced = true;
    await renderOverview();
    const concept = screen.getByRole('img', {
      name: /Conversation flows through AI intelligence/,
    });
    expect(
      within(concept).queryByText('Ambiguity detected'),
    ).not.toBeInTheDocument();
    expect(within(concept).getByText('Clarified')).toBeInTheDocument();
    expect(within(concept).getByText('Human approved')).toBeInTheDocument();
    expect(within(concept).getByText('Approved → POC v2')).toBeInTheDocument();
    expect(useDemoStore.getState()).toMatchObject(createInitialDemoState());
  });
  it('uses a compact presentation header without removing future playback controls', async () => {
    const router = await renderOverview();
    expect(
      screen.queryByText('Playback available in Phase 3'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Pause / Resume' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next stage' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Restart' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Internal Concept Prototype')).toBeInTheDocument();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Run Demo' }));
    expect(router.state.location.pathname).toBe('/session');
    expect(useDemoStore.getState()).toMatchObject(createInitialDemoState());
    expect(
      screen.getByRole('button', { name: 'Pause / Resume' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next stage' })).toBeDisabled();
  });
  it('keeps source-backed requirement artifacts and the v2 destination visible without animation', async () => {
    motionPreference.reduced = true;
    await renderOverview();
    const visual = screen.getByRole('img', {
      name: /Conversation flows through AI intelligence/,
    });
    for (const item of requirements
      .filter((r) => r.type === 'functional')
      .slice(0, 2)) {
      expect(within(visual).getByText(item.id)).toBeInTheDocument();
      expect(within(visual).getByText(item.title)).toBeInTheDocument();
    }
    expect(within(visual).getByText('POC v2')).toBeInTheDocument();
    expect(within(visual).getByText('Human approval')).toBeInTheDocument();
  });
  it('Start Demo restores the entire canonical initial state and navigates without playback', async () => {
    useDemoStore.setState({
      isRunning: true,
      isPaused: true,
      elapsedMs: 9000,
      currentStage: 'feedback',
      scopeApproved: true,
      baselineVersion: 'RB-002',
      currentPocVersion: 'v2',
      visibleTranscriptMessageIds: ['msg-003'],
      detectedRequirementIds: ['FR-003'],
      approvedChangeIds: ['CR-001'],
      demoSpeed: 4,
    });
    const router = await renderOverview();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Start Demo' }));
    expect(router.state.location.pathname).toBe('/session');
    expect(useDemoStore.getState()).toMatchObject(createInitialDemoState());
    expect(
      screen.getByRole('heading', { level: 1, name: 'Live Session' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Planned for Phase 3')).toBeInTheDocument();
  });
  it('Explore Workflow focuses the workflow while preserving route and state', async () => {
    const scroll = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scroll,
    });
    const router = await renderOverview();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Explore Workflow' }));
    expect(
      screen.getByRole('region', {
        name: 'From a conversation to a solution you can review',
      }),
    ).toHaveFocus();
    expect(scroll).toHaveBeenCalled();
    expect(router.state.location.pathname).toBe('/');
    expect(useDemoStore.getState().isRunning).toBe(false);
  });
  it('respects reduced motion when exploring the workflow', async () => {
    motionPreference.reduced = true;
    const scroll = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scroll,
    });
    await renderOverview();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Explore Workflow' }));
    expect(scroll).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'start',
    });
  });
  it('shows only catalog-derived counts and clearly qualifies pending outcomes', async () => {
    await renderOverview();
    const telemetry = screen.getByRole('region', {
      name: 'Illustrative demo metrics',
    });
    for (const metric of overviewMetrics) {
      expect(within(telemetry).getByText(metric.label)).toBeInTheDocument();
      expect(
        within(telemetry).getByText(metric.value, { selector: '.sr-only' }),
      ).toBeInTheDocument();
      expect(within(telemetry).getByText(metric.detail)).toBeInTheDocument();
    }
    expect(catalogMetrics.requirements).toBe(requirements.length);
    expect(catalogMetrics.clarifications).toBe(clarifications.length);
    expect(catalogMetrics.testsTotal).toBe(scenarioTestCases.length);
    expect(within(telemetry).queryByText('32 / 32')).not.toBeInTheDocument();
    expect(
      screen.getByText(/not production KPIs or live results/),
    ).toBeInTheDocument();
  });
});
describe('canonical metric derivation', () => {
  const catalog = {
    requirements,
    clarifications,
    scopeItems,
    traceNodes,
    traceEdges,
    testCases: scenarioTestCases,
  };
  it('changes counts and outcomes when the dataset changes', () => {
    const changed = deriveCatalogMetrics({
      ...catalog,
      requirements: requirements.slice(1),
      clarifications: clarifications.map((c) => ({
        ...c,
        status: 'resolved' as const,
      })),
      scopeItems: scopeItems.filter((s) => s.decision !== 'excluded'),
      testCases: scenarioTestCases.map((t) => ({
        ...t,
        status: 'passed' as const,
      })),
    });
    expect(changed.requirements).toBe(requirements.length - 1);
    expect(changed.resolvedClarifications).toBe(clarifications.length);
    expect(changed.excludedCapabilities).toBe(0);
    expect(changed.testsPassed).toBe(scenarioTestCases.length);
  });
  it('derives coverage from full connected paths, not just node presence', () => {
    expect(catalogMetrics.mappedRequirements).toBe(1);
    expect(catalogMetrics.traceabilityCoverage).toBe(
      Math.round(
        (1 / requirements.filter((r) => r.type === 'functional').length) * 100,
      ),
    );
    expect(
      deriveCatalogMetrics({
        ...catalog,
        traceEdges: traceEdges.filter((e) => e.source !== 'assignment-api'),
      }).mappedRequirements,
    ).toBe(0);
    expect(
      deriveCatalogMetrics({ ...catalog, traceEdges: [] }).traceabilityCoverage,
    ).toBe(0);
  });
  it('handles an empty catalog without invalid percentages', () => {
    const empty = deriveCatalogMetrics({
      requirements: [],
      clarifications: [],
      scopeItems: [],
      traceNodes: [],
      traceEdges: [],
      testCases: [],
    });
    expect(empty.requirements).toBe(0);
    expect(empty.traceabilityCoverage).toBe(0);
    expect(empty.testsTotal).toBe(0);
  });
});

describe('illustrative hero story order', () => {
  it('clarifies and approves before generation, validation and the version loop', () => {
    const { duration, ...steps } = heroStory;
    const timings = Object.values(steps);
    expect(timings).toEqual([...timings].sort((a, b) => a - b));
    expect(heroStory.resolved).toBeLessThan(heroStory.scope);
    expect(heroStory.scope).toBeLessThan(heroStory.prototype);
    expect(heroStory.validation).toBeLessThan(heroStory.feedback);
    expect(heroStory.feedback).toBeLessThan(heroStory.version);
    expect(heroStory.version).toBeLessThan(duration);
  });
});
