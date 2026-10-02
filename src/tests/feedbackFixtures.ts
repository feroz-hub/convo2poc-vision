import { preparePreview } from './previewFixtures';
import { useDemoStore } from '@/store/demoStore';
import { pocReviewItems } from '@/data/pocRuntime';
import { feedbackReviews } from '@/data/feedbackEvolution';
export function prepareFeedback() {
  preparePreview();
  const a = useDemoStore.getState();
  pocReviewItems.forEach((i) =>
    a.performPocAction({ type: 'review', key: i.key, checked: true }),
  );
  a.performPocAction({ type: 'approve-review' });
  return useDemoStore.getState();
}
export function analyzeFeedback() {
  prepareFeedback();
  const a = useDemoStore.getState();
  a.startFeedback();
  a.tick(20000);
  return useDemoStore.getState();
}
export function approveFeedback() {
  analyzeFeedback();
  const a = useDemoStore.getState();
  feedbackReviews.forEach((i) => a.reviewChange(i.key, true));
  a.decideChange('approve');
  return useDemoStore.getState();
}
export function prepareV2() {
  approveFeedback();
  const a = useDemoStore.getState();
  a.startDelta();
  a.tick(32000);
  return useDemoStore.getState();
}
