import { routes } from '@/app/routes';
import { requirements, clarifications } from '@/data/requirements';
import { demoChapters, demoTargets, type DemoStep } from './demoTypes';
import { demoConditionNames } from './demoConditions';
import { simulationTarget } from './demoDirector';
import { demoStory } from './demoStory';
const actionNames = [
  'clarification',
  'select-requirement',
  'approve-scope',
  'p1-create',
  'p1-assign',
  'p1-blocked',
  'p1-approve',
  'p1-progress',
  'p1-history',
  'feature-evidence',
  'approve-v1',
  'trace-p1',
  'approve-change',
  'p2-v1',
  'p2-v2',
];
export function validateDemoStory(story: readonly DemoStep[] = demoStory) {
  const ids = new Set<string>();
  const errors: string[] = [];
  story.forEach((s, i) => {
    if (ids.has(s.id)) errors.push(`Duplicate step ${s.id}`);
    ids.add(s.id);
    if (!demoChapters.some((c) => c.id === s.chapterId))
      errors.push(`Invalid chapter ${s.id}`);
    if (!routes.some((r) => r.path === s.route.split('?')[0]))
      errors.push(`Invalid route ${s.id}`);
    if (!demoConditionNames.includes(s.condition))
      errors.push(`Unknown condition ${s.id}`);
    if (s.spotlight && !(s.spotlight in demoTargets))
      errors.push(`Unknown target ${s.id}`);
    if (!s.narration || !Number.isFinite(s.durationMs) || s.durationMs < 0)
      errors.push(`Invalid presentation ${s.id}`);
    if (s.action && !actionNames.includes(s.action.type))
      errors.push(`Unknown action ${s.id}`);
    if (
      s.action?.type === 'clarification' &&
      s.action.ids.some((id) => !clarifications.some((q) => q.id === id))
    )
      errors.push(`Invalid clarification ${s.id}`);
    if (s.action?.type === 'select-requirement') {
      const id = s.action.id;
      if (!requirements.some((r) => r.id === id))
        errors.push(`Invalid requirement ${s.id}`);
    }
    if (
      s.action &&
      [
        'clarification',
        'approve-scope',
        'approve-v1',
        'approve-change',
      ].includes(s.action.type) &&
      !s.governance
    )
      errors.push(`Missing governance ${s.id}`);
    if (s.governance && (!s.action || s.durationMs < 3000))
      errors.push(`Invalid governance ${s.id}`);
    if (s.simulation) {
      const milestones: Record<string, readonly string[]> = {
        session: ['requirements', 'ambiguity', 'answer', 'complete'],
        generation: ['architecture', 'parallel', 'tests', 'complete'],
        feedback: ['cr001', 'complete'],
        delta: ['complete'],
      };
      if (!milestones[s.simulation.lane]?.includes(s.simulation.until))
        errors.push(`Invalid milestone ${s.id}`);
      try {
        if (
          !Number.isFinite(simulationTarget(s.simulation)) ||
          s.simulation.presentationMs <= 0 ||
          s.simulation.presentationMs > s.durationMs
        )
          errors.push(`Invalid simulation ${s.id}`);
      } catch {
        errors.push(`Invalid milestone ${s.id}`);
      }
    }
    if (s.completion ? i !== story.length - 1 : !story[i + 1])
      errors.push(`Invalid next transition ${s.id}`);
    if (i > 0 && !story[i - 1])
      errors.push(`Invalid previous transition ${s.id}`);
  });
  if (!story.length || !story.at(-1)?.completion)
    errors.push('Missing completion step');
  if (errors.length)
    throw new Error(`Invalid demo story: ${errors.join('; ')}`);
  return true;
}
if (import.meta.env.DEV) validateDemoStory();
