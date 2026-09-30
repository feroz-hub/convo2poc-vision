import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { MotionConfig } from 'framer-motion';
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
