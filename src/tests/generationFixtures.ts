import { useDemoStore } from '@/store/demoStore';
import { clarifications } from '@/data/requirements';
export function approveGenerationBaseline() {
  const a = useDemoStore.getState();
  a.start();
  a.tick(80000);
  for (const q of clarifications) {
    a.reviewClarificationEvidence(q.id);
    a.acceptClarificationResolution(q.id);
  }
  for (const key of [
    'requirements',
    'assumptions',
    'scope',
    'successCriteria',
  ] as const)
    a.setScopeReview(key, true);
  a.approveScope();
  return a;
}
