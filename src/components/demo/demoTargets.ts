import { useCallback } from 'react';
import { useDemoStore } from '@/store/demoStore';
import { demoStory } from '@/demo/demoStory';
import type { DemoTargetId } from '@/demo/demoTypes';
// UI refs only: no domain state, DOM selectors, synthetic clicks or workflow actions.
const nodes = new Map<DemoTargetId, HTMLElement>();
const listeners = new Map<DemoTargetId, Set<(node: HTMLElement) => void>>();
export function watchDemoTarget(
  id: DemoTargetId,
  callback: (node: HTMLElement) => void,
) {
  const set = listeners.get(id) ?? new Set();
  listeners.set(id, set);
  set.add(callback);
  const node = nodes.get(id);
  if (node) callback(node);
  return () => {
    set.delete(callback);
    if (!set.size) listeners.delete(id);
  };
}
export function useDemoTarget(id: DemoTargetId) {
  const active = useDemoStore(
    (s) =>
      s.director.mode === 'autopilot' &&
      !s.director.routeBlocked &&
      demoStory[s.director.stepIndex]?.spotlight === id,
  );
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        nodes.set(id, node);
        listeners.get(id)?.forEach((fn) => fn(node));
      } else nodes.delete(id);
    },
    [id],
  );
  return {
    ref,
    'data-demo-target': id,
    'data-demo-active': active ? 'true' : undefined,
  };
}
