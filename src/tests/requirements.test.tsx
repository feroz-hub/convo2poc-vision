import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { routeObjects } from '@/app/routeObjects';
import { useDemoStore } from '@/store/demoStore';
import { requirements } from '@/data/requirements';
import { transcript } from '@/data/transcript';
vi.mock('framer-motion', async (original) => ({
  ...(await original<typeof import('framer-motion')>()),
  useReducedMotion: () => true,
}));
const scrollInspector = vi.fn();
Element.prototype.scrollIntoView = scrollInspector;
async function renderRequirements(path = '/requirements') {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole('heading', {
    name: path.startsWith('/scope')
      ? 'POC Scope Studio'
      : path.startsWith('/clarifications')
        ? 'Clarification Center'
        : path.startsWith('/session')
          ? 'Live Session'
          : 'Requirement Intelligence',
    level: 1,
  });
  return router;
}
const catalog = () =>
  screen.getByRole('list', { name: 'Canonical requirement records' });
const inspector = () =>
  screen.getByRole('complementary', { name: /FR-|BR-|NFR-|ASM-|OQ-/ });
beforeEach(() => {
  useDemoStore.getState().reset();
  scrollInspector.mockClear();
});
describe('Requirement Intelligence workspace', () => {
  it('renders all canonical types, confidence and context with no capture claims', async () => {
    await renderRequirements();
    expect(within(catalog()).getAllByRole('button')).toHaveLength(
      requirements.length,
    );
    for (const r of requirements) expect(catalog()).toHaveTextContent(r.id);
    expect(
      screen.getByRole('progressbar', {
        name: 'Requirement readiness',
      }),
    ).toHaveAttribute('value', '0');
    expect(inspector()).toHaveTextContent('96%');
    expect(inspector()).toHaveTextContent('Illustrative AI confidence');
    expect(inspector()).toHaveTextContent('capture pending');
    expect(
      screen.getByLabelText('Structured requirement model'),
    ).toBeInTheDocument();
  });
  it('supports type, actor, search and status filters with a useful empty state', async () => {
    const user = userEvent.setup();
    await renderRequirements();
    await user.click(
      within(
        screen.getByRole('group', { name: 'Requirement type filters' }),
      ).getByRole('button', { name: 'Business Rules' }),
    );
    expect(within(catalog()).getAllByRole('button')).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    await user.click(
      within(screen.getByRole('group', { name: 'Actor filters' })).getByRole(
        'button',
        { name: /Administrator/ },
      ),
    );
    expect(within(catalog()).getAllByRole('button')).toHaveLength(
      requirements.filter((r) => r.actors.includes('Administrator')).length,
    );
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Requirement status filter' }),
      'needs-review',
    );
    expect(within(catalog()).getAllByRole('button')).toHaveLength(3);
    await user.type(
      screen.getByRole('textbox', { name: 'Search requirements' }),
      'no-such-requirement',
    );
    expect(
      screen.getByRole('heading', { name: 'No matching requirements' }),
    ).toBeInTheDocument();
  });
  it('selects a record, focuses its inspector with reduced motion and preserves the URL', async () => {
    const user = userEvent.setup();
    const router = await renderRequirements();
    await user.click(
      within(catalog()).getByRole('button', {
        name: /BR-004.*Closed request restrictions/,
      }),
    );
    await waitFor(() =>
      expect(inspector()).toHaveTextContent(
        'Closed requests cannot be edited except for administrator notes.',
      ),
    );
    await waitFor(() => expect(inspector()).toHaveFocus());
    expect(scrollInspector).toHaveBeenCalledWith({
      block: 'nearest',
      behavior: 'auto',
    });
    expect(router.state.location.search).toBe('?selected=BR-004');
  });
  it('honors deep-link selection and shows exact source and canonical relationships', async () => {
    await renderRequirements('/requirements?selected=FR-007');
    await waitFor(() =>
      expect(inspector()).toHaveTextContent('FR-007 · P1 approval'),
    );
    expect(inspector()).toHaveTextContent(
      transcript.find((m) => m.id === 'msg-008')!.text,
    );
    expect(inspector()).toHaveTextContent('02:30');
    for (const id of ['BR-001', 'BR-003', 'OQ-001', 'SC-004'])
      expect(inspector()).toHaveTextContent(id);
    expect(
      within(inspector()).getByRole('link', { name: /Review Clarification/ }),
    ).toHaveAttribute('href', '/clarifications?selected=OQ-001');
    expect(
      within(inspector()).getByRole('link', {
        name: /View POC Scope Decision/,
      }),
    ).toHaveAttribute('href', '/scope?selected=scope-FR-007');
  });
  it('navigates evidence to the Live Session recorded excerpt without advancing playback', async () => {
    const user = userEvent.setup();
    const router = await renderRequirements('/requirements?selected=FR-007');
    await user.click(
      within(inspector()).getByRole('link', {
        name: 'View in Live Session ↗',
      }),
    );
    await screen.findByRole('heading', { name: 'Live Session', level: 1 });
    expect(router.state.location.search).toBe('?source=msg-008');
    expect(useDemoStore.getState().elapsedMs).toBe(0);
    expect(
      screen.getByRole('complementary', { name: 'Linked transcript evidence' }),
    ).toHaveTextContent(transcript.find((m) => m.id === 'msg-008')!.text);
  });
  it('shows assumption review separately and updates readiness from shared consultant review', async () => {
    await renderRequirements('/requirements?selected=ASM-001');
    await waitFor(() => expect(inspector()).toHaveTextContent('ASM-001'));
    expect(inspector()).toHaveTextContent(
      'Prototype assumption · not a client fact',
    );
    expect(inspector()).toHaveTextContent('Needs Review');
    expect(inspector()).toHaveTextContent('Canonical scenario brief');
    act(() => {
      const s = useDemoStore.getState();
      s.start();
      s.tick(80000);
      s.reviewClarificationEvidence('OQ-001');
      s.acceptClarificationResolution('OQ-001');
    });
    expect(
      screen.getByRole('progressbar', {
        name: 'Requirement readiness',
      }),
    ).toHaveAttribute('value', '93');
  });
  it('navigates to the selected clarification and scope without editing either', async () => {
    const user = userEvent.setup();
    const router = await renderRequirements();
    act(() => useDemoStore.getState().selectScopeItem('scope-email'));
    await user.click(
      within(inspector()).getByRole('link', {
        name: /View POC Scope Decision/,
      }),
    );
    await screen.findByRole('heading', { name: 'POC Scope Studio' });
    await waitFor(() =>
      expect(useDemoStore.getState().selectedScopeItemId).toBe('scope-FR-007'),
    );
    expect(router.state.location.search).toBe('?selected=scope-FR-007');
    await user.click(
      screen.getByRole('link', { name: /FR-007 · View Requirement/ }),
    );
    await screen.findByRole('heading', {
      name: 'Requirement Intelligence',
      level: 1,
    });
    await user.click(
      within(inspector()).getByRole('link', { name: /Review Clarification/ }),
    );
    await screen.findByRole('heading', {
      name: 'Clarification Center',
      level: 1,
    });
    expect(router.state.location.search).toBe('?selected=OQ-001');
    await user.click(
      screen.getAllByRole('link', {
        name: 'Inspect requirement ↗',
      })[1]!,
    );
    await screen.findByRole('heading', {
      name: 'Requirement Intelligence',
      level: 1,
    });
    await waitFor(() =>
      expect(inspector()).toHaveTextContent('BR-001 · Valid priorities'),
    );
  });
  it('supports the Live Session bridge and reset without altering canonical data', async () => {
    const original = JSON.stringify(requirements);
    const user = userEvent.setup();
    await renderRequirements('/session');
    await user.click(
      screen.getByRole('link', {
        name: 'Inspect Requirement Intelligence →',
      }),
    );
    await screen.findByRole('heading', {
      name: 'Requirement Intelligence',
      level: 1,
    });
    await user.type(
      screen.getByRole('textbox', { name: 'Search requirements' }),
      'FR-001',
    );
    await user.click(screen.getByRole('button', { name: 'Reset scenario' }));
    expect(within(catalog()).getAllByRole('button')).toHaveLength(20);
    expect(JSON.stringify(requirements)).toBe(original);
  });
});
