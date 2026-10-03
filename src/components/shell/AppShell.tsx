import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { attachDemoClock } from '@/simulation/demoEngine';
import { useDemoStore } from '@/store/demoStore';
import { useDemoDirector } from '@/components/demo/useDemoDirector';
import { DemoPresenterBar } from '@/components/demo/DemoPresenterBar';
import { DemoCompletion } from '@/components/demo/DemoCompletion';
import '@/styles/demoDirector.css';
export function AppShell() {
  useDemoDirector();
  const director = useDemoStore((s) => s.director);
  const activeClock = useDemoStore((s) =>
    s.director.mode === 'autopilot'
      ? s.director.status === 'running' &&
        s.director.routeReady &&
        !s.director.routeBlocked
      : s.isRunning ||
        s.generation.status === 'running' ||
        s.feedback.capture.status === 'running' ||
        s.feedback.delta.status === 'running',
  );
  useEffect(
    () =>
      activeClock
        ? attachDemoClock((delta) => useDemoStore.getState().tick(delta))
        : undefined,
    [activeClock],
  );
  const [open, setOpen] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const sidebar =
      shell.current?.querySelector<HTMLElement>('#app-navigation');
    const focusable = () =>
      Array.from(
        sidebar?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled)',
        ) ?? [],
      );
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const controls = focusable();
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      trigger?.focus();
    };
  }, [open]);
  return (
    <div
      ref={shell}
      className={`app-shell ${director.mode === 'autopilot' ? 'director-active' : ''} ${director.mode === 'autopilot' && director.presentationMode ? 'guided-layout' : ''}`}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="workspace" inert={open}>
        <TopBar onOpen={() => setOpen(true)} navigationOpen={open} />
        <main id="main-content" tabIndex={-1}>
          {director.mode === 'autopilot' && director.status === 'completed' ? (
            <DemoCompletion />
          ) : (
            <Outlet />
          )}
        </main>
        <footer className="app-footer">
          <span>Convo2POC · Interactive vision prototype</span>
          <span>Sandbox environment · Not production ready</span>
        </footer>
      </div>
      <DemoPresenterBar />
    </div>
  );
}
