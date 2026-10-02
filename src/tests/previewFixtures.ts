import { approveGenerationBaseline } from './generationFixtures';
import { useDemoStore } from '@/store/demoStore';
export function preparePreview() {
  approveGenerationBaseline();
  const actions = useDemoStore.getState();
  actions.startGeneration();
  actions.tick(80000);
  return useDemoStore.getState();
}
