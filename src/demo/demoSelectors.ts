import type { DemoState } from '@/store/demoStore';
import { demoStory } from './demoStory';
import { demoChapters } from './demoTypes';
export const selectCurrentDemoStep = (s: DemoState) =>
  demoStory[s.director.stepIndex]!;
export const selectCurrentDemoChapter = (s: DemoState) =>
  demoChapters.find((c) => c.id === selectCurrentDemoStep(s).chapterId)!;
export const selectDemoProgress = (s: DemoState) =>
  s.director.status === 'completed'
    ? 100
    : Math.round((100 * s.director.stepIndex) / (demoStory.length - 1));
