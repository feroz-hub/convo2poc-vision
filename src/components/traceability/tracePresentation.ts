import {
  MessageSquare,
  GitBranch,
  FileCheck2,
  Layers3,
  Target,
  Code2,
  AppWindow,
  TestTube2,
} from 'lucide-react';
import type { TraceChain } from '@/types/traceExplorer';
export const traceIcons = {
  conversation: MessageSquare,
  clarification: GitBranch,
  requirement: FileCheck2,
  scope: Layers3,
  criterion: Target,
  artifact: Code2,
  feature: AppWindow,
  test: TestTube2,
};
export function linkedTraceIds(chain: TraceChain, selectedId: string | null) {
  if (!selectedId) return new Set(chain.nodes.map((n) => n.id));
  const walk = (reverse: boolean) => {
    const visited = new Set([selectedId]);
    const todo = [selectedId];
    while (todo.length) {
      const id = todo.shift()!;
      for (const e of chain.edges) {
        const next = reverse ? e.source : e.target;
        if ((reverse ? e.target : e.source) === id && !visited.has(next)) {
          visited.add(next);
          todo.push(next);
        }
      }
    }
    return visited;
  };
  return new Set([...walk(false), ...walk(true)]);
}
