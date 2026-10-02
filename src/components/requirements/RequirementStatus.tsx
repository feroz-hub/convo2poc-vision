import {
  CircleDot,
  CheckCircle2,
  TriangleAlert,
  ClipboardCheck,
  ShieldCheck,
} from 'lucide-react';
import { intelligenceStatusLabels } from '@/store/requirementSelectors';
import type { IntelligenceStatus } from '@/types/domain';
const statusIcons = {
  detected: CircleDot,
  confirmed: CheckCircle2,
  'needs-clarification': TriangleAlert,
  'needs-review': ClipboardCheck,
  acknowledged: ShieldCheck,
};
export function RequirementStatus({ status }: { status: IntelligenceStatus }) {
  const Icon = statusIcons[status];
  return (
    <span className={`ri-status ${status}`}>
      <Icon size={13} aria-hidden="true" />
      {intelligenceStatusLabels[status]}
    </span>
  );
}
