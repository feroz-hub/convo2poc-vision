import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { useDemoStore } from '@/store/demoStore';
import { demoStory } from '@/demo/demoStory';
import { watchDemoTarget } from './demoTargets';
import '@/demo/demoValidation';
export function useDemoDirector() {
  const mode = useDemoStore((s) => s.director.mode),
    index = useDemoStore((s) => s.director.stepIndex),
    revision = useDemoStore((s) => s.director.navigationRevision);
  const ready = useDemoStore((s) => s.director.routeReady),
    blocked = useDemoStore((s) => s.director.routeBlocked);
  const navigate = useNavigate(),
    location = useLocation(),
    reduced = useReducedMotion();
  const route = location.pathname + location.search,
    step = demoStory[index]!;
  useEffect(() => {
    if (mode === 'autopilot') {
      if (route !== step.route) navigate(step.route);
      else useDemoStore.getState().acknowledgeDemoRoute();
    }
    // Navigation is issued once per director intent, not on manual route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, revision]);
  useEffect(() => {
    if (mode !== 'autopilot' || blocked) return;
    if (route === step.route && !ready)
      useDemoStore.getState().acknowledgeDemoRoute();
    else if (route !== step.route && ready)
      useDemoStore.getState().blockDemoRoute();
  }, [mode, route, step.route, ready, blocked]);
  useEffect(() => {
    if (mode !== 'autopilot' || !ready || blocked || !step.spotlight) return;
    let scrolled = false;
    return watchDemoTarget(step.spotlight, (node) => {
      if (scrolled) return;
      scrolled = true;
      node.scrollIntoView?.({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'center',
      });
    });
  }, [mode, ready, blocked, index, step.spotlight, reduced]);
}
