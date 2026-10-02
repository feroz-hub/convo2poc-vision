import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routeObjects } from '@/app/routeObjects';
import { AppProviders } from '@/app/providers';
import { useDemoStore } from '@/store/demoStore';
import { clarifications, requirements } from '@/data/requirements';
import { transcript } from '@/data/transcript';
const reduced = vi.hoisted(() => ({ value: false }));
vi.mock('framer-motion', async (original) => ({
  ...(await original<typeof import('framer-motion')>()),
  useReducedMotion: () => reduced.value,
}));
async function renderCenter(path = '/clarifications') {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole('heading', { name: 'Clarification Center' });
  return router;
}
beforeEach(() => {
  useDemoStore.getState().reset();
  reduced.value = false;
  Element.prototype.scrollTo = vi.fn();
});
describe('Clarification Center', () => {
  it('renders canonical queue, exact priority evidence and gated proposed outputs', async () => {
    await renderCenter();
    const queue = screen.getByRole('list', { name: 'Clarification queue' });
    for (const q of clarifications)
      expect(
        within(queue).getByRole('button', { name: new RegExp(q.id) }),
      ).toBeInTheDocument();
    const workspace = screen.getByRole('region', {
      name: 'Resolution workspace',
    });
    expect(workspace).toHaveTextContent(
      transcript.find((m) => m.id === 'msg-006')!.text,
    );
    expect(workspace).toHaveTextContent(
      transcript.find((m) => m.id === 'msg-008')!.text,
    );
    expect(workspace).toHaveTextContent(clarifications[0]!.reason);
    const outputs = screen.getByRole('list', { name: 'Resolution outputs' });
    for (const id of ['BR-001', 'FR-007'])
      expect(outputs).toHaveTextContent(
        requirements.find((r) => r.id === id)!.description,
      );
    expect(
      screen.getByRole('button', { name: 'Accept Resolution' }),
    ).toBeDisabled();
  });
  it('selects from deep links and keyboard-accessible queue, preserving the URL', async () => {
    const user = userEvent.setup();
    const router = await renderCenter('/clarifications?selected=OQ-002');
    expect(
      screen.getByRole('region', { name: 'Resolution workspace' }),
    ).toHaveTextContent(clarifications[1]!.question);
    await user.click(screen.getByRole('button', { name: /OQ-003/ }));
    expect(router.state.location.search).toBe('?selected=OQ-003');
    expect(
      screen.getByRole('region', { name: 'Resolution workspace' }),
    ).toHaveTextContent(transcript.find((m) => m.id === 'msg-013')!.text);
    expect(screen.getByRole('button', { name: /OQ-003/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
  it('reviews, confirms, filters and reopens without approving scope or advancing playback', async () => {
    const user = userEvent.setup();
    await renderCenter();
    act(() => {
      useDemoStore.getState().start();
      useDemoStore.getState().tick(80000);
    });
    await user.click(screen.getByRole('button', { name: 'Review Evidence' }));
    await user.click(screen.getByRole('button', { name: 'Accept Resolution' }));
    expect(
      screen.getByRole('list', { name: 'Resolution outputs' }),
    ).toHaveTextContent('Confirmed by consultant');
    expect(
      screen.getByRole('progressbar', { name: 'Clarification POC readiness' }),
    ).toHaveAttribute('value', '93');
    await user.click(
      within(
        screen.getByRole('group', { name: 'Filter clarifications' }),
      ).getByRole('button', { name: 'Resolved' }),
    );
    expect(
      within(
        screen.getByRole('list', { name: 'Clarification queue' }),
      ).getAllByRole('button'),
    ).toHaveLength(1);
    await user.click(
      screen.getByRole('button', { name: 'Reopen Clarification' }),
    );
    expect(
      screen.getByText('No clarifications in this filter.'),
    ).toBeInTheDocument();
    expect(useDemoStore.getState().liveReadiness).toBe(90);
    expect(useDemoStore.getState().elapsedMs).toBe(80000);
    expect(useDemoStore.getState().scopeApproved).toBe(false);
  });
  it('edits suggestions without changing canonical data, rejects resolutions and resets', async () => {
    const user = userEvent.setup();
    const canonical = clarifications[0]!.question;
    await renderCenter();
    await user.click(screen.getByRole('button', { name: 'Edit question' }));
    await user.clear(
      screen.getByRole('textbox', { name: 'Suggested question' }),
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Suggested question' }),
      'Which priority needs approval?',
    );
    await user.click(screen.getByRole('button', { name: 'Save question' }));
    expect(
      screen.getByRole('region', { name: 'Resolution workspace' }),
    ).toHaveTextContent('Which priority needs approval?');
    expect(clarifications[0]!.question).toBe(canonical);
    await user.click(screen.getByRole('button', { name: 'Accept suggestion' }));
    await user.click(screen.getByRole('button', { name: 'Review Evidence' }));
    await user.click(screen.getByRole('button', { name: 'Reject Resolution' }));
    expect(screen.getByText(/Resolution rejected/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Accept Resolution' }),
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Reset scenario' }));
    expect(
      screen.getByRole('region', { name: 'Resolution workspace' }),
    ).toHaveTextContent(canonical);
    expect(useDemoStore.getState().clarificationHistory).toEqual([]);
  });
  it('navigates to canonical session evidence without revealing or advancing the transcript', async () => {
    const user = userEvent.setup();
    const router = await renderCenter();
    await user.click(
      screen.getByRole('link', { name: /View in Live Session/ }),
    );
    await screen.findByRole('heading', { name: 'Live Session', level: 1 });
    expect(router.state.location.search).toBe('?source=msg-008');
    expect(
      screen.getByRole('complementary', { name: 'Linked transcript evidence' }),
    ).toHaveTextContent(transcript.find((m) => m.id === 'msg-008')!.text);
    expect(useDemoStore.getState().visibleTranscriptMessageIds).toEqual([]);
    expect(useDemoStore.getState().elapsedMs).toBe(0);
  });
  it('preselects the Live Session ambiguity through Review Clarification', async () => {
    const user = userEvent.setup();
    const router = await renderCenter();
    await user.click(screen.getByRole('link', { name: 'Live Session' }));
    await screen.findByRole('heading', { name: 'Live Session', level: 1 });
    act(() => {
      useDemoStore.getState().start();
      useDemoStore.getState().tick(28000);
      useDemoStore.getState().pause();
    });
    await user.click(
      screen.getByRole('link', { name: /Review Clarification/ }),
    );
    await screen.findByRole('heading', { name: 'Clarification Center' });
    expect(router.state.location.search).toBe('?selected=OQ-001');
    expect(useDemoStore.getState().selectedClarificationId).toBe('OQ-001');
    expect(useDemoStore.getState().elapsedMs).toBe(28000);
  });
  it('keeps captured and governed state while focusing a revealed session source', async () => {
    const user = userEvent.setup();
    const router = await renderCenter();
    act(() => {
      useDemoStore.getState().start();
      useDemoStore.getState().tick(80000);
      useDemoStore.getState().reviewClarificationEvidence('OQ-001');
      useDemoStore.getState().acceptClarificationResolution('OQ-001');
    });
    await user.click(
      screen.getByRole('link', { name: 'View in Live Session' }),
    );
    await screen.findByRole('heading', { name: 'Live Session', level: 1 });
    expect(router.state.location.search).toBe('?source=msg-008');
    expect(document.getElementById('transcript-msg-008')).toHaveFocus();
    expect(useDemoStore.getState().elapsedMs).toBe(80000);
    expect(useDemoStore.getState().liveReadiness).toBe(93);
    expect(useDemoStore.getState().resolvedClarificationIds).toEqual([
      'OQ-001',
    ]);
  });
  it('discards an unsaved question draft when resetting the scenario', async () => {
    const user = userEvent.setup();
    await renderCenter();
    await user.click(screen.getByRole('button', { name: 'Edit question' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Suggested question' }),
      ' draft',
    );
    await user.click(screen.getByRole('button', { name: 'Reset scenario' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Resolution workspace' }),
    ).toHaveTextContent(clarifications[0]!.question);
  });
  it('renders meaningful status and evidence under reduced motion', async () => {
    reduced.value = true;
    await renderCenter();
    expect(screen.getByRole('status')).toHaveTextContent('OQ-001: Open');
    expect(
      screen.getByRole('region', { name: 'Resolution workspace' }),
    ).toHaveTextContent('High priority has no measurable definition.');
  });
});
