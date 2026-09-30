import { useNavigate } from 'react-router-dom';
import { useDemoStore } from '@/store/demoStore';
import { OverviewHero } from '@/components/overview/OverviewHero';
import { WorkflowJourney } from '@/components/overview/WorkflowJourney';
import { DemoTelemetry } from '@/components/overview/DemoTelemetry';
import { StoryboardStrip } from '@/components/overview/StoryboardStrip';
import { ProcessComparison } from '@/components/overview/ProcessComparison';
import { OverviewFinalCTA } from '@/components/overview/OverviewFinalCTA';
export function OverviewPage() {
  const navigate = useNavigate();
  const reset = useDemoStore((state) => state.reset);
  const start = () => {
    reset();
    navigate('/session');
  };
  return (
    <div className="overview-page">
      <OverviewHero onStart={start} />
      <WorkflowJourney />
      <StoryboardStrip />
      <ProcessComparison />
      <DemoTelemetry />
      <OverviewFinalCTA onStart={start} />
    </div>
  );
}
