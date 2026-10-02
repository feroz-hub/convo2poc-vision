import { useDemoStore } from '@/store/demoStore';
import { selectV2Ready } from '@/store/feedbackSelectors';
// Only Preview projects the selected version; all approved workspaces continue reading immutable v1.
export function usePreviewState<T = ReturnType<typeof useDemoStore.getState>>(
  selector?: (state: ReturnType<typeof useDemoStore.getState>) => T,
): T {
  const state = useDemoStore();
  const f = state.feedback;
  const v2 =
    state.currentPocVersion === 'v2' &&
    selectV2Ready(state) &&
    f.baseline &&
    f.v2Runtime;
  const projected = v2
    ? {
        ...state,
        pocBaseline: f.baseline,
        pocRuntime: f.v2Runtime!,
        generation: {
          ...state.generation,
          artifactStatuses: {
            ...state.generation.artifactStatuses,
            ...Object.fromEntries(
              Object.keys(f.delta.artifactStatuses).map((id) => [
                id,
                'validated' as const,
              ]),
            ),
          },
          testResults: f.delta.testResults,
        },
      }
    : state;
  return selector ? selector(projected) : (projected as T);
}
