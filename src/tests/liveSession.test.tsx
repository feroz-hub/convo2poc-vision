import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routeObjects } from '@/app/routeObjects';
import { AppProviders } from '@/app/providers';
import { useDemoStore } from '@/store/demoStore';
import { sessionEvents } from '@/simulation/sessionEvents';
import { requirements } from '@/data/requirements';
const reducedPreference = vi.hoisted(() => ({ value: false }));
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useReducedMotion: () => reducedPreference.value };
});
const renderSession = async () => {
  render(
    <AppProviders>
      <RouterProvider
        router={createMemoryRouter(routeObjects, {
          initialEntries: ['/session'],
        })}
      />
    </AppProviders>,
  );
  await screen.findByRole('heading', { level: 1, name: 'Live Session' });
};
beforeEach(() => {
  reducedPreference.value = false;
  useDemoStore.getState().reset();
  Element.prototype.scrollTo = vi.fn();
});
afterEach(() => vi.useRealTimers());
describe('Live Session route', () => {
  it('renders a waiting session and accessible playback controls', async () => {
    await renderSession();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Live Session' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Live Session' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('heading', { name: 'Waiting for requirement signals' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Run Demo' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeDisabled();
    expect(
      screen.getByRole('progressbar', { name: 'Illustrative POC readiness' }),
    ).toHaveAttribute('value', '0');
    expect(screen.queryByText('FR-001')).not.toBeInTheDocument();
  });
  it('operates Run, Pause, Resume, Next, Restart and Reset through the shared store', async () => {
    const user = userEvent.setup();
    await renderSession();
    await user.click(screen.getByRole('button', { name: 'Run Demo' }));
    expect(useDemoStore.getState().isRunning).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(useDemoStore.getState().isPaused).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Next event' }));
    expect(useDemoStore.getState().eventCursor).toBe(1);
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(useDemoStore.getState().isRunning).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Restart' }));
    expect(useDemoStore.getState().visibleInsightEventIds).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Reset scenario' }));
    expect(useDemoStore.getState().isRunning).toBe(false);
    expect(
      screen.getByText('The conversation starts here'),
    ).toBeInTheDocument();
  });
  it('reveals the ambiguity alert at its event and reports later answer without resolving', async () => {
    await renderSession();
    const target = sessionEvents.find(
      (e) => e.id === 'event-insight-clarify-OQ-001',
    )!;
    act(() => {
      useDemoStore.getState().start();
      useDemoStore.getState().tick(target.at - 1);
    });
    expect(
      screen.queryByRole('heading', { name: /Ambiguity detected/ }),
    ).not.toBeInTheDocument();
    act(() => useDemoStore.getState().tick(1));
    expect(
      screen.getByRole('heading', { name: /Ambiguity detected/ }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/What determines whether a request is high priority/)
        .length,
    ).toBeGreaterThan(0);
    act(() => useDemoStore.getState().tick(10000));
    expect(
      screen.getByText(/Client response captured at 02:30/),
    ).toBeInTheDocument();
    const results = screen.getByRole('list', {
      name: 'Confirmed priority requirements',
    });
    expect(results).toHaveTextContent('BR-001 confirmed');
    expect(results).toHaveTextContent('FR-007 confirmed');
    expect(results).toHaveTextContent('POC readiness increased');
    expect(
      screen.getByRole('heading', { name: /Priority requirements confirmed/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Illustrative POC readiness' }),
    ).toHaveAttribute('value', '71');
    expect(useDemoStore.getState().resolvedClarificationIds).toEqual([]);
    expect(
      screen.getByText(
        requirements.find((r) => r.id === 'FR-001')!.description,
      ),
    ).toBeInTheDocument();
  });
  it('preserves manual scroll position and offers Return to live', async () => {
    await renderSession();
    act(() => {
      useDemoStore.getState().start();
      useDemoStore.getState().tick(15000);
    });
    const feed = screen.getByRole('region', {
      name: 'Client conversation transcript',
    });
    Object.defineProperties(feed, {
      scrollHeight: { value: 1000, configurable: true },
      clientHeight: { value: 300, configurable: true },
      scrollTop: { value: 100, writable: true, configurable: true },
    });
    fireEvent.scroll(feed);
    vi.mocked(feed.scrollTo).mockClear();
    act(() => useDemoStore.getState().tick(5000));
    expect(feed.scrollTo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Return to live' }));
    expect(feed.scrollTo).toHaveBeenCalledWith({
      top: 1000,
      behavior: 'smooth',
    });
  });
  it('renders reduced-motion playback with semantic transcript and polite concise announcements', async () => {
    reducedPreference.value = true;
    const media = vi
      .spyOn(window, 'matchMedia')
      .mockImplementation((query) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: () => false,
        onchange: null,
      }));
    await renderSession();
    act(() => {
      useDemoStore.getState().start();
      useDemoStore.getState().tick(15000);
    });
    expect(
      screen.getByRole('list', { name: 'Transcript messages' }),
    ).toBeInTheDocument();
    const announcement = screen.getByText(/^Requirement confirmed: FR-002$/);
    expect(announcement).toHaveAttribute('aria-live', 'polite');
    expect(announcement.textContent!.length).toBeLessThan(100);
    expect(document.querySelector('.source-signal')).not.toBeInTheDocument();
    const feed = screen.getByRole('region', {
      name: 'Client conversation transcript',
    });
    Object.defineProperties(feed, {
      scrollHeight: { value: 1000, configurable: true },
      clientHeight: { value: 300, configurable: true },
      scrollTop: { value: 100, writable: true, configurable: true },
    });
    fireEvent.scroll(feed);
    vi.mocked(feed.scrollTo).mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Return to live' }));
    expect(feed.scrollTo).toHaveBeenCalledWith({
      top: 1000,
      behavior: 'instant',
    });
    media.mockRestore();
  });
});
