import type { ReactNode } from 'react';
import { useDemoStore } from '@/store/demoStore';
export function GuidedControls({ children }: { children: ReactNode }) {
  const controlled = useDemoStore((s) => s.director.mode === 'autopilot');
  if (!controlled) return <>{children}</>;
  return (
    <fieldset
      className="guided-controlled"
      disabled
      title="Controlled by Guided Demo"
    >
      <legend>Guided Demo controlled · exit to interact manually</legend>
      {children}
    </fieldset>
  );
}
